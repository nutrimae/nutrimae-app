import { redirect } from "next/navigation";
import Image from "next/image";
import { CookingPot, CalendarCheck, Tag } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Chip } from "@/components/ui/chip";
import { UpsellCheckout } from "./_components/upsell-checkout";

const BENEFITS = [
  { icon: CookingPot, color: "bg-primary-50 text-primary-500", title: "Método de porcionamento", text: "Cozinhe uma vez, coma a semana toda." },
  { icon: CalendarCheck, color: "bg-sage-50 text-sage-600", title: "Tabela de validade", text: "Por alimento, na geladeira e no congelador — mais segurança, menos desperdício." },
  { icon: Tag, color: "bg-amber-50 text-amber-600", title: "Etiquetas pra imprimir", text: "Identifique os potinhos de forma prática." },
];

/**
 * OTO1 — Batch Cooking & Congelamento (R$27), adaptado pro Anual.
 *
 * O desenho original do PROMPT_4 tinha o OTO1 como "vire Anual" pra quem
 * comprou o Mensal — não se aplica hoje porque o Mensal está desativado
 * (feature flag) e quem chega aqui já comprou o Anual. Adaptado pra
 * oferecer a expansão Batch Cooking (ver memória
 * "project-bump-upsell-mensal-swap" — reverter pro desenho original quando
 * o Mensal for ativado de verdade).
 *
 * Se a pessoa já levou o Batch Cooking como order bump no checkout, pula
 * direto pro downsell — nunca oferece de novo o que ela já comprou.
 */
export default async function UpsellPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/app");

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("id, status").eq("id", orderId).maybeSingle();
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
          {BENEFITS.map(({ icon: Icon, color, title, text }) => (
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
