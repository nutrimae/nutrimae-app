import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantAccessForStripePayment } from "@/lib/webhooks/grant-access-stripe";
import { claimWebhookEvent, finalizeWebhookEvent } from "@/lib/webhooks/log-event";

/**
 * Rede de segurança pro caminho feliz de /api/stripe/verify-payment — cobre
 * o caso do navegador fechar/cair antes da confirmação, reembolso e
 * contestação. A Stripe assina o corpo cru (raw bytes), por isso lemos
 * request.text() em vez de request.json().
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe-webhook] assinatura inválida", err);
    return new NextResponse(null, { status: 400 });
  }

  const admin = createAdminClient();
  const claim = await claimWebhookEvent(admin, {
    provider: "stripe",
    providerEventId: event.id,
    eventType: event.type,
    payload: event,
  });
  if (!claim.claimed) return new NextResponse(null, { status: 200 });

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as { id: string };
      // Sempre reconfirma contra a API antes de liberar — nunca confia só
      // no corpo do webhook.
      const fresh = await stripe.paymentIntents.retrieve(paymentIntent.id);
      await grantAccessForStripePayment(admin, fresh);
    }
    await finalizeWebhookEvent(admin, claim.logId, { status: "processed" });
  } catch (err) {
    console.error("[stripe-webhook] falha ao processar evento", err);
    await finalizeWebhookEvent(admin, claim.logId, { status: "error", errorMessage: String(err) });
  }

  return new NextResponse(null, { status: 200 });
}
