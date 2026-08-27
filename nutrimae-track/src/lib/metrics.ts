import { createTrackingClient } from "./supabase";

/**
 * Métricas do painel — lê as mesmas tabelas analytics_* que o app principal
 * grava (ver supabase/migrations/202608260001_tracking_v1_foundation.sql).
 * Adaptação de src/lib/admin/tracking-metrics.ts (repo raiz), com período
 * parametrizado e agregação de gasto por campanha.
 *
 * Tráfego interno (is_internal) é sempre excluído.
 */

export interface CampaignRow {
  campaign: string;
  source: string;
  sessions: number;
  purchases: number;
  revenueCents: number;
  spendCents: number;
  clicks: number;
  impressions: number;
}

export interface DashboardMetrics {
  periodDays: number;
  visitors: number;
  sessions: number;
  purchases: number;
  revenueCents: number;
  /** null = nenhum gasto importado no período ("gasto ainda não importado") */
  spendCents: number | null;
  roas: number | null;
  cpaCents: number | null;
  funnel: Array<{ name: string; label: string; count: number }>;
  campaigns: CampaignRow[];
  health: {
    lastEventAt: string | null;
    events24h: number;
    outboxPending: number;
    outboxErrors: number;
    unattributedPurchases: number;
    attributionCoveragePercent: number | null;
  };
}

const FUNNEL_STEPS = [
  { name: "landing_viewed", label: "Landing" },
  { name: "quiz_started", label: "Quiz iniciado" },
  { name: "quiz_completed", label: "Quiz completo" },
  { name: "vsl_started", label: "VSL iniciada" },
  { name: "vsl_completed", label: "VSL completa" },
  { name: "checkout_viewed", label: "Checkout visto" },
  { name: "checkout_submitted", label: "Checkout enviado" },
  { name: "purchase_confirmed", label: "Compra confirmada" },
] as const;

const UNATTRIBUTED_KEY = "não atribuído";

type EventRow = { event_name: string; visitor_id: string | null; session_id: string | null; order_id: string | null; received_at: string };
type OrderRow = { id: string; amount_cents: number; last_attribution_id: string | null; metadata: { tracking_internal?: boolean } | null };
type AttributionRow = { id: string; source: string | null; campaign: string | null; campaign_id: string | null };
type SessionAttributionRow = { session_id: string | null; source: string | null; campaign: string | null; campaign_id: string | null };
type SpendRow = { campaign_id: string; spend_cents: number; clicks: number | null; impressions: number | null };

function campaignKey(input: { campaign_id?: string | null; campaign?: string | null }): string {
  if (input.campaign_id) return `id:${input.campaign_id}`;
  if (input.campaign) return `name:${input.campaign}`;
  return UNATTRIBUTED_KEY;
}

export async function getDashboardMetrics(periodDays: number): Promise<DashboardMetrics> {
  const admin = createTrackingClient();
  const since = new Date(Date.now() - periodDays * 86_400_000).toISOString();
  const since24h = new Date(Date.now() - 86_400_000).toISOString();

  const [visitorsRes, sessionsRes, eventsRes, ordersRes, sessionAttrsRes, spendRes, pendingRes, errorsRes] = await Promise.all([
    admin.from("analytics_visitors").select("id", { count: "exact", head: true }).eq("is_internal", false).gte("first_seen_at", since),
    admin.from("analytics_sessions").select("id", { count: "exact", head: true }).eq("is_internal", false).gte("started_at", since),
    // TODO(escala): paginar quando o volume de eventos crescer — hoje (V1) o volume é baixo.
    admin.from("analytics_events").select("event_name, visitor_id, session_id, order_id, received_at").eq("is_internal", false).gte("received_at", since).order("received_at", { ascending: false }).limit(10000),
    admin.from("orders").select("id, amount_cents, last_attribution_id, metadata").eq("status", "paid").gte("created_at", since),
    // 1 atribuição do tipo "session" por sessão (índice único) — contar linhas = contar sessões atribuídas.
    admin.from("analytics_attributions").select("session_id, source, campaign, campaign_id").eq("attribution_type", "session").gte("captured_at", since),
    admin.from("ad_spend_daily").select("campaign_id, spend_cents, clicks, impressions").gte("spend_date", since.slice(0, 10)),
    admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "error"),
  ]);

  const eventRows = (eventsRes.data ?? []) as EventRow[];
  const paidOrders = ((ordersRes.data ?? []) as OrderRow[]).filter((order) => !order.metadata?.tracking_internal);

  // Atribuições das compras (para receita por campanha)
  const attributionIds = [...new Set(paidOrders.map((o) => o.last_attribution_id).filter(Boolean))] as string[];
  const { data: attributionsData } = attributionIds.length
    ? await admin.from("analytics_attributions").select("id, source, campaign, campaign_id").in("id", attributionIds)
    : { data: [] as AttributionRow[] };
  const attributionById = new Map(((attributionsData ?? []) as AttributionRow[]).map((row) => [row.id, row]));

  // ── Agregação por campanha ─────────────────────────────────────────────
  // Chave: campaign_id da plataforma quando existe (casa gasto × receita),
  // senão o nome da campanha, senão "não atribuído".
  const buckets = new Map<string, CampaignRow>();
  function bucketFor(key: string, label: { campaign: string; source: string }): CampaignRow {
    const existing = buckets.get(key);
    if (existing) {
      // Upgrade de rótulo: prefere nome de campanha real a id cru.
      if (existing.campaign.startsWith("id:") && label.campaign !== existing.campaign) existing.campaign = label.campaign;
      if (existing.source === "—" && label.source !== "—") existing.source = label.source;
      return existing;
    }
    const created: CampaignRow = { campaign: label.campaign, source: label.source, sessions: 0, purchases: 0, revenueCents: 0, spendCents: 0, clicks: 0, impressions: 0 };
    buckets.set(key, created);
    return created;
  }

  for (const attr of (sessionAttrsRes.data ?? []) as SessionAttributionRow[]) {
    const key = campaignKey(attr);
    bucketFor(key, { campaign: attr.campaign ?? attr.campaign_id ?? UNATTRIBUTED_KEY, source: attr.source ?? "—" }).sessions += 1;
  }

  for (const order of paidOrders) {
    const attr = order.last_attribution_id ? attributionById.get(order.last_attribution_id) : undefined;
    const key = attr ? campaignKey(attr) : UNATTRIBUTED_KEY;
    const bucket = bucketFor(key, { campaign: attr?.campaign ?? attr?.campaign_id ?? UNATTRIBUTED_KEY, source: attr?.source ?? "—" });
    bucket.purchases += 1;
    bucket.revenueCents += order.amount_cents;
  }

  for (const spend of (spendRes.data ?? []) as SpendRow[]) {
    const key = spend.campaign_id ? `id:${spend.campaign_id}` : "sem-campanha";
    const bucket = bucketFor(key, { campaign: spend.campaign_id || "(gasto sem campanha)", source: "—" });
    bucket.spendCents += spend.spend_cents;
    bucket.clicks += spend.clicks ?? 0;
    bucket.impressions += spend.impressions ?? 0;
  }

  // ── Funil (dedup por order > sessão > visitante, como o painel principal) ──
  const funnel = FUNNEL_STEPS.map(({ name, label }) => {
    const keys = new Set(
      eventRows
        .filter((event) => event.event_name === name)
        .map((event) => event.order_id ?? event.session_id ?? event.visitor_id)
        .filter(Boolean),
    );
    return { name, label, count: keys.size };
  });

  // ── Totais ──────────────────────────────────────────────────────────────
  const revenueCents = paidOrders.reduce((sum, order) => sum + order.amount_cents, 0);
  const spendRows = (spendRes.data ?? []) as SpendRow[];
  const spendCents = spendRows.length ? spendRows.reduce((sum, row) => sum + row.spend_cents, 0) : null;
  const attributedCount = paidOrders.filter((order) => order.last_attribution_id).length;

  return {
    periodDays,
    visitors: visitorsRes.count ?? 0,
    sessions: sessionsRes.count ?? 0,
    purchases: paidOrders.length,
    revenueCents,
    spendCents,
    roas: spendCents ? Math.round((revenueCents / spendCents) * 100) / 100 : null,
    cpaCents: spendCents !== null && paidOrders.length > 0 ? Math.round(spendCents / paidOrders.length) : null,
    funnel,
    campaigns: [...buckets.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.sessions - a.sessions),
    health: {
      lastEventAt: eventRows[0]?.received_at ?? null,
      events24h: eventRows.filter((event) => event.received_at >= since24h).length,
      outboxPending: pendingRes.count ?? 0,
      outboxErrors: errorsRes.count ?? 0,
      unattributedPurchases: paidOrders.length - attributedCount,
      attributionCoveragePercent: paidOrders.length > 0 ? Math.round((attributedCount / paidOrders.length) * 1000) / 10 : null,
    },
  };
}
