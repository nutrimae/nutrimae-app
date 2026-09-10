import type { createAdminClient } from "@/lib/supabase/admin";
import { findOrCreateUser } from "@/lib/webhooks/find-or-create-user";

type AdminClient = ReturnType<typeof createAdminClient>;

export type StripePlan = "basico" | "completo";

interface StripePaymentLike {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown> | null;
  receipt_email?: string | null;
}

/**
 * Espelha grantAccessForRebillPayment — mesma regra de negócio (plan
 * completo ganha o bônus SOS Destete Nocturno), só troca a fonte do
 * pagamento. E-mail vem de metadata.email (setado na criação do
 * PaymentIntent) porque receipt_email nem sempre vem preenchido.
 */
export async function grantAccessForStripePayment(admin: AdminClient, payment: StripePaymentLike) {
  if (payment.status !== "succeeded") return;

  const plan = (payment.metadata?.plan as StripePlan | undefined) ?? "completo";
  const email = (payment.metadata?.email as string | undefined) ?? payment.receipt_email;
  if (!email) throw new Error(`Payment ${payment.id} sem e-mail em metadata.email`);

  const { userId } = await findOrCreateUser(admin, email);

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
