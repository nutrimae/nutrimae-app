import type { createAdminClient } from "@/lib/supabase/admin";
import { findOrCreateUser } from "@/lib/webhooks/find-or-create-user";

type AdminClient = ReturnType<typeof createAdminClient>;

export type HotmartPlan = "basico" | "completo";

// Código da oferta ("off") criado no painel Hotmart → plano interno. O
// "Plan Completo" (produto 8499889, CLP 9.900) já existe com o código
// zuqnvssu — ver conversa de 2026-09-11. Adicionar aqui o código do
// "Plan Básico" assim que ele for criado no Hotmart.
const OFFER_CODE_TO_PLAN: Record<string, HotmartPlan> = {
  zuqnvssu: "completo",
};

interface HotmartPurchaseLike {
  transaction: string;
  status: string;
  offer?: { code?: string } | null;
  buyer?: { email?: string | null } | null;
}

/**
 * Espelha grantAccessForStripePayment/grantAccessForRebillPayment — mesma
 * regra de negócio (plano completo ganha o bônus SOS Destete Nocturno), só
 * troca a fonte do pagamento. Só concede acesso para status aprovado —
 * Hotmart usa "APPROVED"/"COMPLETE" para compra à vista confirmada (ver
 * PURCHASE_APPROVED/PURCHASE_COMPLETE em developers.hotmart.com/docs/pt-BR/webhooks).
 */
export async function grantAccessForHotmartPayment(admin: AdminClient, purchase: HotmartPurchaseLike) {
  const status = purchase.status?.toUpperCase();
  if (status !== "APPROVED" && status !== "COMPLETE") return;

  const email = purchase.buyer?.email;
  if (!email) throw new Error(`Compra Hotmart ${purchase.transaction} sem e-mail do comprador`);

  const offerCode = purchase.offer?.code;
  const plan = (offerCode && OFFER_CODE_TO_PLAN[offerCode]) || "completo";

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
