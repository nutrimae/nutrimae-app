import { fetchWithRetry } from "./httpRetry";

/**
 * Cliente da WhatsApp Cloud API (Meta) — substitui a Evolution API
 * (self-hosted, biblioteca não-oficial que imita o WhatsApp Web e por isso
 * fica sujeita a bloqueio de envio quando o WhatsApp detecta automação).
 *
 * Formato oficial: POST https://graph.facebook.com/v21.0/{phoneNumberId}/messages
 * com Bearer token e corpo { messaging_product: "whatsapp", to, type: "text", text: { body } }.
 */
export function createWhatsAppCloudClient({
  fetchImpl = fetch,
  phoneNumberId,
  accessToken,
  apiVersion = "v21.0",
  timeoutMs = 10_000,
  maxAttempts = 3,
}: {
  fetchImpl?: typeof fetch;
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
  timeoutMs?: number;
  maxAttempts?: number;
}) {
  const url = `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`;

  async function sendText({ to, message }: { to: string; message: string }) {
    if (!to) throw new Error("whatsappCloudClient.sendText: telefone (to) é obrigatório.");
    if (!message) throw new Error("whatsappCloudClient.sendText: mensagem vazia — nada a enviar.");

    const res = await fetchWithRetry(
      fetchImpl,
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      },
      { timeoutMs, maxAttempts },
    );

    const body = await res.json().catch(() => ({}));

    // Diferente da Evolution API, aqui um erro real SEMPRE vem com status
    // HTTP de erro (400/401/403 etc) e um campo "error" — nunca fica
    // silenciosamente "PENDING" pra sempre. Propaga o erro pra quem chamou
    // (orchestrator) saber que o envio falhou de verdade, em vez de
    // registrar como enviado sem ter sido.
    if (!res.ok) {
      const errorMessage = (body as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
      throw new Error(`whatsappCloudClient.sendText falhou: ${errorMessage}`);
    }

    return body;
  }

  return { sendText };
}
