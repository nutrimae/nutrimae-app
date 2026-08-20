"use client";

import { useMemo, useState } from "react";
import { Search, Lock } from "lucide-react";
import { LOCKED_FOODS, SEARCHABLE_FOODS } from "./data";
import { trackEvent } from "./track";
import { useAge } from "./age-context";

export function FoodDemo() {
  const { ageOption } = useAge();
  const [query, setQuery] = useState("");

  const match = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return SEARCHABLE_FOODS.find((food) => food.name.toLowerCase().includes(q)) ?? "not-found";
  }, [query]);

  const displayed =
    match && match !== "not-found"
      ? { name: match.name, emoji: match.emoji, ageRange: match.ageRange, cut: match.cut, how: match.how }
      : ageOption.food;

  function handleSearchChange(value: string) {
    setQuery(value);
    if (value.trim().length >= 2) {
      trackEvent("FoodSearchUsed", { query: value.trim() });
    }
  }

  return (
    <section id="demonstracao" className="mx-auto w-full max-w-sm px-5 py-8">
      <h2 className="text-center font-heading text-xl font-bold text-brown-800">
        Veja como funciona o guia de cortes
      </h2>

      <div className="relative mt-5">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brown-700/40"
          strokeWidth={2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Pesquise: banana, abacate ou morango"
          className="min-h-14 w-full rounded-2xl border-2 border-sage-100 bg-white pl-12 pr-4 text-base text-brown-800 placeholder:text-brown-700/40 outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary-500 focus:shadow-[0_0_0_4px_var(--color-primary-glow)]"
        />
      </div>

      {match === "not-found" ? (
        <p className="mt-3 text-center text-sm text-brown-700/70">
          Essa demonstração tem só 3 alimentos de exemplo. No acesso completo, a busca cobre o guia inteiro.
        </p>
      ) : null}

      <div className="mt-5 rounded-3xl border-2 border-sage-400 bg-sage-50 p-5">
        <span className="inline-block rounded-full bg-sage-500 px-3 py-1 text-xs font-bold text-white">
          Exemplo liberado
        </span>
        <div className="mt-3 text-5xl leading-none">{displayed.emoji}</div>
        <h3 className="mt-2 font-heading text-lg font-bold text-brown-800">{displayed.name}</h3>
        <ul className="mt-3 flex flex-col gap-1 text-sm text-brown-700">
          <li>
            <strong className="text-brown-800">Faixa etária:</strong> {displayed.ageRange}
          </li>
          <li>
            <strong className="text-brown-800">Corte indicado:</strong> {displayed.cut}
          </li>
          <li>
            <strong className="text-brown-800">Como oferecer:</strong> {displayed.how}
          </li>
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {LOCKED_FOODS.map((food) => (
          <div
            key={food.key}
            className="relative flex flex-col items-center gap-1 rounded-2xl bg-cream-deep p-4 text-center"
          >
            <span className="text-3xl opacity-40 blur-[2px]">{food.emoji}</span>
            <span className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-brown-700/70">
              <Lock className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-sm font-medium text-brown-700/80">{food.name}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-brown-700/70">
        Este é apenas um exemplo. No acesso completo, cada alimento vem com a faixa etária, o corte indicado e o
        modo de oferecer.
      </p>
    </section>
  );
}
