"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { trackEvent } from "./track";
import { saveOnboardingMonths } from "./onboarding-handoff";
import { useAge } from "./age-context";

const product = PRODUCTS.nutrimae_assinatura;

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type PlanChoice = "anual" | "mensal";

/**
 * Toggle Mensal/Anual — ver memória feedback-landing-pricing-toggle: manter
 * botões de alternância, não cards estáticos. Ativado em 2026-08-24 junto
 * com o backend do Plano Mensal (checkout/nutrimae-mensal); Anual segue
 * pré-selecionado por converter melhor (parcelamento + preço à vista).
 */
export function Offer() {
  const router = useRouter();
  const { ageOption } = useAge();
  const onboardingMonths = ageOption.onboardingMonths;
  const [plan, setPlan] = useState<PlanChoice>("anual");

  function handleCheckout() {
    trackEvent("InitiateCheckout", { plan });
    // A fase escolhida viaja via sessionStorage, não por query string — mesma
    // técnica já usada por SplashScreen. Lida em onboarding/baby/page.tsx.
    saveOnboardingMonths(onboardingMonths);
    router.push(plan === "anual" ? "/checkout/nutrimae-anual" : "/checkout/nutrimae-mensal");
  }

  return (
    <section id="oferta" className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-300 px-5 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]">
        <h2 className="font-heading text-2xl font-extrabold text-white">
          Comece a organizar a alimentação do seu bebê hoje
        </h2>

        <div className="mt-6 flex w-full gap-1.5 rounded-2xl bg-white/20 p-1.5 [text-shadow:none]">
          <button
            type="button"
            onClick={() => setPlan("mensal")}
            className={`min-h-12 flex-1 rounded-xl text-sm font-bold transition-colors ${
              plan === "mensal" ? "bg-white text-primary-600 shadow-subtle" : "text-white"
            }`}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setPlan("anual")}
            className={`min-h-12 flex-1 rounded-xl text-sm font-bold transition-colors ${
              plan === "anual" ? "bg-white text-primary-600 shadow-subtle" : "text-white"
            }`}
          >
            Anual
          </button>
        </div>

        <div className="mt-3 w-full">
          {plan === "anual" && product.annual ? (
            <div className="relative rounded-3xl border-2 border-white bg-white/95 p-5 text-left text-brown-800 shadow-lg [text-shadow:none]">
              <span className="absolute -top-3 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow">
                MAIS ESCOLHIDO
              </span>
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-brown-700/70">Anual</p>
              <p className="font-heading text-3xl font-extrabold text-primary-600">
                {formatPrice(product.annual.price)}
                <span className="text-base font-semibold text-brown-700"> {product.annual.note}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-brown-700">{product.annual.installmentNote}</p>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-white bg-white/95 p-5 text-left text-brown-800 shadow-lg [text-shadow:none]">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-brown-700/70">Mensal</p>
              <p className="font-heading text-3xl font-extrabold text-primary-600">
                {formatPrice(product.price)}
                <span className="text-base font-semibold text-brown-700"> {product.priceNote}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-brown-700">
                depois {formatPrice(product.regularPrice)}/mês · cancele quando quiser
              </p>
            </div>
          )}
        </div>

        <ul className="mt-6 flex w-full flex-col gap-2 text-left text-sm font-medium text-white">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> Cardápio, cortes e receitas separados por
            idade
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> Acesso liberado na hora, no celular ou no
            computador
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> 7 dias de garantia, sem fidelidade
          </li>
        </ul>

        <button
          type="button"
          onClick={handleCheckout}
          className="mt-4 min-h-14 w-full rounded-2xl bg-green-500 px-6 font-heading text-base font-extrabold text-brown-900 shadow-[0_10px_28px_rgba(0,0,0,0.2),0_6px_22px_rgba(34,197,94,0.45)] transition-transform duration-100 ease-out hover:bg-green-600 active:scale-[0.98]"
        >
          Quero Organizar a Alimentação do Meu Bebê
        </button>

        <p className="mt-4 text-sm text-white/90">
          Teste por 7 dias com calma. Se não encaixar na sua rotina, é só avisar que devolvemos 100% do valor — sem
          formulário complicado e sem precisar justificar.
        </p>
      </div>
    </section>
  );
}
