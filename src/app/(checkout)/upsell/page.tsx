import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { UpsellCheckout } from "./_components/upsell-checkout";

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
    <main className="min-h-dvh bg-gray-50 pb-10">
      <div className="sticky top-0 z-50 bg-[#FFF3CD] px-4 py-3 text-center text-sm font-semibold text-gray-800">
        🎉 Sua compra do NutriMãe está confirmada! Antes de continuar, veja uma oferta exclusiva desta página.
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            Você garantiu os cardápios. Que tal resolver de vez a pergunta &ldquo;quando eu vou cozinhar isso&rdquo;?
          </h1>
          <h2 className="mt-3 text-base text-gray-600">
            Conheça o <span className="font-semibold text-rose-600">Batch Cooking & Congelamento</span>: cozinhe a
            semana inteira em uma hora só.
          </h2>
        </div>

        <ul className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2.5} />
            <span className="text-sm text-gray-800">Método de porcionamento: cozinhe uma vez, coma a semana toda</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2.5} />
            <span className="text-sm text-gray-800">Tabela de validade por alimento, na geladeira e no congelador</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2.5} />
            <span className="text-sm text-gray-800">Etiquetas prontas pra imprimir</span>
          </li>
        </ul>

        <p className="text-center text-xs text-gray-500">
          Acesso vitalício, não entra na assinatura. Se você já investiu em outra expansão, o valor vira crédito
          guardado no seu perfil.
        </p>

        <UpsellCheckout parentOrderId={order.id} offerSlug="batch-cooking" priceCents={offer.price_cents} />
      </div>
    </main>
  );
}
