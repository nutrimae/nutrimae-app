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

type PlanChoice = "completo" | "basico";

/**
 * Toggle Básico/Completo — ver memória feedback-landing-pricing-toggle:
 * manter botões de alternância, não cards estáticos. Os dois são pagamento
 * único, vitalício, sem mensalidade (pivô de 2026-09-08: NutriMãe deixou de
 * vender assinatura recorrente — ver migração
 * 202609080001_planos_basico_completo.sql). Completo segue pré-selecionado
 * por converter melhor (bônus embutido + parcelamento).
 */
export function Offer() {
  const router = useRouter();
  const { ageOption } = useAge();
  const onboardingMonths = ageOption.onboardingMonths;
  const [plan, setPlan] = useState<PlanChoice>("completo");

  function goToCheckout(offerSlug: string) {
    // A fase escolhida viaja via sessionStorage, não por query string — mesma
    // técnica já usada por SplashScreen. Lida em onboarding/baby/page.tsx.
    saveOnboardingMonths(onboardingMonths);
    router.push(`/checkout/${offerSlug}`);
  }

  function handleCheckout() {
    trackEvent("InitiateCheckout", { plan });
    goToCheckout(plan === "completo" ? "nutrimae-anual" : "nutrimae-basico");
  }

  return (
    <section id="oferta" className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-300 px-5 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]">
        <h2 className="font-heading text-2xl font-extrabold text-white">
          Comece a organizar a alimentação do seu bebê hoje
        </h2>
        <p className="mt-1 text-sm font-semibold text-white/90">
          Pagamento único, acesso vitalício — sem mensalidade
        </p>

        <div className="mt-6 flex w-full gap-1.5 rounded-2xl bg-white/20 p-1.5 [text-shadow:none]">
          <button
            type="button"
            onClick={() => setPlan("basico")}
            className={`min-h-12 flex-1 rounded-xl text-sm font-bold transition-colors ${
              plan === "basico" ? "bg-white text-primary-600 shadow-subtle" : "text-white"
            }`}
          >
            Básico
          </button>
          <button
            type="button"
            onClick={() => setPlan("completo")}
            className={`min-h-12 flex-1 rounded-xl text-sm font-bold transition-colors ${
              plan === "completo" ? "bg-white text-primary-600 shadow-subtle" : "text-white"
            }`}
          >
            Completo
          </button>
        </div>

        <div className="mt-3 w-full">
          {plan === "completo" && product.completo ? (
            <div className="relative rounded-3xl border-2 border-white bg-white/95 p-5 text-left text-brown-800 shadow-lg [text-shadow:none]">
              <span className="absolute -top-3 right-4 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow">
                MAIS ESCOLHIDO
              </span>
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-brown-700/70">
                Plano Completo · vitalício
              </p>
              <div className="mt-2 rounded-2xl bg-primary-50 p-4 text-center">
                <p className="text-xs text-brown-700/70">
                  De <span className="font-bold text-red-500 line-through">{formatPrice(product.completo.anchorPrice)}</span> por
                </p>
                <p className="mt-0.5 font-heading text-3xl font-extrabold text-primary-600">
                  <span className="text-lg font-bold">{product.completo.maxInstallments}x de</span>{" "}
                  {formatPrice(product.completo.price / product.completo.maxInstallments)}
                </p>
                <p className="mt-0.5 text-sm font-bold text-brown-700">
                  ou {formatPrice(product.completo.price)} {product.completo.note}
                </p>
              </div>
              <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} /> Bônus incluído: SOS Desmame Noturno (R$ 27) de graça
              </p>
              <p className="mt-2 text-xs font-semibold text-brown-700/70">Pix ou cartão de crédito</p>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-white bg-white/95 p-5 text-left text-brown-800 shadow-lg [text-shadow:none]">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-brown-700/70">
                Plano Básico · vitalício
              </p>
              <p className="font-heading text-3xl font-extrabold text-primary-600">
                {formatPrice(product.price)}
              </p>
              <p className="mt-1 text-sm font-semibold text-brown-700">{product.priceNote}</p>
              <p className="mt-2 text-xs font-semibold text-brown-700/70">Pix ou cartão de crédito</p>
            </div>
          )}
        </div>

        <ul className="mt-6 flex w-full flex-col gap-2 text-left text-sm font-medium text-white">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> Cardápio, cortes e receitas separados por
            idade
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> Acesso vitalício liberado na hora, no celular
            ou no computador
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
