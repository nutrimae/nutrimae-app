import { buildStartChatUrl, buildContinueChatUrl } from "./urls";
import { fetchWithRetry, HttpStatusError, HttpTimeoutError } from "./httpRetry";

/**
 * Cliente HTTP do Typebot. Portado de nutribot-n8n/src/typebotClient.js —
 * nunca chama continueChat sem session_id válido (ver urls.ts).
 */
export function createTypebotClient({
  fetchImpl = fetch,
  baseUrl,
  publicId,
  apiToken,
  timeoutMs = 15_000,
  maxAttempts = 3,
}: {
  fetchImpl?: typeof fetch;
  baseUrl: string;
  publicId?: string;
  apiToken?: string;
  timeoutMs?: number;
  maxAttempts?: number;
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
  };

  async function startChat({ prefilledVariables }: { prefilledVariables: Record<string, unknown> }) {
    const url = buildStartChatUrl(baseUrl, publicId);
    const res = await fetchWithRetry(
      fetchImpl,
      url,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ prefilledVariables, textBubbleContentFormat: "markdown" }),
      },
      { timeoutMs, maxAttempts },
    );
    return res.json();
  }

  async function continueChat({ sessionId, message }: { sessionId: string | null; message: string }) {
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

export function isCreditsExhaustedError(err: unknown): boolean {
  return err instanceof HttpStatusError && (err.status === 402 || err.status === 429);
}

export function isTimeoutError(err: unknown): boolean {
  return err instanceof HttpTimeoutError;
}
