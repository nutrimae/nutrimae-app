import { fetchWithRetry } from "./httpRetry";

/**
 * Cliente HTTP da Evolution API (envio de texto) — substitui o antigo
 * zapiClient.js do n8n, que já não era usado de verdade (o envio real
 * sempre foi via nodes "Evolution API: Send *" com URL/apikey fixos no
 * workflow). `to` sempre vem do evento recebido, nunca fixo.
 *
 * Formato confirmado da API v2: POST /message/sendText/{instance} com
 * header `apikey` e corpo `{ number, text }`.
 */
export function createEvolutionClient({
  fetchImpl = fetch,
  baseUrl,
  instanceName,
  apiKey,
  timeoutMs = 10_000,
  maxAttempts = 3,
}: {
  fetchImpl?: typeof fetch;
  baseUrl: string;
  instanceName: string;
  apiKey: string;
  timeoutMs?: number;
  maxAttempts?: number;
}) {
  const url = `${baseUrl.replace(/\/+$/, "")}/message/sendText/${encodeURIComponent(instanceName)}`;

  async function sendText({ to, message }: { to: string; message: string }) {
    if (!to) throw new Error("evolutionClient.sendText: telefone (to) é obrigatório.");
    if (!message) throw new Error("evolutionClient.sendText: mensagem vazia — nada a enviar.");

    const res = await fetchWithRetry(
      fetchImpl,
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({ number: to, text: message }),
      },
      { timeoutMs, maxAttempts },
    );
    return res.json().catch(() => ({}));
  }

  return { sendText };
}
