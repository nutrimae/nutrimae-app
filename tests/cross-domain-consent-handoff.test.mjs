// Regressão: nutrimae.app (landing) e app.nutrimae.app (checkout) são
// origens diferentes -- localStorage não atravessa esse limite. Sem repassar
// a escolha de consentimento já feita na landing, o checkout reexibe o
// banner do zero, e quem não reage a ele fica sem NENHUMA sessão registrada
// mesmo já tendo aceitado o rastreamento na landing (achado real: Meta
// reportou 19 InitiateCheckout, nosso painel só capturou 9 sessões).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("checkout: TrackingConsentManager semeia o consentimento a partir de ?consent= quando ainda é 'unknown'", () => {
  const src = read("src/components/tracking-consent.tsx");
  assert.match(src, /searchParams\.get\("consent"\)/);
  assert.match(src, /forwarded === "denied" \|\| forwarded === "analytics" \|\| forwarded === "marketing"/);
  assert.match(src, /setTrackingConsent\(forwarded\)/);
});

test("checkout: só semeia via URL se o consentimento local ainda for 'unknown' (nunca sobrescreve uma escolha já feita nesta origem)", () => {
  const src = read("src/components/tracking-consent.tsx");
  const effectBody = src.slice(src.indexOf("useEffect(() => {"), src.indexOf("function choose"));
  assert.match(effectBody, /current === "unknown" \? searchParams\.get\("consent"\) : null/);
});
