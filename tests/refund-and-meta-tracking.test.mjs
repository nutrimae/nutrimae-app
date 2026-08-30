import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("reembolso/chargeback revoga acesso (não só marca o pedido)", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  assert.match(webhook, /case "charge\.refunded":\s*\n\s*case "charge\.chargedback":/);
  assert.match(webhook, /revokeAccessForOrder\(admin, orderRow\)/);
});

test("revogação cobre a oferta principal e cada order_item, e desfaz o crédito de expansão", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  const fn = webhook.slice(
    webhook.indexOf("async function revokeAccessForOrder"),
    webhook.indexOf("/**\n * Fase de assinatura"),
  );
  assert.match(fn, /from\("order_items"\)/);
  assert.match(fn, /from\("user_products"\)/);
  assert.match(fn, /status:\s*"refunded"/);
  assert.match(fn, /revoke_expansion_credit/);
  // Pedido que nunca liberou acesso (recusado/estornado antes do "paid") não tem o que revogar.
  assert.match(fn, /if \(!orderRow\.user_id\)/);
});

test("revoke_expansion_credit é simétrico ao grant e só executável pelo service role", async () => {
  const schema = await read("supabase/schema.sql");
  assert.match(schema, /create or replace function public\.revoke_expansion_credit/);
  assert.match(schema, /revoke all on function public\.revoke_expansion_credit\(uuid, uuid\) from public, anon, authenticated/);
  assert.match(schema, /grant execute on function public\.revoke_expansion_credit\(uuid, uuid\) to service_role/);
});

test("evento de compra pro Meta só dispara depois do acesso liberado, e nunca derruba o webhook", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  const grant = webhook.slice(
    webhook.indexOf("async function grantAccessForOrder"),
    webhook.indexOf("async function reportPurchaseToMeta"),
  );
  assert.ok(
    grant.indexOf("reportPurchaseToMeta") > grant.indexOf("user_products"),
    "reportPurchaseToMeta deve ser chamado depois do upsert em user_products",
  );

  const reportFn = webhook.slice(webhook.indexOf("async function reportPurchaseToMeta"));
  assert.match(reportFn, /if \(!process\.env\.META_ACCESS_TOKEN \|\| !process\.env\.META_PIXEL_ID\) return;/);
  assert.match(reportFn, /try \{[\s\S]*catch \(err\) \{/);
});

test("meta-conversion.js hasheia e-mail/telefone e nunca envia dado bruto ao Meta", async () => {
  const meta = await read("meta-conversion.js");
  assert.match(meta, /sha256\(email\)/);
  assert.match(meta, /if \(phone\) userData\.setPhones\(\[sha256\(phone\)\]\)/);
  assert.doesNotMatch(meta, /setEmails\(\[email\]\)/);
});

test("meta-conversion.js envia fbc/fbp/ip/user-agent quando disponíveis, sem exigir nenhum deles", async () => {
  const meta = await read("meta-conversion.js");
  assert.match(meta, /if \(clientIp\) userData\.setClientIpAddress\(clientIp\)/);
  assert.match(meta, /if \(userAgent\) userData\.setClientUserAgent\(userAgent\)/);
  assert.match(meta, /if \(fbc\) userData\.setFbc\(fbc\)/);
  assert.match(meta, /if \(fbp\) userData\.setFbp\(fbp\)/);
});

test("sendInitiateCheckoutEvent existe, usa event_id próprio (não colide com o Purchase) e é exportado junto com sendPurchaseEvent", async () => {
  const meta = await read("meta-conversion.js");
  assert.match(meta, /function sendInitiateCheckoutEvent/);
  assert.match(meta, /setEventName\("InitiateCheckout"\)|eventName: "InitiateCheckout"/);
  assert.match(meta, /`ic_\$\{orderId\}`/);
  assert.match(meta, /module\.exports = \{ sendPurchaseEvent, sendInitiateCheckoutEvent \}/);
});

test("checkout captura fbc/fbp/ip/user-agent no pedido e dispara InitiateCheckout sem bloquear a resposta do checkout", async () => {
  const route = await read("src/app/api/checkout/route.ts");
  assert.match(route, /const clientIp = extractClientIp\(request\)/);
  assert.match(route, /const clientUserAgent = request\.headers\.get\("user-agent"\)/);
  assert.match(route, /fbc: fbc \?\? null/);
  assert.match(route, /fbp: fbp \?\? null/);
  assert.match(route, /client_ip: clientIp/);
  // Não pode ter await antes do .catch — se travasse o checkout numa falha do Meta, uma venda real ficaria refém de um serviço de terceiro.
  assert.doesNotMatch(route, /await sendInitiateCheckoutEvent/);
  assert.match(route, /sendInitiateCheckoutEvent\(\{[\s\S]*?\}\)\.catch/);
  assert.match(route, /if \(!tracking\?\.isInternal\)/);
});

test("webhook do Pagar.me relê fbc/fbp/ip/user-agent do pedido e repassa pro Purchase", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  const selects = [...webhook.matchAll(/select\("([^"]*offer_id, user_id, amount_cents[^"]*)"\)/g)].map((m) => m[1]);
  assert.ok(selects.length >= 3, "esperava pelo menos 3 selects carregando o pedido (por id local, por pagarme_order_id, por charge)");
  for (const select of selects) {
    assert.match(select, /fbc/);
    assert.match(select, /fbp/);
    assert.match(select, /client_ip/);
    assert.match(select, /client_user_agent/);
  }
  assert.match(webhook, /clientIp: orderRow\.client_ip/);
  assert.match(webhook, /userAgent: orderRow\.client_user_agent/);
});

test("orders ganha fbc/fbp/client_ip/client_user_agent de forma aditiva (schema.sql e migração)", async () => {
  const schema = await read("supabase/schema.sql");
  for (const col of ["fbc text", "fbp text", "client_ip text", "client_user_agent text"]) {
    assert.match(schema, new RegExp(`alter table public\\.orders add column if not exists ${col}`));
  }
  const migration = await read("supabase/migrations/202608290001_orders_meta_match_signals.sql");
  for (const col of ["fbc text", "fbp text", "client_ip text", "client_user_agent text"]) {
    assert.match(migration, new RegExp(`add column if not exists ${col}`));
  }
});
