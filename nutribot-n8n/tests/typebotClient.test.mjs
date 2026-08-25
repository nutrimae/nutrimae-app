import { test } from "node:test";
import assert from "node:assert/strict";
import { createTypebotClient, isCreditsExhaustedError, isTimeoutError } from "../src/typebotClient.js";

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

test("startChat monta a URL e o corpo corretos", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return jsonResponse({ sessionId: "s1", messages: [], input: { type: "text input" } });
  };

  const client = createTypebotClient({
    fetchImpl,
    baseUrl: "https://typebot.io",
    publicId: "my-typebot-1slh1qn",
    timeoutMs: 1000,
    maxAttempts: 1,
  });

  await client.startChat({ prefilledVariables: { email_cliente: "maria@gmail.com" } });

  assert.equal(calls[0].url, "https://typebot.io/api/v1/typebots/my-typebot-1slh1qn/startChat");
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.prefilledVariables.email_cliente, "maria@gmail.com");
  assert.equal(body.textBubbleContentFormat, "markdown");
});

test("continueChat nunca é chamado sem session_id — erro é lançado antes do fetch", async () => {
  let fetchCalled = false;
  const fetchImpl = async () => {
    fetchCalled = true;
    return jsonResponse({});
  };
  const client = createTypebotClient({ fetchImpl, baseUrl: "https://typebot.io", publicId: "p" });

  await assert.rejects(() => client.continueChat({ sessionId: "", message: "oi" }));
  assert.equal(fetchCalled, false);
});

test("24. timeout: fetch nunca resolve dentro do timeoutMs -> HttpTimeoutError", async () => {
  const fetchImpl = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      });
    });

  const client = createTypebotClient({
    fetchImpl,
    baseUrl: "https://typebot.io",
    publicId: "p",
    timeoutMs: 20,
    maxAttempts: 1,
  });

  await assert.rejects(
    () => client.startChat({ prefilledVariables: {} }),
    (err) => isTimeoutError(err),
  );
});

test("25. sem créditos: HTTP 402 é reconhecido como créditos esgotados", async () => {
  const fetchImpl = async () => jsonResponse({ error: "insufficient_credits" }, 402);
  const client = createTypebotClient({
    fetchImpl,
    baseUrl: "https://typebot.io",
    publicId: "p",
    maxAttempts: 1,
  });

  await assert.rejects(
    () => client.startChat({ prefilledVariables: {} }),
    (err) => isCreditsExhaustedError(err),
  );
});

test("retry: erro 500 é re-tentado até maxAttempts, depois falha", async () => {
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    return jsonResponse({ error: "boom" }, 500);
  };

  const client = createTypebotClient({
    fetchImpl,
    baseUrl: "https://typebot.io",
    publicId: "p",
    maxAttempts: 3,
  });

  await assert.rejects(() => client.startChat({ prefilledVariables: {} }));
  assert.equal(attempts, 3);
});

test("erro 400 (cliente) não é re-tentado", async () => {
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    return jsonResponse({ error: "bad_request" }, 400);
  };

  const client = createTypebotClient({ fetchImpl, baseUrl: "https://typebot.io", publicId: "p", maxAttempts: 3 });

  await assert.rejects(() => client.startChat({ prefilledVariables: {} }));
  assert.equal(attempts, 1);
});
