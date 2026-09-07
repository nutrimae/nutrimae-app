import { redirect } from "next/navigation";
import Image from "next/image";
import { CalendarCheck, PiggyBank, Lock, CookingPot, Tag } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Chip } from "@/components/ui/chip";
import { UpsellCheckout } from "./_components/upsell-checkout";

const BATCH_BENEFITS = [
  { icon: CookingPot, color: "bg-primary-50 text-primary-500", title: "Método de porcionamento", text: "Cozinhe uma vez, coma a semana toda." },
  { icon: CalendarCheck, color: "bg-sage-50 text-sage-600", title: "Tabela de validade", text: "Por alimento, na geladeira e no congelador — mais segurança, menos desperdício." },
  { icon: Tag, color: "bg-amber-50 text-amber-600", title: "Etiquetas pra imprimir", text: "Identifique os potinhos de forma prática." },
];

const ANUAL_UPSELL_BENEFITS = [
  { icon: PiggyBank, color: "bg-primary-50 text-primary-500", title: "Menos que 2 meses do Mensal", text: "R$37 uma vez só, contra R$29,90 todo mês — o ano inteiro sai mais barato que fevereiro e março juntos." },
  { icon: Lock, color: "bg-sage-50 text-sage-600", title: "Acesso garantido pro ano todo", text: "Sem risco de esquecer de pagar, sem cartão recusado no meio do caminho." },
  { icon: CalendarCheck, color: "bg-amber-50 text-amber-600", title: "Só nesta tela", text: "Depois que você sair daqui, essa condição não aparece mais." },
];

/**
 * OTO1 pós-compra — a oferta muda conforme o que a pessoa acabou de
 * comprar: Plano Anual (order) vê Batch Cooking; Plano Mensal (subscription)
 * vê o upgrade pro Anual por R$37 (oferta exclusiva, offer_id
 * "nutrimae-anual-upsell", pagamento único). Nunca os dois ao mesmo tempo
 * (ver checkout/obrigado/page.tsx, que decide pra onde mandar).
 *
 * Trocado de NutriBot VIP pro upgrade Anual em 2026-09-07 — o objetivo
 * passou a ser converter quem escolheu Mensal pra recorrência de verdade
 * (o Pix do Mensal, ver subscription-checkout-form.tsx, não renova
 * sozinho; esse upsell é o convite pra travar o ano inteiro). NutriBot VIP
 * continua existindo como oferta (nutribot-vip-mensal) e como componente
 * (vip-upsell-checkout.tsx), só não está mais linkado de nenhuma página —
 * reativar aqui ou como downsell secundário se fizer sentido depois.
 */
export default async function UpsellPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; subscriptionId?: string }>;
}) {
  const { orderId, subscriptionId } = await searchParams;
  if (!orderId && !subscriptionId) redirect("/app");

  const admin = createAdminClient();

  if (subscriptionId) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("id, status, customer_id")
      .eq("id", subscriptionId)
      .maybeSingle();
    if (!subscription || subscription.status !== "active") redirect("/app");

    const { data: anualUpsellOffer } = await admin
      .from("offers")
      .select("id, price_cents, active")
      .eq("slug", "nutrimae-anual-upsell")
      .maybeSingle();

    if (!anualUpsellOffer || !anualUpsellOffer.active) {
      redirect(`/downsell?subscriptionId=${subscription.id}`);
    }

    const { data: existingOrder } = await admin
      .from("orders")
      .select("id")
      .eq("customer_id", subscription.customer_id)
      .eq("offer_id", anualUpsellOffer.id)
      .eq("status", "paid")
      .maybeSingle();

    if (existingOrder) redirect(`/downsell?subscriptionId=${subscription.id}`);

    return (
      <main className="min-h-dvh bg-cream pb-10">
        <div className="sticky top-0 z-50 bg-sage-500 px-4 py-3 text-center text-sm font-semibold text-white">
          🎉 Sua assinatura está confirmada! Antes de continuar, veja uma oferta exclusiva desta página.
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold leading-tight text-brown-900">
              Já que você começou agora, que tal garantir o ano inteiro de uma vez?
            </h1>
            <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-base text-brown-700/86">
              Troque pro <span className="font-heading font-bold text-primary-600">Plano Anual</span>
              <Chip color="primary" variant="solid">oferta exclusiva pra você</Chip>
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[24px] bg-white p-5 shadow-strong">
            {ANUAL_UPSELL_BENEFITS.map(({ icon: Icon, color, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-brown-900">{title}</p>
                  <p className="mt-0.5 text-sm text-brown-700/86">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-brown-700/70">
            Pagamento único, vitalício pro ano corrente — não cancela nem substitui sua mensalidade automaticamente
            (você continua controlando ela pelo perfil, se quiser cancelar depois de trocar).
          </p>

          <UpsellCheckout parentSubscriptionId={subscription.id} offerSlug="nutrimae-anual-upsell" priceCents={anualUpsellOffer.price_cents} />
        </div>
      </main>
    );
  }

  const { data: order } = await admin.from("orders").select("id, status").eq("id", orderId!).maybeSingle();
  if (!order || order.status !== "paid") redirect("/app");

  const { data: offer } = await admin
    .from("offers")
    .select("id, price_cents, active")
    .eq("slug", "batch-cooking")
    .maybeSingle();

  if (!offer || !offer.active) redirect(`/downsell?orderId=${order.id}`);

  const { data: existingItem } = await admin
    .from("order_items")
    .select("id")
    .eq("order_id", order.id)
    .eq("offer_id", offer.id)
    .maybeSingle();

  if (existingItem) redirect(`/downsell?orderId=${order.id}`);

  return (
    <main className="min-h-dvh bg-cream pb-10">
      <div className="sticky top-0 z-50 bg-sage-500 px-4 py-3 text-center text-sm font-semibold text-white">
        🎉 Sua compra do NutriMãe está confirmada! Antes de continuar, veja uma oferta exclusiva desta página.
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6">
        <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-[28px] shadow-strong">
          <Image
            src="/images/order-bumps/batch-cooking.webp"
            alt="Batch Cooking & Congelamento"
            width={600}
            height={502}
            priority
            className="w-full object-cover"
          />
        </div>

        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold leading-tight text-brown-900">
            Você garantiu os cardápios. Que tal resolver de vez a pergunta &ldquo;quando eu vou cozinhar isso&rdquo;?
          </h1>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-base text-brown-700/86">
            Conheça o <span className="font-heading font-bold text-primary-600">Batch Cooking & Congelamento</span>
            <Chip color="primary" variant="solid">acesso vitalício</Chip>
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[24px] bg-white p-5 shadow-strong">
          {BATCH_BENEFITS.map(({ icon: Icon, color, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-brown-900">{title}</p>
                <p className="mt-0.5 text-sm text-brown-700/86">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-brown-700/70">
          Acesso vitalício, não entra na assinatura. Se você já investiu em outra expansão, o valor vira crédito
          guardado no seu perfil.
        </p>

        <UpsellCheckout parentOrderId={order.id} offerSlug="batch-cooking" priceCents={offer.price_cents} />
      </div>
    </main>
  );
}
