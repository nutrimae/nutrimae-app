import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cálculo das métricas de negócio do painel /admin/metricas (Prompt I).
 *
 * REGRA MAIS IMPORTANTE: isto SÓ deve ser chamado pelo job de refresh
 * (src/app/api/admin/metrics/refresh/route.ts), nunca direto por uma
 * página. O painel — e qualquer futuro assistente (Prompt F) — lê o
 * resultado já calculado em "admin_metrics_cache", nunca chama isto.
 * Dois lugares recalculando a mesma métrica é como se tem número
 * divergente entre painel e assistente.
 *
 * Pagar.me não oferece um jeito de listar/agregar pedidos pela API — tudo
 * aqui vem das tabelas espelho no Supabase (orders/order_items/payments/
 * subscriptions), que o webhook mantém atualizadas.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any>;

export interface AdminMetrics {
  computedAt: string;
  mrrCents: number;
  oneTimeRevenueCents: { today: number; last7d: number; last30d: number };
  activeSubscribers: number;
  newSubscribers: { today: number; last7d: number; last30d: number };
  cancellations: { today: number; last7d: number; last30d: number };
  bumpAdoptionRatePercent: number | null;
  oto1AdoptionRatePercent: number | null;
  oto2AdoptionRatePercent: number | null;
  mensalMixPercent: number | null;
  anualMixPercent: number | null;
  retentionD30Percent: number | null;
  refunds: { count: number; amountCents: number };
  chargebacks: { count: number; amountCents: number };
  /** (reembolsos + chargebacks) / pedidos pagos, últimos 30 dias. */
  refundRatePercent: number | null;
  pendingPayments: { count: number; amountCents: number };
}

function startOfDayIso(daysAgo: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 10000) / 100;
}

export async function computeAdminMetrics(admin: AdminClient): Promise<AdminMetrics> {
  const todayStart = startOfDayIso(0);
  const sevenDaysStart = startOfDayIso(7);
  const thirtyDaysStart = startOfDayIso(30);

  // ── Assinantes ativos + mix mensal/anual ──
  const { data: activeSubs } = await admin
    .from("user_products")
    .select("user_id")
    .eq("product_id", "nutrimae_assinatura")
    .eq("status", "active");

  const activeUserIds = (activeSubs ?? []).map((r: { user_id: string }) => r.user_id);
  const activeSubscribers = activeUserIds.length;

  let mensalCount = 0;
  let anualCount = 0;
  if (activeUserIds.length > 0) {
    const { data: subOrders } = await admin
      .from("orders")
      .select("user_id, created_at, offers(slug, product_key)")
      .in("user_id", activeUserIds)
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    const seenUser = new Set<string>();
    for (const order of subOrders ?? []) {
      const offer = order.offers as unknown as { slug?: string; product_key?: string } | null;
      if (offer?.product_key !== "nutrimae_assinatura") continue;
      if (seenUser.has(order.user_id)) continue; // já pegou a compra mais recente desse user
      seenUser.add(order.user_id);
      if (offer.slug === "nutrimae-mensal") mensalCount += 1;
      else if (offer.slug === "nutrimae-anual") anualCount += 1;
    }
  }
  const mixTotal = mensalCount + anualCount;

  // ── MRR (só billing_type = recurring — hoje é 0 de verdade, Mensal
  // ainda não está ativo; não confundir com receita de pagamento único) ──
  const { data: recurringOffers } = await admin
    .from("offers")
    .select("id, recurring_price_cents")
    .eq("billing_type", "recurring");
  let mrrCents = 0;
  if (recurringOffers?.length) {
    const { data: activeSubscriptions } = await admin
      .from("subscriptions")
      .select("offer_id")
      .eq("status", "active")
      .in("offer_id", recurringOffers.map((o: { id: string }) => o.id));
    const priceByOffer = new Map(recurringOffers.map((o: { id: string; recurring_price_cents: number | null }) => [o.id, o.recurring_price_cents ?? 0]));
    for (const sub of activeSubscriptions ?? []) {
      mrrCents += priceByOffer.get(sub.offer_id) ?? 0;
    }
  }

  // ── Receita de pagamento único (Anual + expansões), por janela ──
  async function oneTimeRevenueSince(sinceIso: string) {
    const { data } = await admin
      .from("orders")
      .select("amount_cents")
      .eq("status", "paid")
      .gte("created_at", sinceIso);
    return (data ?? []).reduce((sum: number, o: { amount_cents: number }) => sum + o.amount_cents, 0);
  }
  const oneTimeRevenueCents = {
    today: await oneTimeRevenueSince(todayStart),
    last7d: await oneTimeRevenueSince(sevenDaysStart),
    last30d: await oneTimeRevenueSince(thirtyDaysStart),
  };

  // ── Novos assinantes por janela (pedidos pagos da assinatura principal) ──
  async function newSubscribersSince(sinceIso: string) {
    const { data } = await admin
      .from("orders")
      .select("id, offers!inner(product_key)")
      .eq("status", "paid")
      .eq("offers.product_key", "nutrimae_assinatura")
      .gte("created_at", sinceIso);
    return (data ?? []).length;
  }
  const newSubscribers = {
    today: await newSubscribersSince(todayStart),
    last7d: await newSubscribersSince(sevenDaysStart),
    last30d: await newSubscribersSince(thirtyDaysStart),
  };

  // ── Cancelamentos por janela ──
  async function cancellationsSince(sinceIso: string) {
    const { data } = await admin
      .from("user_products")
      .select("user_id")
      .eq("product_id", "nutrimae_assinatura")
      .in("status", ["cancelled", "refunded"])
      .gte("canceled_at", sinceIso);
    return (data ?? []).length;
  }
  const cancellations = {
    today: await cancellationsSince(todayStart),
    last7d: await cancellationsSince(sevenDaysStart),
    last30d: await cancellationsSince(thirtyDaysStart),
  };

  // ── Adesão do order bump: % dos pedidos pagos do Anual que têm pelo
  // menos um order_item de oferta diferente da principal. Só conta pedido
  // "principal" (parent_order_id nulo) — um OTO1/OTO2/downsell é um pedido
  // FILHO, não teria order_items de bump nenhum e diluiria a taxa se
  // entrasse no denominador (foi exatamente esse bug que o teste real
  // pegou: taxa saindo 33% em vez de 100% com dado sintético). ──
  const { data: mainPaidOrders } = await admin
    .from("orders")
    .select("id, offer_id")
    .eq("status", "paid")
    .is("parent_order_id", null)
    .gte("created_at", thirtyDaysStart);

  let bumpAdoptionRatePercent: number | null = null;
  if (mainPaidOrders?.length) {
    const orderIds = mainPaidOrders.map((o: { id: string }) => o.id);
    const { data: items } = await admin.from("order_items").select("order_id, offer_id").in("order_id", orderIds);
    const offerByOrder = new Map(mainPaidOrders.map((o: { id: string; offer_id: string }) => [o.id, o.offer_id]));
    const ordersWithBump = new Set<string>();
    for (const item of items ?? []) {
      if (item.offer_id !== offerByOrder.get(item.order_id)) ordersWithBump.add(item.order_id);
    }
    bumpAdoptionRatePercent = pct(ordersWithBump.size, mainPaidOrders.length);
  }

  // ── OTO1 (batch-cooking) / OTO2 (nutribot-30d): % dos pedidos-pai pagos
  // que geraram um pedido-filho pago daquela oferta ──
  async function otoAdoptionRate(offerSlug: string): Promise<number | null> {
    if (!mainPaidOrders?.length) return null;
    const { data: offerRow } = await admin.from("offers").select("id").eq("slug", offerSlug).maybeSingle();
    if (!offerRow) return null;
    const parentIds = mainPaidOrders.map((o: { id: string }) => o.id);
    const { data: childOrders } = await admin
      .from("orders")
      .select("parent_order_id")
      .eq("status", "paid")
      .eq("offer_id", offerRow.id)
      .in("parent_order_id", parentIds);
    return pct(new Set((childOrders ?? []).map((o: { parent_order_id: string }) => o.parent_order_id)).size, mainPaidOrders.length);
  }
  const oto1AdoptionRatePercent = await otoAdoptionRate("batch-cooking");
  const oto2AdoptionRatePercent = await otoAdoptionRate("nutribot-30d");

  // ── Retenção D30: de quem começou a assinatura entre 33 e 30 dias
  // atrás, quantos % ainda estão ativos hoje ──
  const { data: cohortOrders } = await admin
    .from("orders")
    .select("user_id, offers!inner(product_key)")
    .eq("status", "paid")
    .eq("offers.product_key", "nutrimae_assinatura")
    .gte("created_at", startOfDayIso(33))
    .lt("created_at", startOfDayIso(30));
  let retentionD30Percent: number | null = null;
  const cohortUserIds = [...new Set((cohortOrders ?? []).map((o: { user_id: string | null }) => o.user_id).filter(Boolean))] as string[];
  if (cohortUserIds.length > 0) {
    const { data: stillActive } = await admin
      .from("user_products")
      .select("user_id")
      .eq("product_id", "nutrimae_assinatura")
      .eq("status", "active")
      .in("user_id", cohortUserIds);
    retentionD30Percent = pct((stillActive ?? []).length, cohortUserIds.length);
  }

  // ── Reembolsos vs chargebacks (distinguidos pelo raw_last_event.type
  // salvo pelo webhook — Pagar.me não separa os dois em orders.status) ──
  async function refundStatsSince(sinceIso: string) {
    const { data } = await admin
      .from("payments")
      .select("amount_cents, raw_last_event, updated_at, orders!inner(status)")
      .eq("orders.status", "refunded")
      .gte("updated_at", sinceIso);
    let refundsCount = 0, refundsAmount = 0, chargebacksCount = 0, chargebacksAmount = 0;
    for (const p of data ?? []) {
      const eventType = (p.raw_last_event as { type?: string } | null)?.type ?? "";
      if (eventType === "charge.chargedback") {
        chargebacksCount += 1;
        chargebacksAmount += p.amount_cents;
      } else {
        refundsCount += 1;
        refundsAmount += p.amount_cents;
      }
    }
    return { refundsCount, refundsAmount, chargebacksCount, chargebacksAmount };
  }
  const refundStats = await refundStatsSince(thirtyDaysStart);

  const { count: paidLast30dCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "paid")
    .gte("created_at", thirtyDaysStart);
  const refundRatePercent = pct(refundStats.refundsCount + refundStats.chargebacksCount, paidLast30dCount ?? 0);

  // ── Pagamentos pendentes agora ──
  const { data: pending } = await admin.from("orders").select("amount_cents").eq("status", "pending");
  const pendingPayments = {
    count: (pending ?? []).length,
    amountCents: (pending ?? []).reduce((sum: number, o: { amount_cents: number }) => sum + o.amount_cents, 0),
  };

  return {
    computedAt: new Date().toISOString(),
    mrrCents,
    oneTimeRevenueCents,
    activeSubscribers,
    newSubscribers,
    cancellations,
    bumpAdoptionRatePercent,
    oto1AdoptionRatePercent,
    oto2AdoptionRatePercent,
    mensalMixPercent: pct(mensalCount, mixTotal),
    anualMixPercent: pct(anualCount, mixTotal),
    retentionD30Percent,
    refunds: { count: refundStats.refundsCount, amountCents: refundStats.refundsAmount },
    chargebacks: { count: refundStats.chargebacksCount, amountCents: refundStats.chargebacksAmount },
    refundRatePercent,
    pendingPayments,
  };
}
