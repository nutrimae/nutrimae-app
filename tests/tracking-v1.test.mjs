import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { applyAttributionTouch, shouldStartNewSession } from "../src/lib/tracking/attribution-policy.ts";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("migration de tracking é aditiva e preserva tabelas financeiras", async () => {
  const sql = await read("supabase/migrations/202608260001_tracking_v1_foundation.sql");
  assert.match(sql, /create table if not exists public\.analytics_events/);
  assert.match(sql, /alter table public\.orders add column if not exists visitor_id/);
  assert.doesNotMatch(sql, /drop table\s+public\.(orders|payments|subscriptions)/i);
});

test("endpoint público não aceita evento financeiro do browser", async () => {
  const contracts = await read("src/lib/tracking/contracts.ts");
  const browserList = contracts.slice(contracts.indexOf("BROWSER_EVENT_NAMES"), contracts.indexOf("] as const"));
  assert.doesNotMatch(browserList, /purchase_confirmed|refund_confirmed|chargeback_confirmed/);
});

test("tracking do checkout é resolvido no servidor e não controla preço", async () => {
  const checkout = await read("src/app/api/checkout/route.ts");
  assert.match(checkout, /resolveCheckoutTracking/);
  assert.match(checkout, /price_cents/);
  assert.doesNotMatch(checkout, /body\.amount/);
});

test("Meta Pixel depende de consentimento de marketing", async () => {
  const manager = await read("src/components/tracking-consent.tsx");
  const layout = await read("src/app/layout.tsx");
  assert.match(manager, /consent === "marketing" \? <FacebookPixel/);
  assert.doesNotMatch(layout, /<FacebookPixel/);
});

test("purchase continua server-authoritative e usa outbox", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  const financial = await read("src/lib/tracking/financial.ts");
  assert.match(webhook, /case "order\.paid"/);
  assert.match(webhook, /eventName: "purchase_confirmed"/);
  assert.match(financial, /event_key: eventKey/);
  assert.match(financial, /error\?\.code === "23505"/);
});

test("tráfego interno é marcado e excluível das métricas", async () => {
  const client = await read("src/lib/tracking/client.ts");
  const endpoint = await read("src/app/api/tracking/events/route.ts");
  const sql = await read("supabase/migrations/202608260001_tracking_v1_foundation.sql");
  assert.doesNotMatch(client, /tracking_test/);
  assert.match(endpoint, /isTrustedInternalRequest/);
  assert.match(endpoint, /TRACKING_E2E_SECRET/);
  assert.match(sql, /is_internal boolean not null default false/);
  assert.match(sql, /where is_internal = false/);
});

test("first touch nunca é sobrescrito e acesso direto preserva last non-direct", () => {
  const first = { source: "meta", raw: { utm_source: "meta" } };
  const second = { source: "google", raw: { utm_source: "google" } };
  const afterFirst = applyAttributionTouch({ firstTouch: null, lastNonDirect: null }, first);
  const afterSecond = applyAttributionTouch(afterFirst, second);
  const afterDirect = applyAttributionTouch(afterSecond, null);
  assert.equal(afterDirect.firstTouch.source, "meta");
  assert.equal(afterDirect.lastNonDirect.source, "google");
});

test("sessão renova por expiração ou nova campanha, não por acesso direto", () => {
  const base = { hasSession: true, lastSeenAt: 1_000, now: 2_000, ttlMs: 30_000, currentCampaignFingerprint: "meta" };
  assert.equal(shouldStartNewSession({ ...base, incomingCampaignFingerprint: null }), false);
  assert.equal(shouldStartNewSession({ ...base, incomingCampaignFingerprint: "google" }), true);
  assert.equal(shouldStartNewSession({ ...base, now: 40_000, incomingCampaignFingerprint: null }), true);
});

test("webhook usa order_id interno e impede regressão de estado financeiro fora de ordem", async () => {
  const webhook = await read("src/app/api/webhooks/pagarme/route.ts");
  assert.match(webhook, /data\.metadata\?\.order_id/);
  assert.match(webhook, /orderRow\.status === "refunded" && params\.status !== "refunded"/);
  assert.match(webhook, /orderRow\.status === "paid" && params\.status === "refused"/);
});

test("checkout e painel degradam sem bloquear quando tracking está indisponível", async () => {
  const client = await read("src/lib/tracking/client.ts");
  const server = await read("src/lib/tracking/server.ts");
  const dashboard = await read("src/app/app/(paid)/admin/metricas/metrics-dashboard.tsx");
  assert.match(client, /\.catch\(\(\) => undefined\)/);
  assert.match(server, /if \(!session\) return null/);
  assert.match(dashboard, /trackingUnavailable/);
});
