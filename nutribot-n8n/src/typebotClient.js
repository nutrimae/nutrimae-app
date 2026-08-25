import { buildStartChatUrl, buildContinueChatUrl } from "./urls.js";
import { fetchWithRetry, HttpStatusError, HttpTimeoutError } from "./httpRetry.js";

/**
 * Cliente HTTP do Typebot. Injeta `fetchImpl` para permitir testes sem
 * rede real. Nunca chama continueChat sem session_id válido (ver urls.js).
 */
export function createTypebotClient({
  fetchImpl = fetch,
  baseUrl,
  publicId,
  apiToken,
  timeoutMs = 15_000,
  maxAttempts = 3,
} = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
  };

  async function startChat({ prefilledVariables }) {
    const url = buildStartChatUrl(baseUrl, publicId);
    const res = await fetchWithRetry(
      fetchImpl,
      url,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          prefilledVariables,
          textBubbleContentFormat: "markdown",
        }),
      },
      { timeoutMs, maxAttempts },
    );
    return res.json();
  }

  async function continueChat({ sessionId, message }) {
    const url = buildContinueChatUrl(baseUrl, sessionId);
    const res = await fetchWithRetry(
      fetchImpl,
      url,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ message, textBubbleContentFormat: "markdown" }),
      },
      { timeoutMs, maxAttempts },
    );
    return res.json();
  }

  return { startChat, continueChat };
}

/** Créditos/limite esgotados costumam vir como 402 (Payment Required) ou 429. */
export function isCreditsExhaustedError(err) {
  return err instanceof HttpStatusError && (err.status === 402 || err.status === 429);
}

export function isTimeoutError(err) {
  return err instanceof HttpTimeoutError;
}
