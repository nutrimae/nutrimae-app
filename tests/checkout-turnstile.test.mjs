import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// ═══════════════════════════════════════════════════════════════
// TURNSTILE (SEC-012) — mesma estrategia do checkout-rate-limit-ip.test.mjs:
// turnstile.ts importa logger.ts que importa "./redact" sem extensao, o que
// o Node ESM nativo nao resolve. Reproduzimos a logica fielmente aqui e
// auditamos invariantes de seguranca no source.
// ═══════════════════════════════════════════════════════════════

// Reproducao fiel de verifyTurnstileToken (src/lib/checkout/turnstile.ts)
async function verifyTurnstileToken(token, ip, { secret, fetchImpl }) {
  if (!secret) return true;
  if (!token) return false;

  const params = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") params.set("remoteip", ip);

  try {
    const res = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: params });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

test("turnstile: sem TURNSTILE_SECRET_KEY, verificacao e pulada (fail-open ate a chave existir)", async () => {
  const ok = await verifyTurnstileToken(null, "203.0.113.1", { secret: undefined, fetchImpl: () => { throw new Error("nao deveria chamar fetch"); } });
  assert.equal(ok, true);
});

test("turnstile: com secret configurada e token ausente, rejeita", async () => {
  const ok = await verifyTurnstileToken(null, "203.0.113.1", { secret: "fake-secret", fetchImpl: () => { throw new Error("nao deveria chamar fetch"); } });
  assert.equal(ok, false);
});

test("turnstile: com secret configurada, token valido aprova via siteverify", async () => {
  const fetchImpl = async () => ({ json: async () => ({ success: true }) });
  const ok = await verifyTurnstileToken("valid-token", "203.0.113.1", { secret: "fake-secret", fetchImpl });
  assert.equal(ok, true);
});

test("turnstile: com secret configurada, token invalido (success:false) rejeita", async () => {
  const fetchImpl = async () => ({ json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }) });
  const ok = await verifyTurnstileToken("bad-token", "203.0.113.1", { secret: "fake-secret", fetchImpl });
  assert.equal(ok, false);
});

test("turnstile: falha de rede com secret configurada e fail-closed", async () => {
  const fetchImpl = async () => { throw new Error("cloudflare fora do ar"); };
  const ok = await verifyTurnstileToken("any-token", "203.0.113.1", { secret: "fake-secret", fetchImpl });
  assert.equal(ok, false);
});

// ── invariantes de seguranca no source ───────────────────────

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("turnstile: verifyTurnstileToken so pula verificacao quando TURNSTILE_SECRET_KEY ausente (auditoria do source)", async () => {
  const src = await read("src/lib/checkout/turnstile.ts");
  assert.match(src, /const secret = process\.env\.TURNSTILE_SECRET_KEY/);
  assert.match(src, /if \(!secret\) \{[\s\S]{0,60}return true/);
});

test("turnstile: falha de rede com secret configurada resulta em fail-closed, nao fail-open (auditoria do source)", async () => {
  const src = await read("src/lib/checkout/turnstile.ts");
  assert.match(src, /catch \(err\) \{[\s\S]{0,300}return false/);
});

test("turnstile: checkout principal chama verifyTurnstileToken antes de criar o pedido (auditoria do source)", async () => {
  const src = await read("src/app/api/checkout/route.ts");
  const verifyIdx = src.indexOf("verifyTurnstileToken(");
  const insertIdx = src.indexOf(".insert({");
  assert.ok(verifyIdx > -1, "checkout/route.ts deveria chamar verifyTurnstileToken");
  assert.ok(verifyIdx < insertIdx, "verificacao de bot deveria ocorrer antes de inserir a order");
});

test("turnstile: checkout de assinatura chama verifyTurnstileToken so em assinatura nova, nao em upsell de assinatura ja paga (auditoria do source)", async () => {
  const src = await read("src/app/api/checkout/subscription/route.ts");
  assert.match(src, /if \(!parentSubscriptionId\) \{[\s\S]{0,200}verifyTurnstileToken/);
});

test("turnstile: widget do client so renderiza quando NEXT_PUBLIC_TURNSTILE_SITE_KEY existe (auditoria do source)", async () => {
  const src = await read("src/components/turnstile-widget.tsx");
  assert.match(src, /if \(!SITE_KEY\) return null/);
});
