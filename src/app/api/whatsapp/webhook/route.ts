import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTypebotClient } from "@/lib/nutribot/typebotClient";
import { createEvolutionClient } from "@/lib/nutribot/evolutionClient";
import { createWhatsAppCloudClient } from "@/lib/nutribot/whatsappCloudClient";
import { normalizeEvent, normalizeMetaEvent } from "@/lib/nutribot/normalize";
import { handleWhatsAppEvent, type WhatsAppSendClient } from "@/lib/nutribot/orchestrator";
import { logError, logInfo } from "@/lib/nutribot/logger";

/**
 * Webhook do NutriBot. Aceita dois provedores em paralelo durante a
 * migração da Evolution API (self-hosted, biblioteca não-oficial — fica
 * sujeita a bloqueio de envio quando o WhatsApp detecta automação) pra
 * WhatsApp Cloud API (Meta, oficial). Qual provedor processa a mensagem é
 * decidido pelo FORMATO do payload recebido, não por configuração manual:
 * a Cloud API sempre manda `{"object": "whatsapp_business_account", ...}`
 * no nível raiz; a Evolution API nunca manda esse campo.
 *
 * Depois que a migração terminar de verdade (número da Cloud API
 * registrado, testado, e o webhook da Evolution API desativado no
 * servidor), dá pra remover o branch antigo — mantido por enquanto pra não
 * derrubar o bot em produção enquanto a Cloud API ainda está em teste.
 *
 * Segurança:
 * - Evolution API: token compartilhado na query string (?token=...),
 *   verificado contra WHATSAPP_WEBHOOK_TOKEN — ela não assina o payload.
 * - Cloud API: a Meta faz um handshake de verificação via GET na primeira
 *   configuração (hub.mode/hub.verify_token/hub.challenge), verificado
 *   contra META_WHATSAPP_VERIFY_TOKEN. Os POSTs em si também exigem o
 *   mesmo ?token=... na URL, pelo mesmo motivo — mais simples que validar
 *   a assinatura X-Hub-Signature-256 por enquanto.
 */

function verifyWebhookToken(request: Request): boolean {
  const expected = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (!expected) return false; // sem token configurado: nunca aceita (fail-closed)

  const { searchParams } = new URL(request.url);
  return searchParams.get("token") === expected;
}

/** Handshake de verificação do webhook da Meta — chamado uma vez quando você registra a URL no painel. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expected = process.env.META_WHATSAPP_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && verifyToken === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification_failed" }, { status: 403 });
}

export async function POST(request: Request) {
  if (!verifyWebhookToken(request)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const isMetaPayload =
    typeof payload === "object" && payload !== null && (payload as { object?: unknown }).object === "whatsapp_business_account";

  const admin = createAdminClient();

  const typebotBaseUrl = process.env.TYPEBOT_BASE_URL;
  const typebotPublicId = process.env.TYPEBOT_PUBLIC_ID;
  if (!typebotBaseUrl || !typebotPublicId) {
    logError("whatsapp-webhook.missing_env", {});
    return NextResponse.json({ error: "missing_configuration" }, { status: 500 });
  }
  const typebot = createTypebotClient({
    baseUrl: typebotBaseUrl,
    publicId: typebotPublicId,
    apiToken: process.env.TYPEBOT_API_TOKEN || undefined,
    timeoutMs: Number(process.env.TYPEBOT_TIMEOUT_MS ?? 15_000),
  });

  let event;
  let sendClient: WhatsAppSendClient;

  if (isMetaPayload) {
    const metaAccessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
    const metaPhoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    if (!metaAccessToken || !metaPhoneNumberId) {
      logError("whatsapp-webhook.missing_meta_env", {});
      return NextResponse.json({ error: "missing_configuration" }, { status: 500 });
    }

    const normalized = normalizeMetaEvent(payload);
    if (!normalized) {
      // Webhook de status (entregue/lido) ou payload sem mensagem — nada a processar, mas confirma recebimento.
      return NextResponse.json({ ok: true, ignored: "no_message" });
    }
    event = normalized;
    sendClient = createWhatsAppCloudClient({
      phoneNumberId: metaPhoneNumberId,
      accessToken: metaAccessToken,
      timeoutMs: Number(process.env.WHATSAPP_SEND_TIMEOUT_MS ?? 10_000),
    });
  } else {
    // Evolution API pode mandar vários tipos de evento (conexão, presença, etc.) — só messages.upsert interessa.
    const evolutionPayload = payload as { event?: string };
    if (evolutionPayload.event && evolutionPayload.event !== "messages.upsert") {
      return NextResponse.json({ ok: true, ignored: evolutionPayload.event });
    }

    const evolutionApiUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    const evolutionInstanceName = process.env.EVOLUTION_INSTANCE_NAME;
    if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstanceName) {
      logError("whatsapp-webhook.missing_env", {});
      return NextResponse.json({ error: "missing_configuration" }, { status: 500 });
    }

    event = normalizeEvent(payload);
    sendClient = createEvolutionClient({
      baseUrl: evolutionApiUrl,
      instanceName: evolutionInstanceName,
      apiKey: evolutionApiKey,
      timeoutMs: Number(process.env.WHATSAPP_SEND_TIMEOUT_MS ?? 10_000),
    });
  }

  try {
    const result = await handleWhatsAppEvent(event, {
      db: admin,
      typebot,
      evolution: sendClient,
      sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 24),
      errorCooldownMinutes: Number(process.env.ERROR_MESSAGE_COOLDOWN_MINUTES ?? 10),
    });
    logInfo("whatsapp-webhook.processed", { route: result.route, sent: result.sent, provider: isMetaPayload ? "meta" : "evolution" });
  } catch (err) {
    logError("whatsapp-webhook.failed", { errorMessage: err instanceof Error ? err.message : String(err) });
  }

  // Ambos os provedores esperam 200 rapidamente — não reenviar em loop.
  return NextResponse.json({ ok: true });
}
