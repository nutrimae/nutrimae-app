import type { createAdminClient } from "@/lib/supabase/admin";
import { findOrCreateUser } from "@/lib/webhooks/find-or-create-user";

type AdminClient = ReturnType<typeof createAdminClient>;

export type RebillPlan = "basico" | "completo";

interface RebillPaymentLike {
  id: string;
  status: string;
  amount: number;
  currency: string;
  customer: { email: string; firstName?: string | null; lastName?: string | null };
  metadata?: Record<string, unknown> | null;
}

/**
 * Espelha grantAccessForOrder do webhook do Pagar.me (ver
 * src/app/api/webhooks/pagarme/route.ts), mas simplificado: sem
 * orders/order_items/order bumps próprios da Rebill ainda — só a
 * assinatura principal (nutrimae_assinatura) e o bônus do Plano Completo
 * (sos_desmame_noturno), igual ao fluxo BRL faz pro Anual.
 *
 * Idempotente por natureza: upsert em "user_products" com onConflict
 * user_id+product_id — reprocessar o mesmo pagamento (reconciliação via
 * webhook depois da confirmação via API) não duplica nem quebra nada.
 */
export async function grantAccessForRebillPayment(admin: AdminClient, payment: RebillPaymentLike) {
  if (payment.status !== "approved") return;

  const plan = (payment.metadata?.plan as RebillPlan | undefined) ?? "completo";
  const { userId } = await findOrCreateUser(admin, payment.customer.email);

  await admin.from("user_products").upsert(
    {
      user_id: userId,
      product_id: "nutrimae_assinatura",
      product_name: plan === "basico" ? "NutriMama — Plan Básico" : "NutriMama — Plan Completo",
      status: "active",
      canceled_at: null,
    },
    { onConflict: "user_id,product_id" },
  );

  if (plan === "completo") {
    await admin.from("user_products").upsert(
      {
        user_id: userId,
        product_id: "sos_desmame_noturno",
        product_name: "SOS Destete Nocturno (bono del Completo)",
        status: "active",
        canceled_at: null,
      },
      { onConflict: "user_id,product_id" },
    );
  }

  return { userId };
}
