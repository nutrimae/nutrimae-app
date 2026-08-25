import { test } from "node:test";
import assert from "node:assert/strict";
import { maskEmail, maskToken, redact } from "../src/redact.js";

test("maskEmail preserva domínio e mascara usuário", () => {
  assert.equal(maskEmail("maria@gmail.com"), "ma***@gmail.com");
});

test("maskToken nunca expõe o token inteiro", () => {
  const masked = maskToken("F7b91c2e4a8d0f6591234567890abcdef");
  assert.ok(!masked.includes("1c2e4a8d0f6591234567890abcdef"));
  assert.match(masked, /^F7b\.\.\./);
});

test("redact mascara chaves que parecem credencial em qualquer profundidade", () => {
  const out = redact({
    headers: { "Client-Token": "abcdef123456", Authorization: "Bearer xyz987654321" },
    body: { phone: "553182686499" },
  });
  assert.notEqual(out.headers["Client-Token"], "abcdef123456");
  assert.notEqual(out.headers.Authorization, "Bearer xyz987654321");
  assert.equal(out.body.phone, "553182686499");
});

test("redact mascara e-mails em qualquer valor de string", () => {
  const out = redact({ email_cliente: "maria@gmail.com", nested: { x: "joao@empresa.com.br" } });
  assert.equal(out.email_cliente, "ma***@gmail.com");
  assert.equal(out.nested.x, "jo**@empresa.com.br");
});
