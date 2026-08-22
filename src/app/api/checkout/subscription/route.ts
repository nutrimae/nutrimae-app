import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { findOrCreateLocalCustomer } from "@/lib/payments/find-or-create-customer";
import { isValidCpf } from "@/lib/utils";

/**
 * Assinatura recorrente de verdade (Plano Mensal, NutriBot VIP) via
 * /subscriptions do Pagar.me — nunca uma cobrança única fingindo ser
 * assinatura. Só cartão (Pix não tem garantia de recorrência automática,
 * por isso nunca aceito aqui).
 *
 * Preço sempre relido de "offers": `recurring_price_cents` é o valor
 * cobrado a partir do 2º ciclo, `price_cents` é o valor do 1º ciclo (pode
 * ser promocional, ex.: Mensal R$19,90 → R$29,90). Quando os dois são
 * iguais (ex.: NutriBot VIP), não há desconto de 1º ciclo.
 *
 * Esta rota só responde de verdade quando a oferta está com active=true —
 * hoje (Mensal e NutriBot VIP) isso está desligado por feature flag até
 * passar por sandbox e produção controlada (ver supabase/schema.sql seção
 * 12). Confirmação de acesso nunca vem daqui: só do webhook, no evento de
 * fatura paga (ver src/app/api/webhooks/pagarme/route.ts).
 */

interface SubscriptionBody {
  offerSlug?: unknown;
  cardToken?: unknown;
  customer?: { name?: unknown; email?: unknown; document?: unknown; phone?: unknown };
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  let body: SubscriptionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const offerSlug = typeof body.offerSlug === "string" ? body.offerSlug : null;
  const cardToken = typeof body.cardToken === "string" ? body.cardToken : null;
  const customerName = typeof body.customer?.name === "string" ? body.customer.name.trim() : "";
  const customerEmail = typeof body.customer?.email === "string" ? body.customer.email.trim().toLowerCase() : "";
  const customerDocument = typeof body.customer?.document === "string" ? onlyDigits(body.customer.document) : "";
  const customerPhone = typeof body.customer?.phone === "string" ? onlyDigits(body.customer.phone) : undefined;

  if (!offerSlug || !cardToken || !customerName || !customerEmail || !isValidCpf(customerDocument)) {
    return NextResponse.json({ error: "missing_or_invalid_fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: offer } = await admin
    .from("offers")
    .select("id, name, billing_type, price_cents, recurring_price_cents, active")
    .eq("slug", offerSlug)
    .maybeSingle();

  if (!offer || !offer.active) {
    return NextResponse.json({ error: "offer_not_available" }, { status: 404 });
  }

  if (offer.billing_type !== "recurring" || offer.recurring_price_cents == null) {
    return NextResponse.json({ error: "offer_is_not_recurring" }, { status: 422 });
  }

  try {
    const provider = getPaymentProvider();

    const { customerId, providerCustomerId } = await findOrCreateLocalCustomer(admin, provider, {
      name: customerName,
      email: customerEmail,
      document: customerDocument,
      phone: customerPhone,
    });

    const subscription = await provider.createSubscription({
      providerCustomerId,
      amountCents: offer.recurring_price_cents,
      firstCycleAmountCents: offer.price_cents < offer.recurring_price_cents ? offer.price_cents : undefined,
      description: offer.name,
      cardToken,
      metadata: { offer_id: offer.id },
    });

    const { data: subscriptionRow, error: insertError } = await admin
      .from("subscriptions")
      .insert({
        customer_id: customerId,
        offer_id: offer.id,
        pagarme_subscription_id: subscription.providerSubscriptionId,
        status: subscription.status,
        next_billing_at: subscription.nextBillingAt,
      })
      .select("id")
      .single();

    if (insertError || !subscriptionRow) throw insertError ?? new Error("Falha ao criar subscription local.");

    return NextResponse.json({ subscriptionId: subscriptionRow.id, status: subscription.status });
  } catch (err) {
    console.error("[checkout/subscription] falha ao criar assinatura", err);
    return NextResponse.json({ error: "subscription_processing_failed" }, { status: 502 });
  }
}
