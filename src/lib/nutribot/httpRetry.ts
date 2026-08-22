/**
 * fetch com timeout + retry exponencial, compartilhado pelo cliente do
 * Typebot e da Evolution API. Portado de nutribot-n8n/src/httpRetry.js.
 */

export class HttpTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpTimeoutError";
  }
}

export class HttpStatusError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "HttpStatusError";
    this.status = status;
    this.body = body;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  options: { timeoutMs?: number; maxAttempts?: number; backoffBaseMs?: number } = {},
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxAttempts = options.maxAttempts ?? 3;
  const backoffBaseMs = options.backoffBaseMs ?? 300;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetchImpl(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        return res;
      }

      const bodyText = await res.text().catch(() => "");
      throw new HttpStatusError(`HTTP ${res.status}`, res.status, bodyText);
    } catch (err) {
      clearTimeout(timer);
      lastError =
        (err as Error)?.name === "AbortError"
          ? new HttpTimeoutError(`Timeout após ${timeoutMs}ms (tentativa ${attempt}/${maxAttempts})`)
          : (err as Error);

      const isLastAttempt = attempt === maxAttempts;
      const isClientError =
        err instanceof HttpStatusError && err.status >= 400 && err.status < 500 && err.status !== 429;

      if (isLastAttempt || isClientError) {
        throw lastError;
      }

      await sleep(backoffBaseMs * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}
