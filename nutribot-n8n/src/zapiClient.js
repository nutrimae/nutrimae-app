import { fetchWithRetry } from "./httpRetry.js";

/**
 * Cliente HTTP da Z-API (envio de texto). Nunca usa telefone fixo — `to`
 * vem sempre do evento recebido. Credenciais só chegam via config
 * (env vars / n8n Credentials), nunca hardcoded nem logadas em claro.
 */
export function createZapiClient({
  fetchImpl = fetch,
  instanceId,
  instanceToken,
  clientToken,
  timeoutMs = 10_000,
  maxAttempts = 3,
} = {}) {
  const url = `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/send-text`;

  async function sendText({ to, message }) {
    if (!to) throw new Error("zapiClient.sendText: telefone (to) é obrigatório.");
    if (!message) throw new Error("zapiClient.sendText: mensagem vazia — nada a enviar.");

    const res = await fetchWithRetry(
      fetchImpl,
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Token": clientToken,
        },
        body: JSON.stringify({ phone: to, message }),
      },
      { timeoutMs, maxAttempts },
    );
    return res.json().catch(() => ({}));
  }

  return { sendText };
}
