"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  BadgePercent,
  CreditCard,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { BackButton } from "@/components/back-button";
import type { AdminMetrics } from "@/lib/admin/metrics";
import type { Suggestion } from "@/lib/admin/suggestions";
import type { TrackingMetrics } from "@/lib/admin/tracking-metrics";
import Link from "next/link";

interface Threshold {
  id: string;
  metric_key: string;
  label: string;
  comparison: "above" | "below";
  threshold_value: number;
  enabled: boolean;
}

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pctText(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function freshnessLabel(computedAt: string): { text: string; stale: boolean } {
  const ms = Date.now() - new Date(computedAt).getTime();
  const minutes = Math.round(ms / 60_000);
  const stale = minutes > 30;
  if (minutes < 1) return { text: "atualizado agora mesmo", stale };
  if (minutes < 60) return { text: `atualizado há ${minutes} min`, stale };
  const hours = Math.round(minutes / 60);
  return { text: `atualizado há ${hours}h`, stale: true };
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl bg-white/90 p-4 shadow-sm border border-brown-900/5">
      <div className="flex items-center gap-2 text-brown-700/86">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 font-heading text-2xl font-bold text-brown-800">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-brown-700/86">{sub}</p>}
    </div>
  );
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [computedAt, setComputedAt] = useState<string | null>(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [tracking, setTracking] = useState<TrackingMetrics | null>(null);
  const [trackingUnavailable, setTrackingUnavailable] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/metrics", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMetrics(data.metrics);
      setSuggestions(data.suggestions ?? []);
      setComputedAt(data.computedAt);
      setRefreshFailed(Boolean(data.refreshFailed));
    }
    setLoading(false);
  }, []);

  const loadThresholds = useCallback(async () => {
    const res = await fetch("/api/admin/metrics/thresholds");
    if (res.ok) {
      const data = await res.json();
      setThresholds(data.thresholds ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadThresholds();
    void fetch("/api/admin/tracking", { cache: "no-store" }).then(async (res) => {
      if (!res.ok) { setTrackingUnavailable(true); return; }
      const data = await res.json();
      setTracking(data.metrics);
    }).catch(() => setTrackingUnavailable(true));
  }, [load, loadThresholds]);

  async function handleManualRefresh() {
    setRefreshing(true);
    await fetch("/api/admin/metrics/refresh", { method: "POST" });
    await load();
    setRefreshing(false);
  }

  async function handleThresholdSave(threshold: Threshold) {
    await fetch("/api/admin/metrics/thresholds", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: threshold.id, threshold_value: threshold.threshold_value, enabled: threshold.enabled }),
    });
  }

  if (loading || !metrics || !computedAt) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6">
        <BackButton />
        <p className="py-12 text-center text-sm text-brown-700">Carregando métricas...</p>
      </main>
    );
  }

  const fresh = freshnessLabel(computedAt);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6 pb-16">
      <BackButton />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-800">Painel do negócio</h1>
          <p className={`mt-1 text-xs font-semibold ${fresh.stale || refreshFailed ? "text-terracotta-600" : "text-sage-600"}`}>
            {refreshFailed ? "⚠️ Falha ao atualizar — mostrando o último dado válido, " : ""}
            {fresh.text}
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-brown-700 active:bg-gray-200"
          title="Atualizar agora"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Bloco de sugestões — visualmente separado do dado bruto, nunca
          misturado como se fosse fato. */}
      {suggestions.length > 0 && (
        <section className="flex flex-col gap-2">
          {suggestions.map((s) => (
            <div key={s.metricKey} className="flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-3.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Alerta de variação — vale checar, não é uma decisão tomada</p>
                <p className="mt-0.5 text-sm text-brown-800">{s.text}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <MetricCard icon={<Wallet className="h-4 w-4" />} label="MRR" value={brl(metrics.mrrCents)} sub="assinatura recorrente" />
        <MetricCard icon={<Wallet className="h-4 w-4" />} label="Receita hoje" value={brl(metrics.oneTimeRevenueCents.today)} sub={`7d: ${brl(metrics.oneTimeRevenueCents.last7d)}`} />
        <MetricCard icon={<Users className="h-4 w-4" />} label="Assinantes ativos" value={String(metrics.activeSubscribers)} />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Novos hoje" value={String(metrics.newSubscribers.today)} sub={`30d: ${metrics.newSubscribers.last30d}`} />
        <MetricCard icon={<TrendingDown className="h-4 w-4" />} label="Cancelamentos hoje" value={String(metrics.cancellations.today)} sub={`30d: ${metrics.cancellations.last30d}`} />
        <MetricCard icon={<BadgePercent className="h-4 w-4" />} label="Bump" value={pctText(metrics.bumpAdoptionRatePercent)} sub="adesão, 30d" />
        <MetricCard icon={<BadgePercent className="h-4 w-4" />} label="OTO1" value={pctText(metrics.oto1AdoptionRatePercent)} sub="batch-cooking" />
        <MetricCard icon={<BadgePercent className="h-4 w-4" />} label="OTO2" value={pctText(metrics.oto2AdoptionRatePercent)} sub="downsell" />
        <MetricCard icon={<Users className="h-4 w-4" />} label="Mix mensal x anual" value={`${pctText(metrics.mensalMixPercent)} / ${pctText(metrics.anualMixPercent)}`} />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Retenção D30" value={pctText(metrics.retentionD30Percent)} />
        <MetricCard icon={<AlertTriangle className="h-4 w-4" />} label="Reembolsos" value={String(metrics.refunds.count)} sub={brl(metrics.refunds.amountCents)} />
        <MetricCard icon={<AlertTriangle className="h-4 w-4" />} label="Chargebacks" value={String(metrics.chargebacks.count)} sub={brl(metrics.chargebacks.amountCents)} />
        <MetricCard icon={<CreditCard className="h-4 w-4" />} label="Pendentes" value={String(metrics.pendingPayments.count)} sub={brl(metrics.pendingPayments.amountCents)} />
      </section>

      <section className="rounded-3xl bg-white/90 p-4 shadow-sm border border-brown-900/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-bold text-brown-800">Tracking V1 · últimos 30 dias</h2>
            <p className="mt-1 text-xs text-brown-700/70">Somente tráfego externo e compras confirmadas.</p>
          </div>
          <Link href="/app/admin/criativos" className="rounded-xl bg-primary-50 px-3 py-2 text-xs font-bold text-primary-600">Creative Lab</Link>
        </div>
        {trackingUnavailable ? (
          <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Tracking indisponível. As métricas financeiras acima continuam válidas.</p>
        ) : tracking ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MetricCard icon={<Users className="h-4 w-4" />} label="Landing" value={String(tracking.funnel.landing_viewed ?? 0)} />
              <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Quiz completo" value={String(tracking.funnel.quiz_completed ?? 0)} />
              <MetricCard icon={<CreditCard className="h-4 w-4" />} label="Checkout" value={String(tracking.funnel.checkout_viewed ?? 0)} />
              <MetricCard icon={<Wallet className="h-4 w-4" />} label="Compras" value={String(tracking.funnel.purchase_confirmed ?? 0)} />
              <MetricCard icon={<BadgePercent className="h-4 w-4" />} label="CPA" value={tracking.cpaCents === null ? "Indisponível" : brl(tracking.cpaCents)} sub={tracking.spendCents === null ? "gasto não importado" : undefined} />
              <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="ROAS" value={tracking.roas === null ? "Indisponível" : `${tracking.roas.toFixed(2)}x`} sub={tracking.spendCents === null ? "gasto não importado" : undefined} />
            </div>
            <div className={`mt-3 rounded-2xl p-3 text-sm ${tracking.health.outboxErrors || tracking.health.purchasesMissingEvent ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"}`}>
              <p className="font-bold">Saúde do tracking</p>
              <p className="mt-1 text-xs">Cobertura: {tracking.health.attributionCoveragePercent === null ? "sem compras" : `${tracking.health.attributionCoveragePercent}%`} · Sem atribuição: {tracking.health.unattributedPurchases} · Compra sem evento: {tracking.health.purchasesMissingEvent} · Outbox com erro: {tracking.health.outboxErrors}</p>
            </div>
            {tracking.attribution.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead><tr className="text-brown-700/70"><th className="pb-2">Origem</th><th>Campanha</th><th>Criativo</th><th>Compras</th><th>Receita</th></tr></thead>
                  <tbody>{tracking.attribution.map((row) => <tr key={`${row.source}-${row.campaign}-${row.creative}`} className="border-t border-gray-100"><td className="py-2 font-semibold">{row.source}</td><td>{row.campaign}</td><td>{row.creative}</td><td>{row.purchases}</td><td>{brl(row.revenueCents)}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <p className="mt-4 text-sm text-brown-700/70">Ainda não há compras externas atribuídas neste período.</p>}
          </>
        ) : <p className="mt-4 text-sm text-brown-700/70">Carregando dados do funil...</p>}
      </section>

      <section className="rounded-3xl bg-white/90 p-4 shadow-sm border border-brown-900/5">
        <h2 className="font-heading text-base font-bold text-brown-800">Limites de alerta (WhatsApp)</h2>
        <p className="mt-1 text-xs text-brown-700/86">Quando cruzados, avisa por WhatsApp os números marcados como admin — no máximo 1x por dia por métrica.</p>
        <div className="mt-3 flex flex-col gap-2">
          {thresholds.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 rounded-2xl bg-gray-50 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-brown-800">{t.label}</p>
                <p className="text-[11px] text-brown-700/86">{t.comparison === "above" ? "acima de" : "abaixo de"}</p>
              </div>
              <input
                type="number"
                value={t.threshold_value}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setThresholds((prev) => prev.map((x) => (x.id === t.id ? { ...x, threshold_value: value } : x)));
                }}
                onBlur={() => handleThresholdSave(t)}
                className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-xs"
              />
              <input
                type="checkbox"
                checked={t.enabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setThresholds((prev) => prev.map((x) => (x.id === t.id ? { ...x, enabled } : x)));
                  void handleThresholdSave({ ...t, enabled });
                }}
                className="h-4 w-4 accent-sage-600"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
