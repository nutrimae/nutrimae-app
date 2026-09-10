import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantAccessForStripePayment } from "@/lib/webhooks/grant-access-stripe";

/**
 * Confirma contra a API antes de liberar acesso — nunca confia só no
 * retorno do confirmCardPayment no navegador (mesma regra do Rebill).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { paymentIntentId?: string } | null;
  const paymentIntentId = body?.paymentIntentId;

  if (!paymentIntentId?.startsWith("pi_")) {
    return NextResponse.json({ error: "invalid_payment_intent_id" }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json({ error: "payment_not_succeeded", status: paymentIntent.status }, { status: 409 });
  }

  const admin = createAdminClient();
  await grantAccessForStripePayment(admin, paymentIntent);

  return NextResponse.json({ ok: true });
}
