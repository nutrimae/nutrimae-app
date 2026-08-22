import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTypebotClient } from "@/lib/nutribot/typebotClient";
import { createEvolutionClient } from "@/lib/nutribot/evolutionClient";
import { handleWhatsAppEvent } from "@/lib/nutribot/orchestrator";
import { logError, logInfo } from "@/lib/nutribot/logger";

/**
 * Webhook do NutriBot — substitui o workflow n8n (nutribot.workflow.json).
 * Recebe eventos da Evolution API (self-hosted, servidor Hetzner) direto
 * neste app Next.js, sem n8n no meio.
 *
 * A lógica de negócio (dedup, rotas, Typebot, Evolution API) é a MESMA já
 * testada em produção — ver src/lib/nutribot/orchestrator.ts, portado
 * literalmente de nutribot-n8n/src/orchestrator.js. Nada de comportamento
 * foi redesenhado nesta migração, só a infraestrutura por baixo (Postgres
 * próprio → Supabase, n8n → rota HTTP).
 *
 * Segurança: a Evolution API não assina o payload do webhook (mesma
 * situação de antes, no n8n — não havia verificação nenhuma lá também).
 * Como registramos essa URL nós mesmos na Evolution API, adicionamos uma
 * proteção mínima extra: um token compartilhado na query string
 * (?token=...), verificado contra WHATSAPP_WEBHOOK_TOKEN. Configure o
 * mesmo valor ao registrar o webhook na Evolution API (POST
 * /webhook/set/{instance}).
 *
 * Variáveis de ambiente necessárias: EVOLUTION_API_URL, EVOLUTION_API_KEY,
 * EVOLUTION_INSTANCE_NAME, TYPEBOT_BASE_URL, TYPEBOT_PUBLIC_ID,
 * TYPEBOT_API_TOKEN (opcional), SESSION_TTL_HOURS, ERROR_MESSAGE_COOLDOWN_MINUTES,
 * WHATSAPP_SEND_TIMEOUT_MS, WHATSAPP_WEBHOOK_TOKEN (opcional).
 */

interface EvolutionWebhookPayload {
  event?: string;
  instance?: string;
  data?: unknown;
}

function verifyWebhookToken(request: Request): boolean {
  const expected = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (!expected) return true; // sem token configurado: mantém o comportamento atual (sem verificação)

  const { searchParams } = new URL(request.url);
  return searchParams.get("token") === expected;
}

export async function POST(request: Request) {
  if (!verifyWebhookToken(request)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  let payload: EvolutionWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // A Evolution API pode ser configurada pra mandar vários tipos de evento
  // (conexão, presença, etc.) pro mesmo webhook — só "messages.upsert"
  // interessa aqui (mensagem recebida).
  if (payload.event && payload.event !== "messages.upsert") {
    return NextResponse.json({ ok: true, ignored: payload.event });
  }

  const admin = createAdminClient();

  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstanceName = process.env.EVOLUTION_INSTANCE_NAME;
  const typebotBaseUrl = process.env.TYPEBOT_BASE_URL;
  const typebotPublicId = process.env.TYPEBOT_PUBLIC_ID;

  if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstanceName || !typebotBaseUrl || !typebotPublicId) {
    logError("whatsapp-webhook.missing_env", {});
    return NextResponse.json({ error: "missing_configuration" }, { status: 500 });
  }

  const evolution = createEvolutionClient({
    baseUrl: evolutionApiUrl,
    instanceName: evolutionInstanceName,
    apiKey: evolutionApiKey,
    timeoutMs: Number(process.env.WHATSAPP_SEND_TIMEOUT_MS ?? 10_000),
  });

  const typebot = createTypebotClient({
    baseUrl: typebotBaseUrl,
    publicId: typebotPublicId,
    apiToken: process.env.TYPEBOT_API_TOKEN || undefined,
    timeoutMs: Number(process.env.TYPEBOT_TIMEOUT_MS ?? 15_000),
  });

  try {
    const result = await handleWhatsAppEvent(payload, {
      db: admin,
      typebot,
      evolution,
      sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 24),
      errorCooldownMinutes: Number(process.env.ERROR_MESSAGE_COOLDOWN_MINUTES ?? 10),
    });
    logInfo("whatsapp-webhook.processed", { route: result.route, sent: result.sent });
  } catch (err) {
    logError("whatsapp-webhook.failed", { errorMessage: err instanceof Error ? err.message : String(err) });
  }

  // A Evolution API espera 200 rapidamente — não reenviar em loop.
  return NextResponse.json({ ok: true });
}
