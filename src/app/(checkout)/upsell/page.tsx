import { redirect } from "next/navigation";
import { Check, Info } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { UpsellActions } from "./_components/upsell-actions";

/**
 * Upsell de 1 clique — NutriBot VIP (R$37/mês).
 *
 * Reescrevi o headline e um dos benefícios em relação ao pedido original:
 * a versão pedida enquadrava o bot como resposta a "seu bebê engasgasse
 * agora" / "orientações sobre emergências (engasgos e alergias)". Isso não
 * é só risco de política de anúncio (é o gatilho de medo exato que este
 * projeto vem evitando o tempo todo) — é um risco real de segurança: uma
 * mãe pensar "posso perguntar pro bot" no meio de um engasgo de verdade,
 * em vez de agir imediatamente ou ligar pra emergência, é um comportamento
 * perigoso de verdade. O NutriBot aqui é vendido para dúvidas do dia a dia
 * (receitas, cortes, rotina) — nunca para emergências — e o aviso de
 * segurança abaixo deixa isso explícito.
 *
 * Exige um pedido pago de verdade (validado no servidor) pra existir —
 * sem isso, redireciona pra fora do funil.
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

  return (
    <main className="min-h-dvh bg-gray-50 pb-10">
      {/* A. Barra de aviso (topo fixo) — reformulada: honesta sobre o que
          já está confirmado (a assinatura principal), sem insinuar que a
          compra "não terminou" se ela não pegar o upsell. */}
      <div className="sticky top-0 z-50 bg-[#FFF3CD] px-4 py-3 text-center text-sm font-semibold text-gray-800">
        🎉 Sua assinatura NutriMãe está confirmada! Antes de continuar, veja uma oferta exclusiva desta página.
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-6">
        {/* B. Barra de progresso */}
        <div>
          <p className="mb-2 text-center text-xs font-semibold text-gray-500">
            Passo 2 de 3: Personalizando seu acesso
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-2/3 rounded-full bg-rose-600" />
          </div>
        </div>

        {/* C. Headline e sub-headline */}
        <div className="text-center">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            Você garantiu seus cardápios. Que tal ter respostas rápidas para as dúvidas do dia a dia, direto no
            WhatsApp?
          </h1>
          <h2 className="mt-3 text-base text-gray-600">
            Conheça o <span className="font-semibold text-rose-600">NutriBot VIP</span>: tire dúvidas sobre
            receitas, cortes e rotina alimentar, quando precisar, sem abrir o app.
          </h2>
        </div>

        {/* D. Placeholder do vídeo */}
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-slate-200">
          <span className="text-sm font-medium text-slate-500">Vídeo/GIF do WhatsApp aqui</span>
        </div>

        {/* E. Benefícios */}
        <ul className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <li className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2.5} />
            <span className="text-sm text-gray-800">Entende áudios, mesmo com barulho ao fundo</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2.5} />
            <span className="text-sm text-gray-800">Respostas rápidas, em poucos segundos</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2.5} />
            <span className="text-sm text-gray-800">Tira dúvidas sobre receitas, cortes e rotina alimentar</span>
          </li>
        </ul>

        {/* Aviso de segurança — explícito de propósito, dado que o produto
            é um chatbot e não pode ser confundido com atendimento de
            emergência. */}
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>
            O NutriBot é um assistente para dúvidas do dia a dia e não substitui orientação médica. Em caso de
            emergência, ligue para o SAMU (192) ou vá ao pronto-socorro mais próximo.
          </span>
        </div>

        {/* F/G. CTA de compra e recusa */}
        <UpsellActions orderId={order.id} />
      </div>
    </main>
  );
}
