"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL_DEPOIMENTOS = 9;

/**
 * Carrossel de prints reais do WhatsApp — mesmo padrão já usado no Kit
 * Crochê com Fé e na Clínica Psi. Substitui o estado vazio anterior
 * ("estamos coletando os primeiros relatos") agora que temos depoimentos
 * reais e autorizados (números de telefone já borrados nas próprias
 * imagens, ver public/depoimentos/).
 */
export function Testimonial() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function move(delta: number) {
    setIndex((prev) => (prev + delta + TOTAL_DEPOIMENTOS) % TOTAL_DEPOIMENTOS);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-primary-500">Direto do WhatsApp</p>
      <h2 className="mt-1 font-heading text-xl font-extrabold leading-snug text-brown-900">
        Quem já está usando o NutriMãe
      </h2>

      <div className="relative mt-5">
        <div
          className="overflow-hidden rounded-3xl border border-sage-100/80 bg-white shadow-strong"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={`/depoimentos/depoimento_${index + 1}.jpg`}
            alt="Print de depoimento real recebido no WhatsApp"
            width={640}
            height={1137}
            className="h-auto w-full"
            priority={index === 0}
          />
        </div>
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Depoimento anterior"
          className="absolute left-[-14px] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-sage-100/80 bg-white text-brown-700 shadow-strong transition-colors hover:bg-cream"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Próximo depoimento"
          className="absolute right-[-14px] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-sage-100/80 bg-white text-brown-700 shadow-strong transition-colors hover:bg-cream"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_DEPOIMENTOS }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ver depoimento ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${i === index ? "bg-primary-500" : "bg-primary-100"}`}
          />
        ))}
      </div>

      <p className="mt-2 text-xs font-medium text-brown-700/60">Deslize para o lado para ver mais depoimentos ✦</p>
    </section>
  );
}
