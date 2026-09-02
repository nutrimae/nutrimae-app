import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFile(path.join(root, file), "utf8");

test("UTMify usa token apenas no servidor e envia o contrato oficial de pedidos", async () => {
  const integration = await read("src/lib/utmify/orders.ts");
  assert.match(integration, /process\.env\.UTMIFY_API_TOKEN/);
  assert.doesNotMatch(integration, /NEXT_PUBLIC_UTMIFY/);
  assert.match(integration, /https:\/\/api\.utmify\.com\.br\/api-credentials\/orders/);
  assert.match(integration, /"x-api-token": token/);
  for (const field of ["orderId", "paymentMethod", "trackingParameters", "commission", "products"]) {
    assert.match(integration, new RegExp(`${field}:`));
  }
});

test("webhook financeiro reporta estados à UTMify sem torná-la fonte de verdade", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  assert.match(webhook, /bestEffortReportOrderToUtmify\(admin, orderRow\.id, "paid"/);
  assert.match(webhook, /bestEffortReportOrderToUtmify\(admin, orderRow\.id, "refused"/);
  assert.match(webhook, /"chargedback" : "refunded"/);
  assert.ok(
    webhook.indexOf("grantAccessForOrder(admin, orderRow)") < webhook.indexOf('bestEffortReportOrderToUtmify(admin, orderRow.id, "paid"'),
    "liberação de acesso deve acontecer antes do tracking externo",
  );
});

test("script oficial da UTMify está na landing e no app/checkout", async () => {
  const landing = await read("landing-nutrimae/index.html");
  const layout = await read("src/app/layout.tsx");
  for (const source of [landing, layout]) {
    assert.match(source, /https:\/\/cdn\.utmify\.com\.br\/scripts\/utms\/latest\.js/);
    assert.match(source, /data-utmify-prevent-xcod-sck/);
    assert.match(source, /data-utmify-prevent-subids/);
  }
});
