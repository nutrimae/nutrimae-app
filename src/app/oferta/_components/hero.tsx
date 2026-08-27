"use client";

import { trackEvent } from "./track";
import { scrollToSection } from "./scroll";
import { TrackedVsl } from "./tracked-vsl";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-primary-100 via-cream to-cream px-5 pb-8 pt-10">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-brown-800">
          Saiba exatamente o que oferecer, como cortar e o que cozinhar hoje
        </h1>
        <p className="text-sm text-brown-700/80">
          Cardápio semanal, lista de compras e o corte indicado de cada alimento, organizados por idade — direto
          no seu celular.
        </p>

        <TrackedVsl />

        <button
          type="button"
          onClick={() => {
            trackEvent("HeroCtaClick");
            scrollToSection("fase");
          }}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-500 px-6 font-heading text-base font-bold text-white shadow-md shadow-primary-500/20 transition-transform duration-100 ease-out hover:bg-primary-hover active:scale-[0.98]"
        >
          Ver o que preparamos para a fase do meu bebê
        </button>
      </div>
    </section>
  );
}
