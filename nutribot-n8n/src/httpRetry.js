/**
 * fetch com timeout + retry exponencial, compartilhado pelo cliente do
 * Typebot e da Z-API (spec seção 20: "timeout nos HTTP Request nodes;
 * retry com backoff exponencial; limite de tentativas").
 *
 * Recebe `fetchImpl` por injeção para ser testável sem rede real
 * (tests/typebotClient.test.mjs, tests/zapiClient.test.mjs).
 */

export class HttpTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "HttpTimeoutError";
  }
}

export class HttpStatusError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "HttpStatusError";
    this.status = status;
    this.body = body;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {typeof fetch} fetchImpl
 * @param {string} url
 * @param {RequestInit} init
 * @param {{timeoutMs?: number, maxAttempts?: number, backoffBaseMs?: number}} [options]
 */
export async function fetchWithRetry(fetchImpl, url, init, options = {}) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxAttempts = options.maxAttempts ?? 3;
  const backoffBaseMs = options.backoffBaseMs ?? 300;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetchImpl(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        return res;
      }

      // 429/402 = limite de taxa ou créditos esgotados: não adianta bater
      // de novo imediatamente, mas ainda vale re-tentar com backoff maior
      // caso seja um pico passageiro — o chamador decide se trata como
      // "sem créditos" olhando `error.status`.
      const bodyText = await res.text().catch(() => "");
      throw new HttpStatusError(`HTTP ${res.status}`, res.status, bodyText);
    } catch (err) {
      clearTimeout(timer);
      lastError =
        err?.name === "AbortError"
          ? new HttpTimeoutError(`Timeout após ${timeoutMs}ms (tentativa ${attempt}/${maxAttempts})`)
          : err;

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
