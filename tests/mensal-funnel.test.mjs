import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("Mensal e NutriBot VIP estao ativos no seed de offers, com upsert real (nao 'do nothing')", async () => {
  const schema = await read("supabase/schema.sql");
  assert.match(schema, /'nutrimae-mensal',\s*'nutrimae_assinatura',[^\n]*true\)/, "nutrimae-mensal deveria estar active=true");
  assert.match(schema, /'nutribot-vip-mensal',\s*'nutribot_vip',[^\n]*true\)/, "nutribot-vip-mensal deveria estar active=true");
  const insertBlock = schema.slice(schema.indexOf("insert into public.offers"), schema.indexOf("insert into public.offers") + 1200);
  assert.match(insertBlock, /on conflict \(slug\) do update set/, "upsert de offers precisa sincronizar active de verdade, nao 'do nothing'");
  assert.match(insertBlock, /active = excluded\.active/);
});

test("orders e subscriptions ganham parent_subscription_id (upsell/downsell tambem nascem de assinatura)", async () => {
  const schema = await read("supabase/schema.sql");
  assert.match(schema, /alter table public\.subscriptions\s*\n\s*add column if not exists parent_subscription_id/);
  assert.match(schema, /alter table public\.orders\s*\n\s*add column if not exists parent_subscription_id/);
});

test("resolveParentCustomer só resolve cliente de order 'paid' ou subscription 'active', nunca pendente", async () => {
  const helper = await read("src/lib/payments/resolve-parent-customer.ts");
  assert.match(helper, /order\.status !== "paid"/);
  assert.match(helper, /subscription\.status !== "active"/);
});

test("/api/checkout/subscription aceita parentSubscriptionId (upsell) sem exigir nome/e-mail/CPF de novo", async () => {
  const route = await read("src/app/api/checkout/subscription/route.ts");
  assert.match(route, /parentSubscriptionId/);
  assert.match(route, /!parentSubscriptionId && \(!customerName/, "só deveria exigir customer completo quando NAO vier de um upsell");
  assert.match(route, /resolveParentCustomer\(admin, \{ parentSubscriptionId \}\)/);
});

test("/api/checkout/downsell aceita parentOrderId OU parentSubscriptionId (nunca nenhum dos dois)", async () => {
  const route = await read("src/app/api/checkout/downsell/route.ts");
  assert.match(route, /parentSubscriptionId/);
  assert.match(route, /\(!parentOrderId && !parentSubscriptionId\)/);
  assert.match(route, /resolveParentCustomer\(admin, \{ parentOrderId, parentSubscriptionId \}\)/);
});

test("upsell pos-compra mostra oferta certa conforme a origem: order->Batch Cooking, subscription->NutriBot VIP", async () => {
  const page = await read("src/app/(checkout)/upsell/page.tsx");
  assert.match(page, /subscriptionId/);
  assert.match(page, /nutribot-vip-mensal/);
  assert.match(page, /VipUpsellCheckout/);
  assert.match(page, /batch-cooking/);
  assert.match(page, /UpsellCheckout/);
});

test("upsell do NutriBot VIP pula pra downsell se a pessoa ja tem VIP ativo (nunca oferece o que ja tem)", async () => {
  const page = await read("src/app/(checkout)/upsell/page.tsx");
  const block = page.slice(page.indexOf("if (subscriptionId)"), page.indexOf("const { data: order }"));
  assert.match(block, /existingVip/);
  assert.match(block, /redirect\(`\/downsell\?subscriptionId=/);
});

test("VipUpsellCheckout cobra de verdade via /api/checkout/subscription (nao so navega pro downsell)", async () => {
  const component = await read("src/app/(checkout)/upsell/_components/vip-upsell-checkout.tsx");
  const acceptFn = component.slice(component.indexOf("async function handleAccept"));
  assert.match(acceptFn, /fetch\("\/api\/checkout\/subscription"/);
  assert.match(acceptFn, /parentSubscriptionId/);
  assert.match(acceptFn, /nutribot-vip-mensal/);
  assert.match(acceptFn, /router\.push\("\/app"\)/, "aceitar a oferta precisa cobrar e mandar pro app, nao pro downsell");
  const declineFn = component.slice(component.indexOf("function handleDecline"), component.indexOf("async function handleAccept"));
  assert.match(declineFn, /router\.push\(`\/downsell/, "recusar precisa mandar pro downsell (segunda chance)");
});

test("upsell-actions.tsx (placeholder que nao cobrava) foi substituido, nao deixado orfao", async () => {
  await assert.rejects(read("src/app/(checkout)/upsell/_components/upsell-actions.tsx"));
});

test("downsell aceita orderId ou subscriptionId como pedido pai", async () => {
  const page = await read("src/app/(checkout)/downsell/page.tsx");
  assert.match(page, /subscriptionId/);
  assert.match(page, /parentOrderId=\{orderId\} parentSubscriptionId=\{subscriptionId\}/);
});

test("obrigado da assinatura manda pro upsell (funil completo), nao direto pro app", async () => {
  const page = await read("src/app/(checkout)/checkout/obrigado/page.tsx");
  const subscriptionBlock = page.slice(page.indexOf("if (subscriptionId)"), page.indexOf("const order = orderId"));
  assert.match(subscriptionBlock, /\/upsell\?subscriptionId=\$\{subscription\.id\}/);
});

test("landing /oferta tem toggle Mensal/Anual roteando pro checkout certo", async () => {
  const offer = await read("src/app/oferta/_components/offer.tsx");
  assert.match(offer, /setPlan\("mensal"\)/);
  assert.match(offer, /setPlan\("anual"\)/);
  assert.match(offer, /nutrimae-mensal/);
  assert.match(offer, /nutrimae-anual/);
});

test("checkout do Mensal tambem recebe order bumps (mesma lista do Anual)", async () => {
  const page = await read("src/app/(checkout)/checkout/[offerSlug]/page.tsx");
  assert.match(page, /offerSlug === "nutrimae-anual" \|\| offerSlug === "nutrimae-mensal"/);
  assert.match(page, /<SubscriptionCheckoutForm[^/]*bumps=\{bumps\}/s);
});

test("bumps da assinatura sao cobrados a parte (pagamento unico), nunca somados ao valor recorrente", async () => {
  const route = await read("src/app/api/checkout/subscription/route.ts");
  const subscriptionCall = route.slice(route.indexOf("provider.createSubscription("), route.indexOf("createSubscription(") + 600);
  assert.doesNotMatch(subscriptionCall, /bump/i, "bumps nunca podem entrar no payload de createSubscription (cobraria todo mes)");
  assert.match(route, /async function chargeBumps/);
  assert.match(route, /if \(!parentSubscriptionId && bumpSlugs\.length > 0\)/, "bump so e cobrado na assinatura nova, nunca no upsell de uma assinatura existente");
});

test("cobranca de bump da assinatura e best-effort: falha nao desfaz a assinatura ja criada", async () => {
  const route = await read("src/app/api/checkout/subscription/route.ts");
  const chargeBumpsFn = route.slice(route.indexOf("async function chargeBumps"));
  const catchBlock = chargeBumpsFn.slice(chargeBumpsFn.indexOf("} catch (err)"));
  assert.match(catchBlock, /console\.error/, "catch precisa logar, nao engolir silenciosamente");
  assert.doesNotMatch(catchBlock, /throw/, "o catch de chargeBumps nunca pode relancar o erro (derrubaria a resposta de sucesso da assinatura)");
});

test("imagens/descricoes de order bump vem de uma fonte unica, compartilhada entre Anual e Mensal", async () => {
  const shared = await read("src/lib/checkout/bump-content.ts");
  assert.match(shared, /BUMP_IMAGES/);
  assert.match(shared, /BUMP_DESCRIPTIONS/);
  for (const file of [
    "src/app/(checkout)/checkout/[offerSlug]/_components/checkout-form.tsx",
    "src/app/(checkout)/checkout/[offerSlug]/_components/subscription-checkout-form.tsx",
  ]) {
    const form = await read(file);
    assert.match(form, /from "@\/lib\/checkout\/bump-content"/, `${file} deveria importar de bump-content.ts, nao duplicar`);
  }
});
