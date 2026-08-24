import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";

/**
 * Cancelamento de assinatura recorrente (Mensal, NutriBot VIP), disparado
 * pela própria usuária no perfil. Só chama a Pagar.me — nunca escreve
 * "cancelled" direto em user_products/subscriptions aqui. A revogação de
 * acesso é sempre responsabilidade do webhook (subscription.canceled),
 * mesma regra de "acesso só muda via webhook" usada em todo o resto do
 * checkout (ver src/app/api/webhooks/pagarme/route.ts).
 */

interface CancelBody {
  subscriptionId?: unknown;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as CancelBody | null;
  const subscriptionId = typeof body?.subscriptionId === "string" ? body.subscriptionId : null;
  if (!subscriptionId) return NextResponse.json({ error: "missing_subscription_id" }, { status: 400 });

  const admin = createAdminClient();

  const { data: subscription } = await admin
    .from("subscriptions")
    .select("id, status, pagarme_subscription_id, customers(user_id)")
    .eq("id", subscriptionId)
    .maybeSingle();

  const ownerUserId = (subscription?.customers as unknown as { user_id: string | null } | null)?.user_id;

  if (!subscription || ownerUserId !== user.id) {
    // Não distingue "não existe" de "não é sua" na resposta — evita
    // confirmar pra quem não é dona que aquele id existe.
    return NextResponse.json({ error: "subscription_not_found" }, { status: 404 });
  }

  if (subscription.status !== "active" && subscription.status !== "past_due") {
    return NextResponse.json({ error: "subscription_not_cancellable" }, { status: 422 });
  }

  if (!subscription.pagarme_subscription_id) {
    return NextResponse.json({ error: "subscription_not_cancellable" }, { status: 422 });
  }

  try {
    const provider = getPaymentProvider();
    await provider.cancelSubscription(subscription.pagarme_subscription_id);
  } catch (err) {
    console.error("[account/subscription/cancel] falha ao cancelar na Pagar.me", err);
    return NextResponse.json({ error: "cancel_failed" }, { status: 502 });
  }

  // O status local só é atualizado quando o webhook subscription.canceled
  // chegar (normalmente em segundos) — a resposta aqui só confirma que o
  // pedido de cancelamento foi enviado à Pagar.me com sucesso.
  return NextResponse.json({ ok: true });
}
