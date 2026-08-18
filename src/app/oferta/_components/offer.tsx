"use client";

import { Check } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { trackEvent } from "./track";
import { saveOnboardingMonths } from "./onboarding-handoff";

const product = PRODUCTS.nutrimae_assinatura;

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function handleCheckout(plan: "mensal" | "anual", onboardingMonths: number) {
  trackEvent("InitiateCheckout", { plan });
  const url = plan === "anual" ? product.annual?.checkoutUrl : product.checkoutUrl;
  // CHECKOUT CARTPANDA: sem checkoutUrl configurado ainda, manda para o
  // cadastro (o mesmo fallback já usado em upgrade-screen.tsx) em vez de um
  // link morto. /login não aceita um parâmetro de redirecionamento (é sempre
  // "/" → RootPage → onboarding/welcome para quem ainda não tem bebê), então
  // a fase escolhida viaja via sessionStorage, não por query string — mesma
  // técnica já usada por SplashScreen. Lida em onboarding/baby/page.tsx.
  saveOnboardingMonths(onboardingMonths);
  window.location.href = url ?? "/login";
}

export function Offer({ onboardingMonths }: { onboardingMonths: number }) {
  return (
    <section id="oferta" className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-300 px-5 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]">
        <h2 className="font-heading text-2xl font-extrabold text-white">
          Comece a organizar a alimentação do seu bebê hoje
        </h2>

        <div className="mt-6 grid w-full grid-cols-1 gap-3">
          {/* Mensal */}
          <div className="rounded-3xl bg-white/95 p-5 text-left text-brown-800 shadow-lg [text-shadow:none]">
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-brown-700/70">Mensal</p>
            <p className="mt-1 text-sm text-brown-700/70 line-through">De R$47</p>
            <p className="font-heading text-3xl font-extrabold text-primary-600">
              {formatPrice(product.price)}
              <span className="text-base font-semibold text-brown-700"> {product.priceNote}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-brown-700">
              Depois {formatPrice(product.regularPrice)}/mês. Cancele quando quiser, sem burocracia.
            </p>
          </div>

          {/* Anual */}
          {product.annual && (
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

        <p className="mt-6 text-sm font-semibold text-white">
          Depois do 1º mês: {formatPrice(product.regularPrice)}/mês. Cancele quando quiser, com 2 toques dentro do
          seu perfil no app.
        </p>

        <button
          type="button"
          onClick={() => handleCheckout("mensal", onboardingMonths)}
          className="mt-4 min-h-14 w-full rounded-2xl bg-green-500 px-6 font-heading text-base font-extrabold text-brown-900 shadow-[0_10px_28px_rgba(0,0,0,0.2),0_6px_22px_rgba(34,197,94,0.45)] transition-transform duration-100 ease-out hover:bg-green-600 active:scale-[0.98]"
        >
          Quero Organizar a Alimentação do Meu Bebê
        </button>

        {product.annual && (
          <button
            type="button"
            onClick={() => handleCheckout("anual", onboardingMonths)}
            className="mt-3 min-h-12 w-full rounded-2xl border-2 border-white/70 px-6 font-heading text-sm font-bold text-white transition-transform duration-100 ease-out active:scale-[0.98]"
          >
            Prefiro o plano anual ({formatPrice(product.annual.price)})
          </button>
        )}

        <p className="mt-4 text-sm text-white/90">
          Teste por 7 dias com calma. Se não encaixar na sua rotina, é só avisar que devolvemos 100% do valor — sem
          formulário complicado e sem precisar justificar.
        </p>
      </div>
    </section>
  );
}
