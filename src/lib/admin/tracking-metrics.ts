import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any>;

export interface TrackingMetrics {
  periodDays: 30;
  funnel: Record<string, number>;
  attribution: Array<{ source: string; campaign: string; creative: string; purchases: number; revenueCents: number }>;
  spendCents: number | null;
  cpaCents: number | null;
  roas: number | null;
  health: {
    lastEventAt: string | null;
    events24h: number;
    outboxPending: number;
    outboxErrors: number;
    paidOrders: number;
    unattributedPurchases: number;
    purchasesMissingEvent: number;
    attributionCoveragePercent: number | null;
  };
}

function sinceDays(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function computeTrackingMetrics(admin: AdminClient): Promise<TrackingMetrics> {
  const since30 = sinceDays(30);
  const since24 = sinceDays(1);
  const { data: events } = await admin.from("analytics_events")
    .select("event_name, visitor_id, session_id, order_id, received_at")
    .eq("is_internal", false).gte("received_at", since30).order("received_at", { ascending: false });

  const eventRows = events ?? [];
  const funnelNames = ["landing_viewed", "quiz_started", "quiz_completed", "vsl_started", "vsl_completed", "checkout_viewed", "checkout_submitted", "purchase_confirmed"];
  const funnel: Record<string, number> = {};
  for (const name of funnelNames) {
    const rows = eventRows.filter((event: { event_name: string }) => event.event_name === name);
    const keys = new Set(rows.map((event: { visitor_id: string | null; session_id: string | null; order_id: string | null }) => event.order_id ?? event.session_id ?? event.visitor_id).filter(Boolean));
    funnel[name] = keys.size;
  }

  const { data: paidOrders } = await admin.from("orders")
    .select("id, amount_cents, last_attribution_id, metadata")
    .eq("status", "paid").gte("created_at", since30);
  const externalOrders = (paidOrders ?? []).filter((order: { metadata: { tracking_internal?: boolean } | null }) => !order.metadata?.tracking_internal);
  const attributionIds = [...new Set(externalOrders.map((order: { last_attribution_id: string | null }) => order.last_attribution_id).filter(Boolean))] as string[];
  const { data: attributions } = attributionIds.length
    ? await admin.from("analytics_attributions").select("id, source, campaign, creative_id").in("id", attributionIds)
    : { data: [] };
  const creativeIds = [...new Set((attributions ?? []).map((item: { creative_id: string | null }) => item.creative_id).filter(Boolean))] as string[];
  const { data: creatives } = creativeIds.length
    ? await admin.from("marketing_creatives").select("id, name").in("id", creativeIds)
    : { data: [] };
  const attributionById = new Map((attributions ?? []).map((row: { id: string }) => [row.id, row]));
  const creativeById = new Map((creatives ?? []).map((row: { id: string; name: string }) => [row.id, row.name]));
  const groups = new Map<string, { source: string; campaign: string; creative: string; purchases: number; revenueCents: number }>();
  for (const order of externalOrders) {
    const attr = attributionById.get(order.last_attribution_id) as { source?: string | null; campaign?: string | null; creative_id?: string | null } | undefined;
    const source = attr?.source ?? "não atribuído";
    const campaign = attr?.campaign ?? "—";
    const creative = attr?.creative_id ? creativeById.get(attr.creative_id) ?? attr.creative_id : "—";
    const key = `${source}\u0000${campaign}\u0000${creative}`;
    const current = groups.get(key) ?? { source, campaign, creative, purchases: 0, revenueCents: 0 };
    current.purchases += 1;
    current.revenueCents += order.amount_cents;
    groups.set(key, current);
  }

  const today = new Date().toISOString().slice(0, 10);
  const startDate = since30.slice(0, 10);
  const { data: spendRows } = await admin.from("ad_spend_daily").select("spend_cents").gte("spend_date", startDate).lte("spend_date", today);
  const hasSpend = Boolean(spendRows?.length);
  const spendCents = hasSpend ? (spendRows ?? []).reduce((sum: number, row: { spend_cents: number }) => sum + row.spend_cents, 0) : null;
  const totalRevenue = externalOrders.reduce((sum: number, order: { amount_cents: number }) => sum + order.amount_cents, 0);
  const attributedCount = externalOrders.filter((order: { last_attribution_id: string | null }) => order.last_attribution_id).length;

  const { count: pending } = await admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "pending");
  const { count: errors } = await admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "error");
  const purchaseEventOrderIds = new Set(eventRows.filter((event: { event_name: string }) => event.event_name === "purchase_confirmed").map((event: { order_id: string | null }) => event.order_id).filter(Boolean));

  return {
    periodDays: 30,
    funnel,
    attribution: [...groups.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    spendCents,
    cpaCents: spendCents !== null && externalOrders.length > 0 ? Math.round(spendCents / externalOrders.length) : null,
    roas: spendCents !== null && spendCents > 0 ? Math.round((totalRevenue / spendCents) * 100) / 100 : null,
    health: {
      lastEventAt: eventRows[0]?.received_at ?? null,
      events24h: eventRows.filter((event: { received_at: string }) => event.received_at >= since24).length,
      outboxPending: pending ?? 0,
      outboxErrors: errors ?? 0,
      paidOrders: externalOrders.length,
      unattributedPurchases: externalOrders.length - attributedCount,
      purchasesMissingEvent: externalOrders.filter((order: { id: string }) => !purchaseEventOrderIds.has(order.id)).length,
      attributionCoveragePercent: externalOrders.length > 0 ? Math.round((attributedCount / externalOrders.length) * 10000) / 100 : null,
    },
  };
}
