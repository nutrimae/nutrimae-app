import type { AdminMetrics } from "./metrics";

/**
 * Sugestões do painel — comparação estatística determinística contra a
 * média histórica, NUNCA um número solto ("saiu do padrão" é sempre
 * relativo à média dos últimos 7/30 dias, nunca ao vácuo). Isto é
 * deliberadamente uma regra fixa, não uma chamada de LLM: roda dentro de
 * um cron/serverless function, então precisa ser barato, determinístico e
 * sem depender de uma chave de API externa disponível ou não.
 *
 * Se um dia quiser trocar a frase gerada por uma chamada real à API da
 * Claude (pra soar mais natural), o ponto de troca é só a função
 * `phraseSuggestion` abaixo — a DETECÇÃO (o que conta como "fora do
 * padrão") deve continuar aqui, determinística, não dentro do prompt de
 * um LLM.
 */

export interface DailyHistoryRow {
  metric_date: string;
  bump_adoption_rate: number | null;
  oto1_adoption_rate: number | null;
  oto2_adoption_rate: number | null;
  cancellations: number;
  refunds_count: number;
  chargebacks_count: number;
}

export interface Suggestion {
  metricKey: string;
  text: string;
  severity: "info" | "warning";
}

const MIN_HISTORY_DAYS = 7;

function average(values: number[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !Number.isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

/**
 * Compara o valor de hoje com a média histórica de uma métrica de
 * percentual (bump/OTO1/OTO2). Só sugere se: (a) tem histórico mínimo, e
 * (b) o desvio é grande o bastante pra não ser ruído do dia a dia.
 */
function comparePercentMetric(
  metricKey: string,
  label: string,
  todayValue: number | null,
  history: DailyHistoryRow[],
  extract: (row: DailyHistoryRow) => number | null,
  direction: "drop_is_bad" | "rise_is_bad",
): Suggestion | null {
  if (todayValue === null || history.length < MIN_HISTORY_DAYS) return null;

  const last7 = history.slice(0, 7).map(extract).filter((v): v is number => v !== null);
  const avg7 = average(last7);
  if (avg7 === null || avg7 === 0) return null;

  const deltaPoints = todayValue - avg7;
  const isBad = direction === "drop_is_bad" ? deltaPoints <= -5 : deltaPoints >= 5;
  if (!isBad) return null;

  const verb = deltaPoints < 0 ? "caiu" : "subiu";
  return {
    metricKey,
    severity: "warning",
    text: `${label} ${verb} ${Math.abs(deltaPoints).toFixed(1)} pontos hoje (${todayValue.toFixed(1)}%) em relação à média dos últimos 7 dias (${avg7.toFixed(1)}%) — vale checar.`,
  };
}

function compareCountMetric(
  metricKey: string,
  label: string,
  todayValue: number,
  history: DailyHistoryRow[],
  extract: (row: DailyHistoryRow) => number,
): Suggestion | null {
  if (history.length < MIN_HISTORY_DAYS) return null;

  const last30 = history.slice(0, 30).map(extract);
  const avg30 = average(last30);
  if (avg30 === null) return null;

  // Só sugere se hoje está pelo menos 2x a média (e a média não é
  // desprezível — evita "1 vs 0.3" virar alarme falso).
  if (avg30 < 1 || todayValue < avg30 * 2) return null;

  return {
    metricKey,
    severity: "warning",
    text: `${label} hoje (${todayValue}) está bem acima da média dos últimos 30 dias (${avg30.toFixed(1)}) — vale checar.`,
  };
}

export function generateSuggestions(today: AdminMetrics, history: DailyHistoryRow[]): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const bump = comparePercentMetric(
    "bump_adoption_rate",
    "Taxa de adesão do order bump",
    today.bumpAdoptionRatePercent,
    history,
    (r) => r.bump_adoption_rate,
    "drop_is_bad",
  );
  if (bump) suggestions.push(bump);

  const oto1 = comparePercentMetric(
    "oto1_adoption_rate",
    "Taxa de adesão do OTO1",
    today.oto1AdoptionRatePercent,
    history,
    (r) => r.oto1_adoption_rate,
    "drop_is_bad",
  );
  if (oto1) suggestions.push(oto1);

  const oto2 = comparePercentMetric(
    "oto2_adoption_rate",
    "Taxa de adesão do OTO2",
    today.oto2AdoptionRatePercent,
    history,
    (r) => r.oto2_adoption_rate,
    "drop_is_bad",
  );
  if (oto2) suggestions.push(oto2);

  const cancellations = compareCountMetric(
    "cancellations",
    "Cancelamentos",
    today.cancellations.today,
    history,
    (r) => r.cancellations,
  );
  if (cancellations) suggestions.push(cancellations);

  const refundEvents = today.refunds.count + today.chargebacks.count;
  const refunds = compareCountMetric(
    "refunds",
    "Reembolsos/chargebacks",
    refundEvents,
    history,
    (r) => r.refunds_count + r.chargebacks_count,
  );
  if (refunds) suggestions.push(refunds);

  return suggestions;
}
