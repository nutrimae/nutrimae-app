import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { findOrCreateLocalCustomer } from "@/lib/payments/find-or-create-customer";
import { isValidCpf } from "@/lib/utils";

/**
 * Único lugar que calcula preço. O corpo da requisição só carrega
 * offerSlug/bumpSlugs/dados do cliente/UTM/quiz — o preço final é sempre
 * relido de "offers" no banco, nunca aceito do cliente (spec: "nunca
 * confiar no preço enviado pelo navegador").
 *
 * Acesso NUNCA é liberado aqui — mesmo um cartão aprovado na hora só grava
 * o pedido como "pending"/"paid" localmente; quem libera "user_products" é
 * exclusivamente o webhook (src/app/api/webhooks/pagarme/route.ts).
 */

interface CheckoutBody {
  offerSlug?: unknown;
  bumpSlugs?: unknown;
  paymentMethod?: unknown;
  cardToken?: unknown;
  installments?: unknown;
  customer?: { name?: unknown; email?: unknown; document?: unknown; phone?: unknown };
  utm?: unknown;
  quizAnswers?: unknown;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const offerSlug = typeof body.offerSlug === "string" ? body.offerSlug : null;
  const paymentMethod = body.paymentMethod === "pix" || body.paymentMethod === "credit_card" ? body.paymentMethod : null;
  const bumpSlugs = Array.isArray(body.bumpSlugs) ? body.bumpSlugs.filter((s): s is string => typeof s === "string") : [];

  const customerName = typeof body.customer?.name === "string" ? body.customer.name.trim() : "";
  const customerEmail = typeof body.customer?.email === "string" ? body.customer.email.trim().toLowerCase() : "";
  const customerDocument = typeof body.customer?.document === "string" ? onlyDigits(body.customer.document) : "";
  const customerPhone = typeof body.customer?.phone === "string" ? onlyDigits(body.customer.phone) : undefined;

  if (!offerSlug || !paymentMethod || !customerName || !customerEmail || !isValidCpf(customerDocument)) {
    return NextResponse.json({ error: "missing_or_invalid_fields" }, { status: 400 });
  }

  if (paymentMethod === "credit_card" && typeof body.cardToken !== "string") {
    return NextResponse.json({ error: "missing_card_token" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: offer } = await admin
    .from("offers")
    .select("id, product_key, name, billing_type, price_cents, active")
    .eq("slug", offerSlug)
    .maybeSingle();

  if (!offer || !offer.active) {
    return NextResponse.json({ error: "offer_not_available" }, { status: 404 });
  }

  if (offer.billing_type !== "one_time") {
    // Assinatura (Mensal, NutriBot VIP) ainda não é vendida por esta rota
    // nesta entrega — o gate real é "active=false" na oferta, isto aqui é
    // uma segunda trava, redundante de propósito.
    return NextResponse.json({ error: "offer_requires_subscription_flow" }, { status: 422 });
  }

  let bumpOffers: Array<{ id: string; product_key: string; name: string; price_cents: number }> = [];
  if (bumpSlugs.length > 0) {
    const { data } = await admin
      .from("offers")
      .select("id, product_key, name, price_cents, billing_type, active")
      .in("slug", bumpSlugs);
    bumpOffers = (data ?? []).filter((b) => b.active && b.billing_type === "one_time");
  }

  const amountCents = offer.price_cents + bumpOffers.reduce((sum, b) => sum + b.price_cents, 0);

  try {
    const provider = getPaymentProvider();

    const { customerId, providerCustomerId } = await findOrCreateLocalCustomer(admin, provider, {
      name: customerName,
      email: customerEmail,
      document: customerDocument,
      phone: customerPhone,
    });

    const description = [offer.name, ...bumpOffers.map((b) => b.name)].join(" + ");

    const { data: orderRow, error: orderError } = await admin
      .from("orders")
      .insert({
        customer_id: customerId,
        offer_id: offer.id,
        status: "pending",
        payment_method: paymentMethod,
        amount_cents: amountCents,
        utm: body.utm ?? null,
        quiz_answers: body.quizAnswers ?? null,
      })
      .select("id")
      .single();

    if (orderError || !orderRow) throw orderError ?? new Error("Falha ao criar order local.");

    await admin.from("order_items").insert([
      { order_id: orderRow.id, offer_id: offer.id, description: offer.name, quantity: 1, unit_amount_cents: offer.price_cents, total_amount_cents: offer.price_cents },
      ...bumpOffers.map((b) => ({
        order_id: orderRow.id,
        offer_id: b.id,
        description: b.name,
        quantity: 1,
        unit_amount_cents: b.price_cents,
        total_amount_cents: b.price_cents,
      })),
    ]);

    if (paymentMethod === "pix") {
      const pix = await provider.createPixPayment({
        providerCustomerId,
        amountCents,
        description,
        metadata: { order_id: orderRow.id },
      });

      await admin.from("orders").update({ pagarme_order_id: pix.providerOrderId }).eq("id", orderRow.id);
      await admin.from("payments").insert({
        order_id: orderRow.id,
        pagarme_charge_id: pix.providerChargeId,
        method: "pix",
        status: "pending",
        amount_cents: amountCents,
        pix_qr_code: pix.qrCode,
        pix_qr_code_url: pix.qrCodeUrl,
        pix_expires_at: pix.expiresAt,
      });

      return NextResponse.json({
        orderId: orderRow.id,
        status: "pending",
        pix: { qrCode: pix.qrCode, qrCodeUrl: pix.qrCodeUrl, expiresAt: pix.expiresAt },
      });
    }

    const card = await provider.createCardPayment({
      providerCustomerId,
      amountCents,
      description,
      cardToken: body.cardToken as string,
      installments: typeof body.installments === "number" ? body.installments : 1,
      metadata: { order_id: orderRow.id },
    });

    await admin.from("orders").update({ pagarme_order_id: card.providerOrderId }).eq("id", orderRow.id);
    await admin.from("payments").insert({
      order_id: orderRow.id,
      pagarme_charge_id: card.providerChargeId,
      method: "credit_card",
      status: card.status === "paid" ? "paid" : card.status === "refused" ? "refused" : "pending",
      amount_cents: amountCents,
      card_brand: card.cardBrand,
      card_last4: card.cardLast4,
    });

    // Nota: mesmo que o Pagar.me responda "paid" síncrono aqui, "orders.status"
    // só é considerado fonte de verdade quando o webhook confirmar — a
    // página de obrigado revalida no servidor antes de mostrar sucesso.
    return NextResponse.json({ orderId: orderRow.id, status: card.status });
  } catch (err) {
    console.error("[checkout] falha ao processar pedido", err);
    return NextResponse.json({ error: "payment_processing_failed" }, { status: 502 });
  }
}
