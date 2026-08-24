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
