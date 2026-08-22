"use client";

import { useRouter } from "next/navigation";
import { event } from "@/lib/fpixel";

/**
 * NutriBot VIP é assinatura recorrente — a oferta "nutribot-vip-mensal"
 * está com active=false (feature flag) até a estrutura de assinatura
 * passar por sandbox e produção controlada. Por isso o clique em "SIM"
 * ainda não cobra de verdade: cobrar aqui seria fingir uma assinatura que
 * o backend não está pronto pra sustentar. A página fica pronta pra
 * quando a oferta for ativada; até lá, os dois botões levam ao downsell.
 */
export function UpsellActions({ orderId }: { orderId: string }) {
  const router = useRouter();

  function handleBuy() {
    event("AddToCart", { value: 37.0, currency: "BRL", content_name: "NutriBot VIP" });
    router.push(`/downsell?orderId=${orderId}`);
  }

  function handleDecline() {
    router.push(`/downsell?orderId=${orderId}`);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleBuy}
          className="min-h-16 w-full animate-[pulse_2s_ease-in-out_infinite] rounded-2xl bg-[#25D366] px-6 text-lg font-bold text-white shadow-lg transition-colors hover:bg-[#20bd5a]"
        >
          SIM! Quero adicionar o NutriBot VIP (R$37/mês)
        </button>
        <p className="text-center text-xs text-gray-500">Assinatura mensal. Cancele quando quiser.</p>
      </div>

      <button
        type="button"
        onClick={handleDecline}
        className="mx-auto text-sm text-gray-400 underline hover:text-gray-600"
      >
        Não, obrigada. Continuar sem o NutriBot.
      </button>
    </>
  );
}
