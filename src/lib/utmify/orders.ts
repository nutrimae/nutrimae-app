import type { createAdminClient } from "@/lib/supabase/admin";

const UTMIFY_ORDERS_ENDPOINT = "https://api.utmify.com.br/api-credentials/orders";

type AdminClient = ReturnType<typeof createAdminClient>;
type UtmifyStatus = "paid" | "refused" | "refunded" | "chargedback";

interface OrderRow {
  id: string;
  payment_method: "pix" | "credit_card";
  amount_cents: number;
  created_at: string;
  utm: Record<string, unknown> | null;
  last_attribution_id: string | null;
  client_ip: string | null;
  customers: {
    name: string;
    email: string;
    document: string;
    phone_number: string | null;
  } | null;
  order_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_amount_cents: number;
    offers: { id: string; name: string; slug: string } | null;
  }>;
}

interface AttributionRow {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  raw: Record<string, unknown> | null;
}

function utcDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function trackingParameters(order: OrderRow, attribution: AttributionRow | null) {
  const raw = attribution?.raw ?? order.utm ?? {};
  return {
    src: textValue(raw.src),
    sck: textValue(raw.sck),
    utm_source: attribution?.source ?? textValue(raw.utm_source),
    utm_campaign: attribution?.campaign ?? textValue(raw.utm_campaign),
    utm_medium: attribution?.medium ?? textValue(raw.utm_medium),
    utm_content: attribution?.content ?? textValue(raw.utm_content),
    utm_term: attribution?.term ?? textValue(raw.utm_term),
  };
}

export async function reportOrderToUtmify(
  admin: AdminClient,
  orderId: string,
  status: UtmifyStatus,
  occurredAt: string | Date = new Date(),
): Promise<void> {
  const token = process.env.UTMIFY_API_TOKEN;
  if (!token) return;

  const { data, error } = await admin
    .from("orders")
    .select("id, payment_method, amount_cents, created_at, utm, last_attribution_id, client_ip, customers(name, email, document, phone_number), order_items(id, description, quantity, unit_amount_cents, offers(id, name, slug))")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) throw error ?? new Error("Pedido não encontrado para envio à UTMify.");
  const order = data as unknown as OrderRow;
  if (!order.customers || order.order_items.length === 0) {
    throw new Error("Pedido sem cliente ou itens para envio à UTMify.");
  }

  let attribution: AttributionRow | null = null;
  if (order.last_attribution_id) {
    const { data: attributionData } = await admin
      .from("analytics_attributions")
      .select("source, medium, campaign, content, term, raw")
      .eq("id", order.last_attribution_id)
      .maybeSingle();
    attribution = (attributionData as AttributionRow | null) ?? null;
  }

  const eventDate = utcDateTime(occurredAt);
  const payload = {
    orderId: order.id,
    platform: "NutriMae",
    paymentMethod: order.payment_method,
    status,
    createdAt: utcDateTime(order.created_at),
    approvedDate: status === "paid" ? eventDate : null,
    refundedAt: status === "refunded" || status === "chargedback" ? eventDate : null,
    customer: {
      name: order.customers.name,
      email: order.customers.email,
      phone: order.customers.phone_number,
      document: order.customers.document,
      country: "BR",
      ip: order.client_ip ?? undefined,
    },
    products: order.order_items.map((item) => ({
      id: item.offers?.id ?? item.id,
      name: item.offers?.name ?? item.description,
      planId: item.offers?.slug ?? null,
      planName: item.offers?.name ?? null,
      quantity: item.quantity,
      priceInCents: item.unit_amount_cents,
    })),
    trackingParameters: trackingParameters(order, attribution),
    commission: {
      totalPriceInCents: order.amount_cents,
      gatewayFeeInCents: 0,
      userCommissionInCents: order.amount_cents,
      currency: "BRL",
    },
    isTest: process.env.UTMIFY_IS_TEST === "true",
  };

  const response = await fetch(UTMIFY_ORDERS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": token,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`UTMify respondeu HTTP ${response.status}.`);
  }
}

export async function bestEffortReportOrderToUtmify(
  admin: AdminClient,
  orderId: string,
  status: UtmifyStatus,
  occurredAt?: string | Date,
): Promise<void> {
  try {
    await reportOrderToUtmify(admin, orderId, status, occurredAt);
  } catch (error) {
    console.error("[utmify] falha ao reportar pedido; processamento financeiro segue normalmente", {
      orderId,
      status,
      error: error instanceof Error ? error.message : "erro desconhecido",
    });
  }
}
