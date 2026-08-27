import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { resolveParentCustomer } from "@/lib/payments/resolve-parent-customer";
import { generateStatusToken } from "@/lib/checkout/status-token";
import { isCheckoutRateLimited } from "@/lib/checkout/rate-limit";


/**
 * Cobrança do downsell (NutriBot — 30 Dias, pagamento único, oferta
 * "nutribot-30d"). Reaproveita os dados de cliente já coletados no pedido
 * pai (nome/e-mail/CPF/telefone) — a pessoa só escolhe forma de pagamento
 * de novo, sem redigitar tudo. O pedido pai pode ser um order (fluxo
 * Anual → recusou o upsell Batch Cooking) OU uma subscription (fluxo
 * Mensal → recusou o upsell NutriBot VIP) — ver resolveParentCustomer.
 * Preço sempre relido de "offers", nunca do cliente. Assim como no
 * checkout principal, acesso só é liberado pelo webhook — a resposta
 * síncrona daqui nunca libera nada.
 */

interface DownsellBody {
  parentOrderId?: unknown;
  parentSubscriptionId?: unknown;
  paymentMethod?: unknown;
  cardToken?: unknown;
  billingAddress?: { line1?: unknown; zipCode?: unknown; city?: unknown; state?: unknown };
}

/** Ver BillingAddress em src/lib/payments/provider.ts — exigido pela Pagar.me pra qualquer cobrança com card_token. */
function parseBillingAddress(body: DownsellBody): { line1: string; zipCode: string; city: string; state: string; country: string } | null {
  const line1 = typeof body.billingAddress?.line1 === "string" ? body.billingAddress.line1.trim() : "";
  const zipCode = typeof body.billingAddress?.zipCode === "string" ? body.billingAddress.zipCode.replace(/\D/g, "") : "";
  const city = typeof body.billingAddress?.city === "string" ? body.billingAddress.city.trim() : "";
  const state = typeof body.billingAddress?.state === "string" ? body.billingAddress.state.trim() : "";
  if (!line1 || zipCode.length !== 8 || !city || !state) return null;
  return { line1, zipCode, city, state, country: "BR" };
}

export async function POST(request: Request) {
  if (await isCheckoutRateLimited(request)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: DownsellBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parentOrderId = typeof body.parentOrderId === "string" ? body.parentOrderId : null;
  const parentSubscriptionId = typeof body.parentSubscriptionId === "string" ? body.parentSubscriptionId : null;
  const paymentMethod = body.paymentMethod === "pix" || body.paymentMethod === "credit_card" ? body.paymentMethod : null;

  if ((!parentOrderId && !parentSubscriptionId) || !paymentMethod) {
    return NextResponse.json({ error: "missing_or_invalid_fields" }, { status: 400 });
  }

  const billingAddress = paymentMethod === "credit_card" ? parseBillingAddress(body) : null;

  if (paymentMethod === "credit_card" && (typeof body.cardToken !== "string" || !billingAddress)) {
    return NextResponse.json({ error: "missing_card_token" }, { status: 400 });
  }

  const admin = createAdminClient();

  const customer = await resolveParentCustomer(admin, { parentOrderId, parentSubscriptionId });

  if (!customer) {
    return NextResponse.json({ error: "parent_not_confirmed" }, { status: 403 });
  }

  const { data: offer } = await admin
    .from("offers")
    .select("id, product_key, name, billing_type, price_cents, active")
    .eq("slug", "nutribot-30d")
    .maybeSingle();

  if (!offer || !offer.active || offer.billing_type !== "one_time") {
    return NextResponse.json({ error: "offer_not_available" }, { status: 404 });
  }

  try {
    const provider = getPaymentProvider();

    const { data: orderRow, error: orderError } = await admin
      .from("orders")
      .insert({
        customer_id: customer.customerId,
        offer_id: offer.id,
        parent_order_id: parentOrderId,
        parent_subscription_id: parentSubscriptionId,
        status: "pending",
        payment_method: paymentMethod,
        amount_cents: offer.price_cents,
      })
      .select("id")
      .single();

    if (orderError || !orderRow) throw orderError ?? new Error("Falha ao criar order local.");

    await admin.from("order_items").insert({
      order_id: orderRow.id,
      offer_id: offer.id,
      description: offer.name,
      quantity: 1,
      unit_amount_cents: offer.price_cents,
      total_amount_cents: offer.price_cents,
    });

    if (paymentMethod === "pix") {
      const pix = await provider.createPixPayment({
        providerCustomerId: customer.providerCustomerId,
        amountCents: offer.price_cents,
        description: offer.name,
        metadata: { order_id: orderRow.id, ...(parentOrderId ? { parent_order_id: parentOrderId } : {}), ...(parentSubscriptionId ? { parent_subscription_id: parentSubscriptionId } : {}) },
      });

      await admin.from("orders").update({ pagarme_order_id: pix.providerOrderId }).eq("id", orderRow.id);
      await admin.from("payments").insert({
        order_id: orderRow.id,
        pagarme_charge_id: pix.providerChargeId,
        method: "pix",
        status: "pending",
        amount_cents: offer.price_cents,
        pix_qr_code: pix.qrCode,
        pix_qr_code_url: pix.qrCodeUrl,
        pix_expires_at: pix.expiresAt,
      });

      return NextResponse.json({
        orderId: orderRow.id,
        status: "pending",
        statusToken: generateStatusToken(orderRow.id),
        pix: { qrCode: pix.qrCode, qrCodeUrl: pix.qrCodeUrl, expiresAt: pix.expiresAt },
      });
    }

    const card = await provider.createCardPayment({
      providerCustomerId: customer.providerCustomerId,
      amountCents: offer.price_cents,
      description: offer.name,
      cardToken: body.cardToken as string,
      billingAddress: billingAddress as NonNullable<typeof billingAddress>,
      metadata: { order_id: orderRow.id, ...(parentOrderId ? { parent_order_id: parentOrderId } : {}), ...(parentSubscriptionId ? { parent_subscription_id: parentSubscriptionId } : {}) },
    });

    await admin.from("orders").update({ pagarme_order_id: card.providerOrderId }).eq("id", orderRow.id);
    await admin.from("payments").insert({
      order_id: orderRow.id,
      pagarme_charge_id: card.providerChargeId,
      method: "credit_card",
      status: card.status === "paid" ? "paid" : card.status === "refused" ? "refused" : "pending",
      amount_cents: offer.price_cents,
      card_brand: card.cardBrand,
      card_last4: card.cardLast4,
    });

    return NextResponse.json({ orderId: orderRow.id, status: card.status, statusToken: generateStatusToken(orderRow.id) });
  } catch (err) {
    console.error("[checkout/downsell] falha ao processar pedido", err);
    return NextResponse.json({ error: "payment_processing_failed" }, { status: 502 });
  }
}
