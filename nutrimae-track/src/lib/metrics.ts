import { createTrackingClient } from "./supabase";

/**
 * Métricas do painel — conjunto de informações estilo Utmify:
 * dinheiro primeiro (faturamento, vendas, investimento, lucro, ROAS),
 * ritmo diário e ROI por campanha. Lê as mesmas tabelas analytics_* que o
 * app principal grava (supabase/migrations/202608260001_tracking_v1_foundation.sql).
 * Tráfego interno (is_internal) é sempre excluído.
 */

export interface CampaignRow {
  campaign: string;
  source: string;
  sessions: number;
  purchases: number;
  revenueCents: number;
  spendCents: number;
  lucroCents: number;
  clicks: number;
}

export interface DayPoint {
  /** YYYY-MM-DD (America/Sao_Paulo) */
  date: string;
  /** DD/MM */
  label: string;
  revenueCents: number;
  spendCents: number;
}

export interface DashboardMetrics {
  periodDays: number;
  visitors: number;
  sessions: number;
  purchases: number;
  revenueCents: number;
  /** null = nenhum gasto importado no período ("gasto ainda não importado") */
  spendCents: number | null;
  lucroCents: number;
  roas: number | null;
  ticketMedioCents: number | null;
  cpaCents: number | null;
  /** compras / sessões, em % */
  conversionRate: number | null;
  daily: DayPoint[];
  campaigns: CampaignRow[];
  /** período anterior de mesma duração, para deltas */
  prev: { revenueCents: number; purchases: number; spendCents: number | null; lucroCents: number };
  health: { lastEventAt: string | null; outboxPending: number; outboxErrors: number };
}

const UNATTRIBUTED_KEY = "não atribuído";

type OrderRow = { id: string; amount_cents: number; created_at: string; last_attribution_id: string | null; metadata: { tracking_internal?: boolean } | null };
type AttributionRow = { id: string; source: string | null; campaign: string | null; campaign_id: string | null };
type SessionAttributionRow = { session_id: string | null; source: string | null; campaign: string | null; campaign_id: string | null };
type SpendRow = { spend_date: string; campaign_id: string; spend_cents: number; clicks: number | null };

/** Dia (YYYY-MM-DD) de um instante, no fuso de Brasília — os gráficos seguem o dia do dono, não o UTC. */
function dayKey(instant: Date): string {
  return instant.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function campaignKey(input: { campaign_id?: string | null; campaign?: string | null }): string {
  if (input.campaign_id) return `id:${input.campaign_id}`;
  if (input.campaign) return `name:${input.campaign}`;
  return UNATTRIBUTED_KEY;
}

export async function getDashboardMetrics(periodDays: number): Promise<DashboardMetrics> {
  const admin = createTrackingClient();
  const now = Date.now();
  const since = new Date(now - periodDays * 86_400_000).toISOString();
  const prevSince = new Date(now - 2 * periodDays * 86_400_000).toISOString();
  const startDate = since.slice(0, 10);
  const prevStartDate = prevSince.slice(0, 10);

  const [visitorsRes, sessionsRes, ordersRes, prevOrdersRes, sessionAttrsRes, spendRes, prevSpendRes, pendingRes, errorsRes] = await Promise.all([
    admin.from("analytics_visitors").select("id", { count: "exact", head: true }).eq("is_internal", false).gte("first_seen_at", since),
    admin.from("analytics_sessions").select("id", { count: "exact", head: true }).eq("is_internal", false).gte("started_at", since),
    admin.from("orders").select("id, amount_cents, created_at, last_attribution_id, metadata").eq("status", "paid").gte("created_at", since),
    admin.from("orders").select("id, amount_cents").eq("status", "paid").gte("created_at", prevSince).lt("created_at", since),
    // 1 atribuição do tipo "session" por sessão (índice único) — linhas = sessões atribuídas.
    admin.from("analytics_attributions").select("session_id, source, campaign, campaign_id").eq("attribution_type", "session").gte("captured_at", since),
    admin.from("ad_spend_daily").select("spend_date, campaign_id, spend_cents, clicks").gte("spend_date", startDate),
    admin.from("ad_spend_daily").select("spend_cents").gte("spend_date", prevStartDate).lt("spend_date", startDate),
    admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "error"),
  ]);

  const paidOrders = (ordersRes.data ?? []) as OrderRow[];
  const externalOrders = paidOrders.filter((order) => !order.metadata?.tracking_internal);
  const spendRows = (spendRes.data ?? []) as SpendRow[];

  // ── Série diária (zero-fill no fuso de Brasília) ───────────────────────
  const revenueByDay = new Map<string, number>();
  for (const order of externalOrders) {
    const key = dayKey(new Date(order.created_at));
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.amount_cents);
  }
  const spendByDay = new Map<string, number>();
  for (const row of spendRows) {
    spendByDay.set(row.spend_date, (spendByDay.get(row.spend_date) ?? 0) + row.spend_cents);
  }
  const daily: DayPoint[] = [];
  for (let i = periodDays - 1; i >= 0; i -= 1) {
    const instant = new Date(now - i * 86_400_000);
    const date = dayKey(instant);
    daily.push({
      date,
      label: instant.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }),
      revenueCents: revenueByDay.get(date) ?? 0,
      spendCents: spendByDay.get(date) ?? 0,
    });
  }

  // ── Período anterior (deltas) ──────────────────────────────────────────
  const prevRevenueCents = ((prevOrdersRes.data ?? []) as Array<{ amount_cents: number }>).reduce((sum, order) => sum + order.amount_cents, 0);
  const prevPurchases = ((prevOrdersRes.data ?? []) as unknown[]).length;
  const prevSpendRows = (prevSpendRes.data ?? []) as Array<{ spend_cents: number }>;
  const prevSpendCents = prevSpendRows.length ? prevSpendRows.reduce((sum, row) => sum + row.spend_cents, 0) : null;

  // ── Agregação por campanha ─────────────────────────────────────────────
  const attributionIds = [...new Set(externalOrders.map((o) => o.last_attribution_id).filter(Boolean))] as string[];
  const { data: attributionsData } = attributionIds.length
    ? await admin.from("analytics_attributions").select("id, source, campaign, campaign_id").in("id", attributionIds)
    : { data: [] as AttributionRow[] };
  const attributionById = new Map(((attributionsData ?? []) as AttributionRow[]).map((row) => [row.id, row]));

  const buckets = new Map<string, CampaignRow>();
  function bucketFor(key: string, label: { campaign: string; source: string }): CampaignRow {
    const existing = buckets.get(key);
    if (existing) {
      if (existing.campaign.startsWith("id:") && label.campaign !== existing.campaign) existing.campaign = label.campaign;
      if (existing.source === "—" && label.source !== "—") existing.source = label.source;
      return existing;
    }
    const created: CampaignRow = { campaign: label.campaign, source: label.source, sessions: 0, purchases: 0, revenueCents: 0, spendCents: 0, lucroCents: 0, clicks: 0 };
    buckets.set(key, created);
    return created;
  }

  for (const attr of (sessionAttrsRes.data ?? []) as SessionAttributionRow[]) {
    const key = campaignKey(attr);
    bucketFor(key, { campaign: attr.campaign ?? attr.campaign_id ?? UNATTRIBUTED_KEY, source: attr.source ?? "—" }).sessions += 1;
  }
  for (const order of externalOrders) {
    const attr = order.last_attribution_id ? attributionById.get(order.last_attribution_id) : undefined;
    const key = attr ? campaignKey(attr) : UNATTRIBUTED_KEY;
    const bucket = bucketFor(key, { campaign: attr?.campaign ?? attr?.campaign_id ?? UNATTRIBUTED_KEY, source: attr?.source ?? "—" });
    bucket.purchases += 1;
    bucket.revenueCents += order.amount_cents;
  }
  for (const spend of spendRows) {
    const key = spend.campaign_id ? `id:${spend.campaign_id}` : "sem-campanha";
    const bucket = bucketFor(key, { campaign: spend.campaign_id || "(gasto sem campanha)", source: "—" });
    bucket.spendCents += spend.spend_cents;
    bucket.clicks += spend.clicks ?? 0;
  }
  for (const bucket of buckets.values()) {
    bucket.lucroCents = bucket.revenueCents - bucket.spendCents;
  }

  // ── Totais ─────────────────────────────────────────────────────────────
  const revenueCents = externalOrders.reduce((sum, order) => sum + order.amount_cents, 0);
  const spendCents = spendRows.length ? spendRows.reduce((sum, row) => sum + row.spend_cents, 0) : null;
  const lucroCents = revenueCents - (spendCents ?? 0);
  const purchases = externalOrders.length;
  const sessions = sessionsRes.count ?? 0;
  const lastEvent = await admin
    .from("analytics_events")
    .select("received_at")
    .eq("is_internal", false)
    .order("received_at", { ascending: false })
    .limit(1);

  return {
    periodDays,
    visitors: visitorsRes.count ?? 0,
    sessions,
    purchases,
    revenueCents,
    spendCents,
    lucroCents,
    roas: spendCents ? Math.round((revenueCents / spendCents) * 100) / 100 : null,
    ticketMedioCents: purchases > 0 ? Math.round(revenueCents / purchases) : null,
    cpaCents: spendCents !== null && purchases > 0 ? Math.round(spendCents / purchases) : null,
    conversionRate: sessions > 0 ? Math.round((purchases / sessions) * 1000) / 10 : null,
    daily,
    campaigns: [...buckets.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.sessions - a.sessions),
    prev: {
      revenueCents: prevRevenueCents,
      purchases: prevPurchases,
      spendCents: prevSpendCents,
      lucroCents: prevRevenueCents - (prevSpendCents ?? 0),
    },
    health: {
      lastEventAt: (lastEvent.data?.[0] as { received_at: string } | undefined)?.received_at ?? null,
      outboxPending: pendingRes.count ?? 0,
      outboxErrors: errorsRes.count ?? 0,
    },
  };
}
