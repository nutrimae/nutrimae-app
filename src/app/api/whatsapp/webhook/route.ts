import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTypebotClient } from "@/lib/nutribot/typebotClient";
import { createWhatsAppCloudClient } from "@/lib/nutribot/whatsappCloudClient";
import { normalizeMetaEvent } from "@/lib/nutribot/normalize";
import { handleWhatsAppEvent, type WhatsAppSendClient } from "@/lib/nutribot/orchestrator";
import { logError, logInfo } from "@/lib/nutribot/logger";
import { verifyMetaSignature } from "@/lib/nutribot/webhook-auth";

/**
 * Webhook do NutriBot. Apenas WhatsApp Cloud API (Meta, oficial).
 *
 * SEC-003 Segurança (Camada de Transporte e Autenticidade):
 * - HTTPS/TLS garantem a segurança em trânsito (não é e2ee do app WhatsApp).
 * - Cloud API: handshake inicial GET usa hub.verify_token.
 * - POST assegura autenticidade e integridade via HMAC-SHA256 do raw body
 *   no header X-Hub-Signature-256.
 * - Fail-closed estrito caso META_WHATSAPP_APP_SECRET esteja ausente.
 */

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
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "missing_body" }, { status: 400 });
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!verifyMetaSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const isMetaPayload =
    typeof payload === "object" && payload !== null && (payload as { object?: unknown }).object === "whatsapp_business_account";

  if (!isMetaPayload) {
    return NextResponse.json({ error: "invalid_payload_format" }, { status: 400 });
  }

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

  const sendClient = createWhatsAppCloudClient({
    phoneNumberId: metaPhoneNumberId,
    accessToken: metaAccessToken,
    timeoutMs: Number(process.env.WHATSAPP_SEND_TIMEOUT_MS ?? 10_000),
  });

  try {
    const result = await handleWhatsAppEvent(normalized, {
      db: admin,
      typebot,
      whatsapp: sendClient,
      sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 24),
      errorCooldownMinutes: Number(process.env.ERROR_MESSAGE_COOLDOWN_MINUTES ?? 10),
    });
    logInfo("whatsapp-webhook.processed", { route: result.route, sent: result.sent, provider: "meta" });
  } catch (err) {
    logError("whatsapp-webhook.failed", { errorMessage: err instanceof Error ? err.message : String(err) });
  }

  return NextResponse.json({ ok: true });
}
