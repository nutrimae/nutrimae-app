import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { findOrCreateLocalCustomer } from "@/lib/payments/find-or-create-customer";
import { resolveParentCustomer } from "@/lib/payments/resolve-parent-customer";
import { isValidCpf } from "@/lib/utils";
import type { PaymentProvider, BillingAddress } from "@/lib/payments/provider";

type AdminClient = ReturnType<typeof createAdminClient>;

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
 * Dois pontos de entrada: assinatura nova (envia `customer` completo, ex.:
 * checkout do Plano Mensal) ou upsell de uma assinatura já paga (envia
 * `parentSubscriptionId`, ex.: NutriBot VIP oferecido a quem acabou de
 * assinar o Mensal — reaproveita o cliente já cadastrado, sem redigitar
 * nome/e-mail/CPF). Mutuamente exclusivos.
 *
 * `bumpSlugs` (opcional, só na assinatura nova): order bumps de pagamento
 * único (Batch Cooking etc.) selecionados junto com o Mensal. Nunca entram
 * como item da assinatura — isso os cobraria todo mês — são cobrados à
 * parte, no mesmo cartão, como uma order avulsa vinculada à assinatura via
 * `parent_subscription_id`. Se essa cobrança falhar, a assinatura não é
 * desfeita: ela é o produto principal, o bump é só um extra.
 *
 * Confirmação de acesso nunca vem daqui: só do webhook, no evento de
 * fatura paga (ver src/app/api/webhooks/pagarme/route.ts).
 */

interface SubscriptionBody {
  offerSlug?: unknown;
  cardToken?: unknown;
  billingAddress?: { line1?: unknown; zipCode?: unknown; city?: unknown; state?: unknown };
  customer?: { name?: unknown; email?: unknown; document?: unknown; phone?: unknown };
  parentSubscriptionId?: unknown;
  bumpSlugs?: unknown;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Ver BillingAddress em src/lib/payments/provider.ts — exigido pela Pagar.me pra qualquer cobrança com card_token. */
function parseBillingAddress(body: SubscriptionBody): { line1: string; zipCode: string; city: string; state: string; country: string } | null {
  const line1 = typeof body.billingAddress?.line1 === "string" ? body.billingAddress.line1.trim() : "";
  const zipCode = typeof body.billingAddress?.zipCode === "string" ? onlyDigits(body.billingAddress.zipCode) : "";
  const city = typeof body.billingAddress?.city === "string" ? body.billingAddress.city.trim() : "";
  const state = typeof body.billingAddress?.state === "string" ? body.billingAddress.state.trim() : "";
  if (!line1 || zipCode.length !== 8 || !city || !state) return null;
  return { line1, zipCode, city, state, country: "BR" };
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
  const parentSubscriptionId = typeof body.parentSubscriptionId === "string" ? body.parentSubscriptionId : null;
  const bumpSlugs = Array.isArray(body.bumpSlugs) ? body.bumpSlugs.filter((s): s is string => typeof s === "string") : [];
  const customerName = typeof body.customer?.name === "string" ? body.customer.name.trim() : "";
  const customerEmail = typeof body.customer?.email === "string" ? body.customer.email.trim().toLowerCase() : "";
  const customerDocument = typeof body.customer?.document === "string" ? onlyDigits(body.customer.document) : "";
  const customerPhone = typeof body.customer?.phone === "string" ? onlyDigits(body.customer.phone) : undefined;

  const billingAddress = parseBillingAddress(body);

  if (!offerSlug || !cardToken || !billingAddress) {
    return NextResponse.json({ error: "missing_or_invalid_fields" }, { status: 400 });
  }

  if (!parentSubscriptionId && (!customerName || !customerEmail || !isValidCpf(customerDocument))) {
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

    const resolved = parentSubscriptionId
      ? await resolveParentCustomer(admin, { parentSubscriptionId })
      : await findOrCreateLocalCustomer(admin, provider, {
          name: customerName,
          email: customerEmail,
          document: customerDocument,
          phone: customerPhone,
        });

    if (!resolved) {
      return NextResponse.json({ error: "parent_subscription_not_active" }, { status: 403 });
    }

    const { customerId, providerCustomerId } = resolved;

    const subscription = await provider.createSubscription({
      providerCustomerId,
      amountCents: offer.recurring_price_cents,
      firstCycleAmountCents: offer.price_cents < offer.recurring_price_cents ? offer.price_cents : undefined,
      description: offer.name,
      cardToken,
      billingAddress,
      metadata: { offer_id: offer.id },
    });

    const { data: subscriptionRow, error: insertError } = await admin
      .from("subscriptions")
      .insert({
        customer_id: customerId,
        offer_id: offer.id,
        parent_subscription_id: parentSubscriptionId,
        pagarme_subscription_id: subscription.providerSubscriptionId,
        status: subscription.status,
        next_billing_at: subscription.nextBillingAt,
      })
      .select("id")
      .single();

    if (insertError || !subscriptionRow) throw insertError ?? new Error("Falha ao criar subscription local.");

    if (!parentSubscriptionId && bumpSlugs.length > 0) {
      await chargeBumps(admin, provider, {
        bumpSlugs,
        customerId,
        providerCustomerId,
        parentSubscriptionId: subscriptionRow.id,
        cardToken,
        billingAddress,
      });
    }

    return NextResponse.json({ subscriptionId: subscriptionRow.id, status: subscription.status });
  } catch (err) {
    console.error("[checkout/subscription] falha ao criar assinatura", err);
    return NextResponse.json({ error: "subscription_processing_failed" }, { status: 502 });
  }
}

/**
 * Cobra os order bumps (pagamento único) escolhidos junto com o Mensal —
 * mesmo cartão, order avulsa vinculada via parent_subscription_id. Best
 * effort de propósito: se falhar, só loga — a assinatura já foi criada com
 * sucesso e não pode ser desfeita por causa de um extra opcional.
 */
async function chargeBumps(
  admin: AdminClient,
  provider: PaymentProvider,
  input: {
    bumpSlugs: string[];
    customerId: string;
    providerCustomerId: string;
    parentSubscriptionId: string;
    cardToken: string;
    billingAddress: BillingAddress;
  },
): Promise<void> {
  try {
    const { data: bumpOffers } = await admin
      .from("offers")
      .select("id, name, price_cents, billing_type, active")
      .in("slug", input.bumpSlugs);

    const validBumps = (bumpOffers ?? []).filter((b) => b.active && b.billing_type === "one_time");
    if (validBumps.length === 0) return;

    const amountCents = validBumps.reduce((sum, b) => sum + b.price_cents, 0);
    const description = validBumps.map((b) => b.name).join(" + ");

    const { data: orderRow, error: orderError } = await admin
      .from("orders")
      .insert({
        customer_id: input.customerId,
        offer_id: validBumps[0].id,
        parent_subscription_id: input.parentSubscriptionId,
        status: "pending",
        payment_method: "credit_card",
        amount_cents: amountCents,
      })
      .select("id")
      .single();

    if (orderError || !orderRow) throw orderError ?? new Error("Falha ao criar order dos bumps.");

    await admin.from("order_items").insert(
      validBumps.map((b) => ({
        order_id: orderRow.id,
        offer_id: b.id,
        description: b.name,
        quantity: 1,
        unit_amount_cents: b.price_cents,
        total_amount_cents: b.price_cents,
      })),
    );

    const card = await provider.createCardPayment({
      providerCustomerId: input.providerCustomerId,
      amountCents,
      description,
      cardToken: input.cardToken,
      billingAddress: input.billingAddress,
      metadata: { order_id: orderRow.id, parent_subscription_id: input.parentSubscriptionId },
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
  } catch (err) {
    console.error("[checkout/subscription] falha ao cobrar order bumps (assinatura ja criada, nao desfeita)", err);
  }
}
