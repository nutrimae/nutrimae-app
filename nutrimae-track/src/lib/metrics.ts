import { createTrackingClient } from "./supabase";

/**
 * Métricas do painel — conjunto de informações estilo Utmify:
 * dinheiro primeiro (faturamento, vendas, investimento, lucro, ROAS),
 * ritmo diário e ROI por campanha. Lê as mesmas tabelas analytics_* que o
 * app principal grava (supabase/migrations/202608260001_tracking_v1_foundation.sql).
 * Tráfego interno (is_internal) é sempre excluído.
 *
 * Extensão (multi-oferta): esse painel deixou de servir só o Plano Anual —
 * a partir de agora serve TODAS as ofertas (Mensal, bumps, upsells,
 * downsells, futuras). Por isso quase tudo aqui quebra por oferta, e as
 * campanhas/criativos agregam através de ofertas diferentes.
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
  /** true quando purchases < MIN_SAMPLE — ROAS/CPA ainda não são conclusivos. */
  lowSample: boolean;
}

export interface CreativeRow {
  creativeId: string;
  name: string;
  angle: string | null;
  hook: string | null;
  format: string | null;
  purchases: number;
  revenueCents: number;
  spendCents: number;
  roas: number | null;
  lowSample: boolean;
}

export interface OfferRow {
  offerId: string;
  offerName: string;
  isAddon: boolean;
  purchases: number;
  revenueCents: number;
  ticketMedioCents: number | null;
}

export interface PaymentMethodRow {
  method: string;
  purchases: number;
  revenueCents: number;
}

export interface FunnelData {
  sessions: number;
  checkoutViewed: number;
  checkoutSubmitted: number;
  purchases: number;
  /** sessão -> viu checkout, em % */
  sessionToViewedPct: number | null;
  /** viu checkout -> enviou o formulário, em % */
  viewedToSubmittedPct: number | null;
  /** enviou o formulário -> pagamento confirmado, em % */
  submittedToPurchasePct: number | null;
}

export interface RefundData {
  refundedCents: number;
  chargebackCents: number;
  refundCount: number;
  chargebackCount: number;
  /** (reembolsado + chargeback) / (receita do período + reembolsado + chargeback), aproximado — ver comentário em getDashboardMetrics. */
  lossRatePct: number | null;
}

export interface DashboardAlert {
  level: "critical" | "warning";
  message: string;
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
  creatives: CreativeRow[];
  offers: OfferRow[];
  paymentMethods: PaymentMethodRow[];
  funnel: FunnelData;
  refunds: RefundData;
  /** ROAS mínimo pra cobrir taxa do Pagar.me + Simples Nacional + margem de reembolso — ver BREAK_EVEN_ROAS. */
  breakEvenRoas: number;
  alerts: DashboardAlert[];
  suggestions: string[];
  /** período anterior de mesma duração, para deltas */
  prev: { revenueCents: number; purchases: number; spendCents: number | null; lucroCents: number };
  health: { lastEventAt: string | null; outboxPending: number; outboxErrors: number };
}

const UNATTRIBUTED_KEY = "não atribuído";

/**
 * ROAS de equilíbrio. NutriMãe é produto digital (sem custo de mercadoria),
 * mas ainda paga: taxa do Pagar.me (~4-5% no cartão, menor no Pix) + imposto
 * (Simples Nacional, varia por faixa de faturamento) + uma margem pra
 * reembolsos/chargebacks. 1.3x é um valor conservador de partida — ajuste
 * esta constante assim que souber sua alíquota real de imposto.
 */
const BREAK_EVEN_ROAS = 1.3;

/** Abaixo disso, ROAS/CPA por campanha ou criativo ainda é ruído estatístico, não sinal. */
const MIN_SAMPLE_PURCHASES = 30;

type OrderRow = {
  id: string;
  amount_cents: number;
  created_at: string;
  last_attribution_id: string | null;
  offer_id: string | null;
  payment_method: string | null;
  parent_order_id: string | null;
  parent_subscription_id: string | null;
  metadata: { tracking_internal?: boolean } | null;
};
type AttributionRow = { id: string; source: string | null; campaign: string | null; campaign_id: string | null; creative_id: string | null };
type SessionAttributionRow = { session_id: string | null; source: string | null; campaign: string | null; campaign_id: string | null };
type SpendRow = { spend_date: string; campaign_id: string; creative_id: string | null; spend_cents: number; clicks: number | null };
type OfferMeta = { id: string; name: string | null; slug: string | null };
type CreativeMeta = { id: string; name: string; angle: string | null; hook: string | null; format: string | null };

/** Dia (YYYY-MM-DD) de um instante, no fuso de Brasília — os gráficos seguem o dia do dono, não o UTC. */
function dayKey(instant: Date): string {
  return instant.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function campaignKey(input: { campaign_id?: string | null; campaign?: string | null }): string {
  if (input.campaign_id) return `id:${input.campaign_id}`;
  if (input.campaign) return `name:${input.campaign}`;
  return UNATTRIBUTED_KEY;
}

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function getDashboardMetrics(periodDays: number): Promise<DashboardMetrics> {
  const admin = createTrackingClient();
  const now = Date.now();
  const since = new Date(now - periodDays * 86_400_000).toISOString();
  const prevSince = new Date(now - 2 * periodDays * 86_400_000).toISOString();
  const startDate = since.slice(0, 10);
  const prevStartDate = prevSince.slice(0, 10);

  const [
    visitorsRes,
    sessionsRes,
    ordersRes,
    prevOrdersRes,
    sessionAttrsRes,
    spendRes,
    prevSpendRes,
    pendingRes,
    errorsRes,
    checkoutViewedRes,
    checkoutSubmittedRes,
    refundEventsRes,
    offersRes,
    creativesRes,
  ] = await Promise.all([
    admin.from("analytics_visitors").select("id", { count: "exact", head: true }).eq("is_internal", false).gte("first_seen_at", since),
    admin.from("analytics_sessions").select("id", { count: "exact", head: true }).eq("is_internal", false).gte("started_at", since),
    admin
      .from("orders")
      .select("id, amount_cents, created_at, last_attribution_id, offer_id, payment_method, parent_order_id, parent_subscription_id, metadata")
      .eq("status", "paid")
      .gte("created_at", since),
    admin.from("orders").select("id, amount_cents").eq("status", "paid").gte("created_at", prevSince).lt("created_at", since),
    // 1 atribuição do tipo "session" por sessão (índice único) — linhas = sessões atribuídas.
    admin.from("analytics_attributions").select("session_id, source, campaign, campaign_id").eq("attribution_type", "session").gte("captured_at", since),
    admin.from("ad_spend_daily").select("spend_date, campaign_id, creative_id, spend_cents, clicks").gte("spend_date", startDate),
    admin.from("ad_spend_daily").select("spend_cents").gte("spend_date", prevStartDate).lt("spend_date", startDate),
    admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("analytics_outbox").select("id", { count: "exact", head: true }).eq("status", "error"),
    admin.from("analytics_events").select("event_id", { count: "exact", head: true }).eq("event_name", "checkout_viewed").eq("is_internal", false).gte("occurred_at", since),
    admin.from("analytics_events").select("event_id", { count: "exact", head: true }).eq("event_name", "checkout_submitted").eq("is_internal", false).gte("occurred_at", since),
    admin.from("analytics_events").select("event_name, properties").in("event_name", ["refund_confirmed", "chargeback_confirmed"]).eq("is_internal", false).gte("occurred_at", since),
    admin.from("offers").select("id, name, slug"),
    admin.from("marketing_creatives").select("id, name, angle, hook, format"),
  ]);

  const paidOrders = (ordersRes.data ?? []) as OrderRow[];
  const externalOrders = paidOrders.filter((order) => !order.metadata?.tracking_internal);
  const spendRows = (spendRes.data ?? []) as SpendRow[];
  const offerMetaById = new Map(((offersRes.data ?? []) as OfferMeta[]).map((o) => [o.id, o]));
  const creativeMetaById = new Map(((creativesRes.data ?? []) as CreativeMeta[]).map((c) => [c.id, c]));

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

  // ── Atribuições dos pedidos pagos (pra campanha e pra criativo) ────────
  const attributionIds = [...new Set(externalOrders.map((o) => o.last_attribution_id).filter(Boolean))] as string[];
  const { data: attributionsData } = attributionIds.length
    ? await admin.from("analytics_attributions").select("id, source, campaign, campaign_id, creative_id").in("id", attributionIds)
    : { data: [] as AttributionRow[] };
  const attributionById = new Map(((attributionsData ?? []) as AttributionRow[]).map((row) => [row.id, row]));

  // ── Agregação por campanha ─────────────────────────────────────────────
  const buckets = new Map<string, CampaignRow>();
  function bucketFor(key: string, label: { campaign: string; source: string }): CampaignRow {
    const existing = buckets.get(key);
    if (existing) {
      if (existing.campaign.startsWith("id:") && label.campaign !== existing.campaign) existing.campaign = label.campaign;
      if (existing.source === "—" && label.source !== "—") existing.source = label.source;
      return existing;
    }
    const created: CampaignRow = { campaign: label.campaign, source: label.source, sessions: 0, purchases: 0, revenueCents: 0, spendCents: 0, lucroCents: 0, clicks: 0, lowSample: true };
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
    bucket.lowSample = bucket.purchases < MIN_SAMPLE_PURCHASES;
  }

  // ── Agregação por criativo (não por campanha — o que converte de verdade) ──
  const creativeBuckets = new Map<string, CreativeRow>();
  function creativeBucketFor(creativeId: string): CreativeRow {
    const existing = creativeBuckets.get(creativeId);
    if (existing) return existing;
    const meta = creativeMetaById.get(creativeId);
    const created: CreativeRow = {
      creativeId,
      name: meta?.name ?? "(sem nome)",
      angle: meta?.angle ?? null,
      hook: meta?.hook ?? null,
      format: meta?.format ?? null,
      purchases: 0,
      revenueCents: 0,
      spendCents: 0,
      roas: null,
      lowSample: true,
    };
    creativeBuckets.set(creativeId, created);
    return created;
  }
  for (const order of externalOrders) {
    const attr = order.last_attribution_id ? attributionById.get(order.last_attribution_id) : undefined;
    if (!attr?.creative_id) continue;
    const bucket = creativeBucketFor(attr.creative_id);
    bucket.purchases += 1;
    bucket.revenueCents += order.amount_cents;
  }
  for (const spend of spendRows) {
    if (!spend.creative_id) continue;
    const bucket = creativeBucketFor(spend.creative_id);
    bucket.spendCents += spend.spend_cents;
  }
  for (const bucket of creativeBuckets.values()) {
    bucket.roas = bucket.spendCents > 0 ? Math.round((bucket.revenueCents / bucket.spendCents) * 100) / 100 : null;
    bucket.lowSample = bucket.purchases < MIN_SAMPLE_PURCHASES;
  }

  // ── Agregação por oferta (Anual, Mensal, bumps, upsells, downsells...) ──
  const offerBuckets = new Map<string, OfferRow>();
  for (const order of externalOrders) {
    const isAddon = Boolean(order.parent_order_id || order.parent_subscription_id);
    const offerId = order.offer_id ?? "(sem oferta)";
    const existing = offerBuckets.get(offerId);
    const offerName = offerMetaById.get(offerId ?? "")?.name ?? offerId;
    if (existing) {
      existing.purchases += 1;
      existing.revenueCents += order.amount_cents;
    } else {
      offerBuckets.set(offerId, { offerId, offerName, isAddon, purchases: 1, revenueCents: order.amount_cents, ticketMedioCents: null });
    }
  }
  const offers = [...offerBuckets.values()]
    .map((row) => ({ ...row, ticketMedioCents: row.purchases > 0 ? Math.round(row.revenueCents / row.purchases) : null }))
    .sort((a, b) => b.revenueCents - a.revenueCents);

  // ── Forma de pagamento ──────────────────────────────────────────────────
  const paymentBuckets = new Map<string, PaymentMethodRow>();
  for (const order of externalOrders) {
    const method = order.payment_method ?? "(desconhecido)";
    const existing = paymentBuckets.get(method);
    if (existing) {
      existing.purchases += 1;
      existing.revenueCents += order.amount_cents;
    } else {
      paymentBuckets.set(method, { method, purchases: 1, revenueCents: order.amount_cents });
    }
  }
  const paymentMethods = [...paymentBuckets.values()].sort((a, b) => b.revenueCents - a.revenueCents);

  // ── Funil: sessão -> viu checkout -> enviou -> comprou ─────────────────
  const sessions = sessionsRes.count ?? 0;
  const checkoutViewed = checkoutViewedRes.count ?? 0;
  const checkoutSubmitted = checkoutSubmittedRes.count ?? 0;
  const purchases = externalOrders.length;
  const funnel: FunnelData = {
    sessions,
    checkoutViewed,
    checkoutSubmitted,
    purchases,
    sessionToViewedPct: pct(checkoutViewed, sessions),
    viewedToSubmittedPct: pct(checkoutSubmitted, checkoutViewed),
    submittedToPurchasePct: pct(purchases, checkoutSubmitted),
  };

  // ── Reembolsos e chargebacks no período ─────────────────────────────────
  // Nota: isso conta reembolsos CONFIRMADOS dentro do período, mesmo que a
  // venda original tenha sido feita antes — é "quanto voltou nesses N dias",
  // não uma reconciliação exata do gross-vs-net do mesmo pedido.
  type RefundEvent = { event_name: string; properties: { amount_cents?: number } | null };
  const refundEvents = (refundEventsRes.data ?? []) as RefundEvent[];
  let refundedCents = 0;
  let chargebackCents = 0;
  let refundCount = 0;
  let chargebackCount = 0;
  for (const ev of refundEvents) {
    const amount = ev.properties?.amount_cents ?? 0;
    if (ev.event_name === "refund_confirmed") { refundedCents += amount; refundCount += 1; }
    else { chargebackCents += amount; chargebackCount += 1; }
  }
  const revenueCents = externalOrders.reduce((sum, order) => sum + order.amount_cents, 0);
  const lossTotal = refundedCents + chargebackCents;
  const refunds: RefundData = {
    refundedCents,
    chargebackCents,
    refundCount,
    chargebackCount,
    lossRatePct: pct(lossTotal, revenueCents + lossTotal),
  };

  // ── Totais ─────────────────────────────────────────────────────────────
  const spendCents = spendRows.length ? spendRows.reduce((sum, row) => sum + row.spend_cents, 0) : null;
  const lucroCents = revenueCents - (spendCents ?? 0);
  const roas = spendCents ? Math.round((revenueCents / spendCents) * 100) / 100 : null;
  const cpaCents = spendCents !== null && purchases > 0 ? Math.round(spendCents / purchases) : null;
  const conversionRate = pct(purchases, sessions);

  const lastEvent = await admin
    .from("analytics_events")
    .select("received_at")
    .eq("is_internal", false)
    .order("received_at", { ascending: false })
    .limit(1);

  const health = {
    lastEventAt: (lastEvent.data?.[0] as { received_at: string } | undefined)?.received_at ?? null,
    outboxPending: pendingRes.count ?? 0,
    outboxErrors: errorsRes.count ?? 0,
  };

  // ── Alertas automáticos ──────────────────────────────────────────────────
  const alerts: DashboardAlert[] = [];
  if (health.outboxErrors > 0) {
    alerts.push({ level: "critical", message: `${health.outboxErrors} evento(s) financeiro(s) travado(s) na fila — pode estar faltando venda/reembolso no painel.` });
  }
  if (spendCents !== null && spendCents > 5000 && purchases === 0) {
    alerts.push({ level: "critical", message: `${(spendCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} gastos em anúncio no período, zero vendas confirmadas.` });
  }
  if (roas !== null && roas < BREAK_EVEN_ROAS) {
    alerts.push({ level: "warning", message: `ROAS geral (${roas.toFixed(2)}×) está abaixo do ponto de equilíbrio estimado (${BREAK_EVEN_ROAS}×).` });
  }
  if (cpaCents !== null && prevSpendCents !== null && prevPurchases > 0) {
    const prevCpa = prevSpendCents / prevPurchases;
    if (prevCpa > 0 && cpaCents > prevCpa * 1.5) {
      alerts.push({ level: "warning", message: `Custo por venda subiu ${Math.round((cpaCents / prevCpa - 1) * 100)}% vs período anterior.` });
    }
  }
  if (refunds.lossRatePct !== null && refunds.lossRatePct > 10) {
    alerts.push({ level: "warning", message: `Taxa de reembolso/chargeback em ${refunds.lossRatePct}% no período — vale investigar a oferta ou o público.` });
  }
  if (funnel.viewedToSubmittedPct !== null && funnel.checkoutViewed >= 20 && funnel.viewedToSubmittedPct < 20) {
    alerts.push({ level: "warning", message: `Só ${funnel.viewedToSubmittedPct}% de quem viu o checkout preencheu o formulário — pode ser preço, confiança ou fricção no formulário.` });
  }

  // ── Sugestões (regras simples, deterministas — nunca um "achismo" de IA) ──
  const suggestions: string[] = [];
  const goodCampaigns = [...buckets.values()].filter((c) => c.spendCents > 0 && !c.lowSample && c.revenueCents / c.spendCents >= BREAK_EVEN_ROAS);
  const badCampaigns = [...buckets.values()].filter((c) => c.spendCents > 0 && !c.lowSample && c.revenueCents / c.spendCents < BREAK_EVEN_ROAS * 0.7);
  if (goodCampaigns.length > 0) {
    const best = goodCampaigns.sort((a, b) => b.revenueCents / b.spendCents - a.revenueCents / a.spendCents)[0];
    suggestions.push(`"${best.campaign}" está com ROAS ${(best.revenueCents / best.spendCents).toFixed(2)}× e amostra suficiente — candidata a receber mais orçamento.`);
  }
  if (badCampaigns.length > 0) {
    const worst = badCampaigns.sort((a, b) => a.revenueCents / a.spendCents - b.revenueCents / b.spendCents)[0];
    suggestions.push(`"${worst.campaign}" está bem abaixo do ponto de equilíbrio com amostra suficiente pra confiar no número — considere pausar ou trocar o criativo.`);
  }
  const goodCreatives = [...creativeBuckets.values()].filter((c) => c.roas !== null && !c.lowSample && c.roas >= BREAK_EVEN_ROAS);
  if (goodCreatives.length > 0) {
    const best = goodCreatives.sort((a, b) => (b.roas ?? 0) - (a.roas ?? 0))[0];
    suggestions.push(`O criativo "${best.name}"${best.angle ? ` (ângulo: ${best.angle})` : ""} é o de melhor ROAS com amostra confiável — vale iterar variações desse mesmo ângulo antes de testar algo totalmente novo.`);
  }
  if (funnel.sessionToViewedPct !== null && funnel.sessions >= 50 && funnel.sessionToViewedPct < 15) {
    suggestions.push(`Só ${funnel.sessionToViewedPct}% das sessões chegam a ver o checkout — o problema pode estar na oferta/página antes do checkout, não no anúncio.`);
  }
  if (offers.length > 1) {
    const bestOffer = [...offers].sort((a, b) => b.revenueCents - a.revenueCents)[0];
    const addonRevenue = offers.filter((o) => o.isAddon).reduce((sum, o) => sum + o.revenueCents, 0);
    if (addonRevenue > 0) {
      suggestions.push(`Bumps/upsells/downsells já respondem por ${(addonRevenue / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} no período — "${bestOffer.offerName}" é a oferta principal com mais receita.`);
    }
  }

  return {
    periodDays,
    visitors: visitorsRes.count ?? 0,
    sessions,
    purchases,
    revenueCents,
    spendCents,
    lucroCents,
    roas,
    ticketMedioCents: purchases > 0 ? Math.round(revenueCents / purchases) : null,
    cpaCents,
    conversionRate,
    daily,
    campaigns: [...buckets.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.sessions - a.sessions),
    creatives: [...creativeBuckets.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    offers,
    paymentMethods,
    funnel,
    refunds,
    breakEvenRoas: BREAK_EVEN_ROAS,
    alerts,
    suggestions,
    prev: {
      revenueCents: prevRevenueCents,
      purchases: prevPurchases,
      spendCents: prevSpendCents,
      lucroCents: prevRevenueCents - (prevSpendCents ?? 0),
    },
    health,
  };
}
