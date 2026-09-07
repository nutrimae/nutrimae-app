"use client";

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

        <p className="font-heading text-lg font-bold italic leading-snug text-primary-500">
          O fim do &quot;o que eu ofereço hoje?&quot; está logo abaixo — sem achismo, sem stress.
        </p>
      </div>
    </section>
  );
}
