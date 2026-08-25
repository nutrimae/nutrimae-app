import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSuggestions } from "../src/lib/admin/suggestions.ts";

function baseMetrics(overrides = {}) {
  return {
    computedAt: new Date().toISOString(),
    mrrCents: 0,
    oneTimeRevenueCents: { today: 0, last7d: 0, last30d: 0 },
    activeSubscribers: 100,
    newSubscribers: { today: 0, last7d: 0, last30d: 0 },
    cancellations: { today: 0, last7d: 0, last30d: 0 },
    bumpAdoptionRatePercent: 20,
    oto1AdoptionRatePercent: 10,
    oto2AdoptionRatePercent: 5,
    mensalMixPercent: 0,
    anualMixPercent: 100,
    retentionD30Percent: 90,
    refunds: { count: 0, amountCents: 0 },
    chargebacks: { count: 0, amountCents: 0 },
    refundRatePercent: 0,
    pendingPayments: { count: 0, amountCents: 0 },
    ...overrides,
  };
}

function historyOf(days, bumpRate) {
  return Array.from({ length: days }, (_, i) => ({
    metric_date: `2026-01-${String(days - i).padStart(2, "0")}`,
    bump_adoption_rate: bumpRate,
    oto1_adoption_rate: 10,
    oto2_adoption_rate: 5,
    cancellations: 1,
    refunds_count: 0,
    chargebacks_count: 0,
  }));
}

test("sem historico minimo (menos de 7 dias), nao gera nenhuma sugestao", () => {
  const metrics = baseMetrics({ bumpAdoptionRatePercent: 5 }); // bem abaixo do que seria a media
  const suggestions = generateSuggestions(metrics, historyOf(3, 25));
  assert.equal(suggestions.length, 0, "nao pode sugerir nada com menos de 7 dias de historico");
});

test("queda real do bump (>=5 pontos vs media de 7 dias) gera sugestao com os numeros certos", () => {
  const metrics = baseMetrics({ bumpAdoptionRatePercent: 12 }); // media historica = 20, caiu 8 pontos
  const suggestions = generateSuggestions(metrics, historyOf(10, 20));
  const bumpSuggestion = suggestions.find((s) => s.metricKey === "bump_adoption_rate");
  assert.ok(bumpSuggestion, "deveria ter gerado sugestao de queda do bump");
  assert.match(bumpSuggestion.text, /caiu/);
  assert.match(bumpSuggestion.text, /8\.0 pontos/);
  assert.match(bumpSuggestion.text, /12\.0%/);
  assert.match(bumpSuggestion.text, /20\.0%/);
  assert.equal(bumpSuggestion.severity, "warning");
});

test("variacao pequena (dentro do ruido normal) NAO gera sugestao", () => {
  const metrics = baseMetrics({ bumpAdoptionRatePercent: 19 }); // so 1 ponto abaixo da media de 20
  const suggestions = generateSuggestions(metrics, historyOf(10, 20));
  assert.equal(suggestions.find((s) => s.metricKey === "bump_adoption_rate"), undefined);
});

test("subida do bump nao conta como alerta (so queda e ruim pra essa metrica)", () => {
  const metrics = baseMetrics({ bumpAdoptionRatePercent: 35 }); // 15 pontos ACIMA da media
  const suggestions = generateSuggestions(metrics, historyOf(10, 20));
  assert.equal(suggestions.find((s) => s.metricKey === "bump_adoption_rate"), undefined, "bump alto e bom, nao deveria alertar");
});

test("pico de cancelamento (>=2x a media de 30 dias) gera sugestao", () => {
  const history = historyOf(10, 20).map((row) => ({ ...row, cancellations: 2 }));
  const metrics = baseMetrics({ cancellations: { today: 6, last7d: 6, last30d: 6 } }); // media historica ~2, hoje 6
  const suggestions = generateSuggestions(metrics, history);
  const cancelSuggestion = suggestions.find((s) => s.metricKey === "cancellations");
  assert.ok(cancelSuggestion, "deveria ter alertado sobre pico de cancelamento");
});

test("sugestao nunca aparece como se fosse fato — sempre usa linguagem de observacao", () => {
  const metrics = baseMetrics({ bumpAdoptionRatePercent: 10 });
  const suggestions = generateSuggestions(metrics, historyOf(10, 20));
  for (const s of suggestions) {
    assert.match(s.text, /vale checar|acima da média/, "texto da sugestao precisa soar como observacao, nao decisao");
  }
});
