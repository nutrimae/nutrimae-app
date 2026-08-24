import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("todo item enviado à Pagar.me leva 'code' (a API rejeita sem isso)", async () => {
  const pagarme = await read("src/lib/payments/pagarme.ts");
  const itemLines = pagarme.split("\n").filter((line) => line.includes("items:") && line.includes("["));
  assert.ok(itemLines.length >= 3, "esperava linhas de items em pix/cartão/assinatura");
  for (const line of itemLines) {
    assert.match(line, /code:\s*itemCode\(/, `item sem 'code': ${line}`);
  }
});

test("cobrança de cartão (card_token) sempre inclui billing_address aninhado em 'card'", async () => {
  const pagarme = await read("src/lib/payments/pagarme.ts");
  assert.match(pagarme, /card_token:\s*input\.cardToken,\s*\n\s*installments:[^]*?card:\s*\{\s*billing_address:\s*billingAddressPayload\(input\.billingAddress\)\s*\}/);
});

test("os 5 campos de billing_address (line_1, zip_code, city, state, country) são sempre montados", async () => {
  const pagarme = await read("src/lib/payments/pagarme.ts");
  const fn = pagarme.slice(pagarme.indexOf("function billingAddressPayload"), pagarme.indexOf("function billingAddressPayload") + 400);
  for (const field of ["line_1", "zip_code", "city", "state", "country"]) {
    assert.match(fn, new RegExp(field));
  }
});

test("as 3 rotas de checkout com cartão (principal, upsell, downsell) exigem billingAddress válido antes de cobrar", async () => {
  for (const file of ["src/app/api/checkout/route.ts", "src/app/api/checkout/upsell/route.ts", "src/app/api/checkout/downsell/route.ts"]) {
    const route = await read(file);
    assert.match(route, /parseBillingAddress/, `${file} não valida billingAddress`);
    assert.match(route, /!billingAddress\)/, `${file} não bloqueia cartão sem endereço`);
    assert.match(route, /billingAddress:\s*billingAddress as NonNullable/, `${file} não passa o endereço pro provider`);
  }
});

test("os formulários de checkout com cartão coletam e enviam o endereço de cobrança", async () => {
  for (const file of [
    "src/app/(checkout)/checkout/[offerSlug]/_components/checkout-form.tsx",
    "src/app/(checkout)/upsell/_components/upsell-checkout.tsx",
    "src/app/(checkout)/downsell/_components/downsell-checkout.tsx",
  ]) {
    const form = await read(file);
    assert.match(form, /BillingAddressFields/, `${file} não usa BillingAddressFields`);
    assert.match(form, /billingAddress:\s*paymentMethod === "credit_card" \? billingAddress : undefined/, `${file} não envia billingAddress no body`);
  }
});
