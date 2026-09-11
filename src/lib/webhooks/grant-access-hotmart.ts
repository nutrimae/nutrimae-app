import type { createAdminClient } from "@/lib/supabase/admin";
import { findOrCreateUser } from "@/lib/webhooks/find-or-create-user";
// eslint-disable-next-line @typescript-eslint/no-require-imports -- meta-conversion.js é CommonJS solto na raiz do repo (mesmo padrão do webhooks/pagarme/route.ts).
const { sendPurchaseEvent } = require("../../../meta-conversion.js");

type AdminClient = ReturnType<typeof createAdminClient>;

export type HotmartPlan = "basico" | "completo";

// Código da oferta ("off") criado no painel Hotmart → plano interno.
// "Plan Completo" (produto 8499889) e "Plan Básico" (produto 8502012) —
// ambos criados em 2026-09-11, mesmo webhook "nutrimaec" cobre os dois
// produtos. zuqnvssu/waf4nyql eram os preços-base originais do Chile (CLP
// 9.900/3.990), mas o Hotmart soma o imposto local EM CIMA do preço
// configurado — então o preço final ao cliente ficava acima do anunciado.
// 5laftq57/jbqhhgxn são os preços corrigidos pro Chile (base ÷ 1,19),
// validados no checkout mostrando exatamente $9.900 / $3.990 (IVA incluído).
//
// Expansão LATAM (2026-09-11): México, Colômbia, Peru e Equador, cada um
// com sua própria oferta/moeda. México soma 16% de IVA em cima do preço
// (mesmo comportamento do Chile) — preço configurado já é base ÷ 1,16.
// Colômbia, Peru e Equador NÃO somam imposto em cima do preço configurado
// (confirmado testando o checkout com o seletor de país) — o valor
// configurado é o valor final, sem correção. Todos validados no checkout
// antes de entrar aqui.
const OFFER_CODE_TO_PLAN: Record<string, HotmartPlan> = {
  // Chile
  "5laftq57": "completo",
  "jbqhhgxn": "basico",
  zuqnvssu: "completo",
  waf4nyql: "basico",
  // México
  bm01x9ht: "completo",
  js7w15hw: "basico",
  // Colômbia
  "33hupbas": "completo",
  tpp73th9: "basico",
  // Peru
  syy8cao1: "completo",
  "0kyqa0re": "basico",
  // Equador
  pl35q3q0: "completo",
  razluwie: "basico",
};

interface HotmartPurchaseLike {
  transaction: string;
  status: string;
  offer?: { code?: string } | null;
  buyer?: { email?: string | null; checkout_phone?: string | null } | null;
  price?: { value?: number; currency_value?: string } | null;
}

/**
 * Espelha grantAccessForStripePayment/grantAccessForRebillPayment — mesma
 * regra de negócio (plano completo ganha o bônus SOS Destete Nocturno), só
 * troca a fonte do pagamento. Só concede acesso para status aprovado —
 * Hotmart usa "APPROVED"/"COMPLETED" para compra à vista confirmada.
 * Confirmado contra um payload real de teste (2026-09-11, evento
 * PURCHASE_COMPLETE) — data.purchase.status vem "COMPLETED", não
 * "COMPLETE" como a doc pública sugeria de memória.
 */
export async function grantAccessForHotmartPayment(admin: AdminClient, purchase: HotmartPurchaseLike) {
  const status = purchase.status?.toUpperCase();
  if (status !== "APPROVED" && status !== "COMPLETED") return;

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

  await reportPurchaseToMeta(purchase, email);

  return { userId };
}

/**
 * Purchase pro Meta via Conversions API — mesmo padrão do webhook do
 * Pagar.me (ver src/app/api/webhooks/pagarme/route.ts), que já manda esse
 * evento pro fluxo BR. Sem isso, o Pixel só via InitiateCheckout (client-side,
 * no clique do botão) pras compras do Hotmart — o algoritmo do Meta nunca
 * aprendia quem de fato pagou, só quem clicou em comprar. Best-effort e
 * nunca lança: a liberação de acesso (já feita acima) é o que importa de
 * verdade, rastreamento de anúncio não pode derrubar o webhook.
 *
 * Não temos fbc/fbp/IP/user-agent aqui (o checkout roda inteiro no domínio
 * do Hotmart, não no nosso) — a correspondência no Meta fica só por
 * e-mail/telefone (hasheados), pior que a do fluxo BR mas ainda funcional.
 */
async function reportPurchaseToMeta(purchase: HotmartPurchaseLike, email: string) {
  if (!process.env.META_ACCESS_TOKEN || !process.env.META_PIXEL_ID) return;
  try {
    const amountCents =
      typeof purchase.price?.value === "number" ? Math.round(purchase.price.value * 100) : undefined;
    await sendPurchaseEvent({
      email,
      phone: purchase.buyer?.checkout_phone ?? undefined,
      orderId: `hotmart_${purchase.transaction}`,
      amountCents,
      currency: purchase.price?.currency_value ?? "CLP",
    });
  } catch (err) {
    console.error("[hotmart-webhook] falha ao reportar compra pro Meta (acesso já foi liberado normalmente)", err);
  }
}
