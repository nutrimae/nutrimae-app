import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import {
  generateStatusToken,
  validateStatusToken,
} from "../src/lib/checkout/status-token.ts";

process.env.PAGARME_WEBHOOK_PASSWORD = "test-secret-for-unit-tests";

test("status-token: gera token nao vazio para orderId valido", () => {
  const token = generateStatusToken("order-uuid-1234");
  assert.ok(typeof token === "string" && token.length > 10);
});

test("status-token: token decodificado tem 3 partes (orderId.expiresAt.hmac)", () => {
  const token = generateStatusToken("order-structure");
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const parts = decoded.split(".");
  assert.equal(parts.length, 3);
  assert.ok(parts[0].length > 0);
  assert.ok(Number(parts[1]) > 0);
  assert.equal(parts[2].length, 64);
});

test("status-token: token gerado valida e retorna o orderId correto", () => {
  const orderId = "pedido-uuid-5678";
  const token = generateStatusToken(orderId);
  assert.equal(validateStatusToken(token), orderId);
});

test("status-token: dois tokens do mesmo orderId em momentos diferentes sao ambos validos", async () => {
  const t1 = generateStatusToken("order-double");
  await new Promise((r) => setTimeout(r, 1100));
  const t2 = generateStatusToken("order-double");
  assert.equal(validateStatusToken(t1), "order-double");
  assert.equal(validateStatusToken(t2), "order-double");
});

test("status-token: orderId substituido (IDOR attempt) e rejeitado", () => {
  const token = generateStatusToken("order-A");
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const parts = decoded.split(".");
  parts[0] = "order-B";
  const tampered = Buffer.from(parts.join(".")).toString("base64url");
  assert.equal(validateStatusToken(tampered), null);
});

test("status-token: HMAC alterado e rejeitado", () => {
  const token = generateStatusToken("order-safe");
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const badDecoded = decoded.slice(0, -1) + (decoded.endsWith("a") ? "b" : "a");
  assert.equal(validateStatusToken(Buffer.from(badDecoded).toString("base64url")), null);
});

test("status-token: assinatura parcial (HMAC truncado) e rejeitada", () => {
  const token = generateStatusToken("order-partial");
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const parts = decoded.split(".");
  parts[2] = parts[2].slice(0, 32);
  assert.equal(validateStatusToken(Buffer.from(parts.join(".")).toString("base64url")), null);
});

test("status-token: expiresAt aumentado sem refazer HMAC e rejeitado", () => {
  const token = generateStatusToken("order-timing");
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const parts = decoded.split(".");
  parts[1] = String(Number(parts[1]) + 9999);
  assert.equal(validateStatusToken(Buffer.from(parts.join(".")).toString("base64url")), null);
});

test("status-token: token com expiresAt no passado e rejeitado", () => {
  const secret = process.env.PAGARME_WEBHOOK_PASSWORD;
  const orderId = "order-expired";
  const expiresAt = Math.floor(Date.now() / 1000) - 10;
  const hmac = createHmac("sha256", secret).update(`${orderId}:${expiresAt}`).digest("hex");
  const token = Buffer.from(`${orderId}.${expiresAt}.${hmac}`).toString("base64url");
  assert.equal(validateStatusToken(token), null);
});

test("status-token: string vazia e rejeitada", () => {
  assert.equal(validateStatusToken(""), null);
});

test("status-token: token com 2 partes e rejeitado", () => {
  assert.equal(validateStatusToken(Buffer.from("orderId.12345").toString("base64url")), null);
});

test("status-token: token com 4 partes e rejeitado", () => {
  assert.equal(validateStatusToken(Buffer.from("a.b.c.d").toString("base64url")), null);
});

test("status-token: input nao-base64url e rejeitado sem throw", () => {
  assert.doesNotThrow(() => validateStatusToken("nao-e-base64url!!!"));
  assert.equal(validateStatusToken("nao-e-base64url!!!"), null);
});

test("status-token: expiresAt nao numerico (NaN) e rejeitado", () => {
  const secret = process.env.PAGARME_WEBHOOK_PASSWORD;
  const hmac = createHmac("sha256", secret).update("order-badts:NaN").digest("hex");
  const token = Buffer.from(`order-badts.NaN.${hmac}`).toString("base64url");
  assert.equal(validateStatusToken(token), null);
});

test("status-token: ausencia do secret lanca erro em generateStatusToken", () => {
  const saved = process.env.PAGARME_WEBHOOK_PASSWORD;
  delete process.env.PAGARME_WEBHOOK_PASSWORD;
  try {
    assert.throws(() => generateStatusToken("any"), { message: /PAGARME_WEBHOOK_PASSWORD/ });
  } finally {
    process.env.PAGARME_WEBHOOK_PASSWORD = saved;
  }
});

test("status-token: ausencia do secret lanca erro em validateStatusToken", () => {
  const token = generateStatusToken("order-nosecret");
  const saved = process.env.PAGARME_WEBHOOK_PASSWORD;
  delete process.env.PAGARME_WEBHOOK_PASSWORD;
  try {
    assert.throws(() => validateStatusToken(token), { message: /PAGARME_WEBHOOK_PASSWORD/ });
  } finally {
    process.env.PAGARME_WEBHOOK_PASSWORD = saved;
  }
});
