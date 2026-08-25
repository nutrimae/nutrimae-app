import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

interface ResolvedParent {
  customerId: string;
  providerCustomerId: string;
}

/**
 * Upsell/downsell pós-compra reaproveitam o cliente já cadastrado no pedido
 * pai, sem pedir nome/e-mail/CPF de novo — o "pedido pai" pode ser um
 * pagamento único (Plano Anual → orders) OU uma assinatura (Plano
 * Mensal/NutriBot VIP → subscriptions), nunca os dois ao mesmo tempo.
 * Só resolve o cliente se o pedido/assinatura pai já está confirmado
 * (paid/active) — nunca reaproveita dados de uma compra ainda pendente.
 */
export async function resolveParentCustomer(
  admin: AdminClient,
  input: { parentOrderId?: string | null; parentSubscriptionId?: string | null },
): Promise<ResolvedParent | null> {
  if (input.parentOrderId) {
    const { data: order } = await admin
      .from("orders")
      .select("customer_id, status")
      .eq("id", input.parentOrderId)
      .maybeSingle();
    if (!order || order.status !== "paid") return null;
    return resolveCustomer(admin, order.customer_id);
  }

  if (input.parentSubscriptionId) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("customer_id, status")
      .eq("id", input.parentSubscriptionId)
      .maybeSingle();
    if (!subscription || subscription.status !== "active") return null;
    return resolveCustomer(admin, subscription.customer_id);
  }

  return null;
}

async function resolveCustomer(admin: AdminClient, customerId: string): Promise<ResolvedParent | null> {
  const { data: customer } = await admin
    .from("customers")
    .select("id, pagarme_customer_id")
    .eq("id", customerId)
    .maybeSingle();
  if (!customer?.pagarme_customer_id) return null;
  return { customerId: customer.id, providerCustomerId: customer.pagarme_customer_id };
}
