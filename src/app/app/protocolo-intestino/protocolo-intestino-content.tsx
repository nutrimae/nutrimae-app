"use client";

import { Clock, Salad } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { STOOL_LIGHT_CATEGORIES, LAXATIVE_RECIPES } from "@/lib/intestino";

const CATEGORY_STYLES: Record<
  string,
  { card: string; chip: string; badge?: string }
> = {
  prendem: { card: "bg-red-50 border border-red-100", chip: "bg-white text-red-700" },
  neutros: { card: "bg-amber-50 border border-amber-100", chip: "bg-white text-amber-700" },
  soltam: {
    card: "bg-green-50 border border-green-100",
    chip: "bg-white text-green-700",
    badge: "bg-green-600 text-white",
  },
};

export function ProtocoloIntestinoContent() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-7 px-4 py-6">
      <BackButton fallbackHref="/app/vip" />

      {/* Hero */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-100">
          <Salad className="h-7 w-7 text-sage-600" strokeWidth={1.75} />
        </div>
        <h1 className="font-heading text-xl font-bold text-brown-800">
          Alívio rápido e natural para o intestino do seu bebê.
        </h1>
        <p className="max-w-[28ch] text-sm text-brown-700/70">
          Saiba o que oferecer agora e o que evitar até o intestino voltar ao normal.
        </p>
      </div>

      {/* Semáforo do Cocô */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-bold text-brown-800">O Semáforo do Cocô</h2>
        <div className="flex flex-col gap-3">
          {STOOL_LIGHT_CATEGORIES.map((category) => {
            const style = CATEGORY_STYLES[category.key];
            return (
              <div key={category.key} className={`rounded-2xl p-4 ${style.card}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{category.emoji}</span>
                  <p className="font-heading text-sm font-bold text-brown-800">{category.title}</p>
                  {style.badge && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>
                      SOS
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-brown-700/60">{category.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {category.foods.map((food) => (
                    <span
                      key={food.name}
                      className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm shadow-brown-900/5 ${style.chip}`}
                    >
                      {food.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* As 5 Receitas Laxativas */}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-bold text-brown-800">As 5 Receitas Laxativas</h2>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {LAXATIVE_RECIPES.map((recipe) => (
            <article
              key={recipe.id}
              className="flex w-[240px] shrink-0 snap-start flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm shadow-brown-900/5"
            >
              <p className="font-heading text-sm font-bold leading-tight text-brown-800">{recipe.title}</p>
              <span className="flex w-fit items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 text-[11px] font-semibold text-sage-600">
                <Clock className="h-3 w-3" strokeWidth={2} />
                {recipe.prepMinutes} min
              </span>
              <ul className="flex flex-col gap-1 text-xs text-brown-700/70">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="flex gap-1.5">
                    <span className="text-sage-500">•</span>
                    {ingredient}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs leading-relaxed text-brown-700/60">{recipe.steps}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="text-center text-[11px] leading-relaxed text-brown-700/40">
        Este conteúdo é educativo e não substitui orientação de um pediatra, especialmente em
        casos de constipação persistente ou dor.
      </p>
    </main>
  );
}
