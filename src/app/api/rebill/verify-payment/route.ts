import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantAccessForRebillPayment } from "@/lib/webhooks/grant-access-rebill";

/**
 * O client NUNCA libera acesso sozinho a partir do evento "success" do
 * <rebill-checkout> — o SDK dispara "success" assim que o processador
 * autoriza, mas isso não garante que o dinheiro efetivamente mudou de mãos
 * (ver docs.rebill.com/sdk/checkout#what-arrives-on-success). Esta rota
 * confere o status de verdade direto na API da Rebill, com a secret key,
 * antes de liberar qualquer coisa em "user_products".
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { paymentId?: string } | null;
  const paymentId = body?.paymentId;
  if (!paymentId || !paymentId.startsWith("pay_") && !paymentId.startsWith("test_pay_")) {
    return NextResponse.json({ error: "invalid_payment_id" }, { status: 400 });
  }

  const res = await fetch(`https://api.rebill.com/v3/payments/${paymentId}`, {
    headers: { "x-api-key": process.env.REBILL_SECRET_KEY! },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "payment_not_found" }, { status: 404 });
  }

  const payment = await res.json();

  if (payment.status !== "approved") {
    return NextResponse.json({ error: "payment_not_approved", status: payment.status }, { status: 409 });
  }

  const admin = createAdminClient();
  await grantAccessForRebillPayment(admin, payment);

  return NextResponse.json({ ok: true });
}
