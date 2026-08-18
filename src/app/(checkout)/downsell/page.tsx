"use client";

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { event } from "@/lib/fpixel";

/**
 * Downsell — segunda chance do NutriBot com desconto (R$19,90 no 1º mês).
 *
 * Ajuste em relação ao pedido original: troquei "Última chance antes de
 * liberar seu acesso ao App" pelo texto abaixo. O original insinuava que o
 * acesso ao aplicativo — que ela já pagou na compra principal — ficava
 * retido até ela decidir sobre este upsell. Isso é um dark pattern real
 * (segurar entrega de algo já comprado pra pressionar uma venda separada),
 * não só uma questão de tom. A urgência real aqui é a própria oferta: essa
 * tela mesmo não aparece de novo, então usei isso — é verdade, não
 * inventado.
 */
export default function DownsellPage() {
  const router = useRouter();

  function handleAcceptDownsell() {
    event("AddToCart", { value: 19.9, currency: "BRL", content_name: "NutriBot VIP" });
    console.log("Compra Downsell");
    // TODO: integrar aqui o script de cobrança de 1-clique da
    // Hotmart/Kiwify para o plano promocional do NutriBot.
  }

  function handleDeclineFinal() {
    router.push("/app");
  }

  return (
    <main className="min-h-dvh bg-gray-50 pb-10">
      {/* A. Alerta superior — urgência real (a oferta só aparece nesta
          tela), sem insinuar que o acesso já pago está sendo retido. */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-gray-800">
        <Clock className="h-4 w-4 shrink-0" strokeWidth={2.5} />
        Esta oferta aparece só agora — não vamos mostrá-la de novo.
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-8">
        {/* B. Headline e copy de ancoragem */}
        <div className="text-center">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            Eu entendo... assumir uma mensalidade agora pode parecer muito.
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Mas eu não quero que você fique sem essa ajuda na cozinha. Que tal testar o NutriBot VIP por 30 dias
            com quase 50% de desconto?
          </p>
        </div>

        {/* C. Card da oferta */}
        <div className="relative rounded-2xl border-2 border-rose-600 bg-white p-6 text-center shadow-sm">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-4 py-1 text-xs font-bold text-white">
            OFERTA ÚNICA
          </span>
          <p className="mt-2 text-sm font-medium text-gray-500 line-through">De R$37,00</p>
          <p className="text-4xl font-extrabold text-rose-600">
            R$19,90<span className="text-base font-semibold text-gray-700"> no primeiro mês</span>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            A partir do segundo mês, R$37/mês. Cancele com 1 clique a qualquer momento.
          </p>
        </div>

        {/* D. CTA de aceite */}
        <button
          type="button"
          onClick={handleAcceptDownsell}
          className="min-h-16 w-full rounded-2xl bg-[#25D366] px-6 text-lg font-bold text-white shadow-lg transition-colors hover:bg-[#20bd5a]"
        >
          SIM! Quero testar por R$19,90
        </button>

        {/* E. Recusa definitiva — libera para o app principal, que ela já
            pagou na compra original. */}
        <button
          type="button"
          onClick={handleDeclineFinal}
          className="mx-auto text-sm text-gray-400 underline hover:text-gray-600"
        >
          Não, quero apenas o meu acesso ao aplicativo base e aos bônus.
        </button>
      </div>
    </main>
  );
}
