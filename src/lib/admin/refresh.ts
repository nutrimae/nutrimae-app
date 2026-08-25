import type { SupabaseClient } from "@supabase/supabase-js";
import { computeAdminMetrics, type AdminMetrics } from "./metrics";
import { generateSuggestions, type DailyHistoryRow, type Suggestion } from "./suggestions";
import { checkThresholdsAndAlert } from "./alerts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any>;

/**
 * Recalcula tudo e grava o cache — chamado pelo cron diário e, sob
 * demanda, pelo painel quando o cache está velho. Nunca chamar
 * computeAdminMetrics() direto fora daqui, senão o histórico usado nas
 * sugestões (admin_metrics_daily) fica sem essa leitura registrada.
 */
export async function refreshAdminMetricsCache(admin: AdminClient): Promise<{ metrics: AdminMetrics; suggestions: Suggestion[] }> {
  const metrics = await computeAdminMetrics(admin);
  const today = metrics.computedAt.slice(0, 10);

  await admin.from("admin_metrics_daily").upsert(
    {
      metric_date: today,
      mrr_cents: metrics.mrrCents,
      one_time_revenue_cents: metrics.oneTimeRevenueCents.today,
      active_subscribers: metrics.activeSubscribers,
      new_subscribers: metrics.newSubscribers.today,
      cancellations: metrics.cancellations.today,
      bump_adoption_rate: metrics.bumpAdoptionRatePercent,
      oto1_adoption_rate: metrics.oto1AdoptionRatePercent,
      oto2_adoption_rate: metrics.oto2AdoptionRatePercent,
      mensal_mix_percent: metrics.mensalMixPercent,
      anual_mix_percent: metrics.anualMixPercent,
      retention_d30_percent: metrics.retentionD30Percent,
      refunds_count: metrics.refunds.count,
      refunds_amount_cents: metrics.refunds.amountCents,
      chargebacks_count: metrics.chargebacks.count,
      chargebacks_amount_cents: metrics.chargebacks.amountCents,
      pending_payments_count: metrics.pendingPayments.count,
      pending_payments_amount_cents: metrics.pendingPayments.amountCents,
    },
    { onConflict: "metric_date" },
  );

  const { data: history } = await admin
    .from("admin_metrics_daily")
    .select("metric_date, bump_adoption_rate, oto1_adoption_rate, oto2_adoption_rate, cancellations, refunds_count, chargebacks_count")
    .lt("metric_date", today)
    .order("metric_date", { ascending: false })
    .limit(30);

  const suggestions = generateSuggestions(metrics, (history ?? []) as DailyHistoryRow[]);

  await admin.from("admin_metrics_cache").insert({
    metrics,
    suggestions,
    computed_at: metrics.computedAt,
  });

  await checkThresholdsAndAlert(admin, metrics);

  return { metrics, suggestions };
}
