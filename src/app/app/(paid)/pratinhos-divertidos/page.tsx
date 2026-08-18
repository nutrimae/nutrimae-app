"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Heart, Plus, Share2, Star, Sparkles } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { useToast } from "@/components/toast-provider";
import { ageInMonths } from "@/lib/age";
import { AGE_BAND_LABEL, ageBandForMonths, type AgeBand } from "@/lib/menu";
import { BackButton } from "@/components/back-button";
import { PRATINHOS, TOTAL_PRATINHOS, type Pratinho } from "@/lib/pratinhos";
import {
  addPratinhoToCardapio,
  getChosenPratinhoIds,
  getFavoritePratinhoIds,
  getPratinhoRatings,
  setPratinhoRating,
  toggleFavoritePratinho,
} from "@/lib/pratinhos-saved";

const AGE_BANDS: AgeBand[] = ["6-7", "8-9", "10-12", "13-24"];

export default function PratinhosDivertidosPage() {
  const { activeBaby } = useActiveBaby();
  const { showToast } = useToast();
  const months = activeBaby ? ageInMonths(activeBaby.birth_date) : 0;
  const babyBand = useMemo(() => ageBandForMonths(months), [months]);

  const [ageBand, setAgeBand] = useState<AgeBand | "todas">(activeBaby ? babyBand : "todas");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [chosenIds, setChosenIds] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    setFavoriteIds(getFavoritePratinhoIds());
    setChosenIds(getChosenPratinhoIds());
    setRatings(getPratinhoRatings());
  }, []);

  const results = useMemo(
    () => PRATINHOS.filter((p) => ageBand === "todas" || p.ageBand === ageBand),
    [ageBand],
  );

  function handleFavorite(id: string) {
    setFavoriteIds(toggleFavoritePratinho(id));
  }

  function handleAddToCardapio(pratinho: Pratinho) {
    setChosenIds(addPratinhoToCardapio(pratinho.id));
    showToast(`${pratinho.title} adicionado às suas escolhas do Cardápio`);
  }

  function handleShoppingList(pratinho: Pratinho) {
    const lines = [
      `🛒 Lista de compras — ${pratinho.title}`,
      "",
      ...pratinho.ingredients.map((i) => `• ${i}`),
      "",
      "Gerada em NutriMãe 💚",
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleShare(pratinho: Pratinho) {
    const lines = [
      `🍽️ ${pratinho.title}`,
      "",
      "Ingredientes:",
      ...pratinho.ingredients.map((i) => `• ${i}`),
      "",
      "Modo de preparo:",
      ...pratinho.steps.map((s, i) => `${i + 1}. ${s}`),
      "",
      "Pratinho do NutriMãe 💚",
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleRate(id: string, value: number) {
    setRatings(setPratinhoRating(id, value));
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Pratinhos Divertidos</h1>
        <p className="mt-1 text-sm text-brown-700/70">
          {TOTAL_PRATINHOS} ideias de apresentação colorida para deixar a refeição mais convidativa.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setAgeBand("todas")}
          className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
            ageBand === "todas" ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
          }`}
        >
          Todas as idades
        </button>
        {AGE_BANDS.map((band) => (
          <button
            key={band}
            type="button"
            onClick={() => setAgeBand(band)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
              ageBand === band ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
            }`}
          >
            {AGE_BAND_LABEL[band].split(" · ")[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {results.map((pratinho) => {
          const isExpanded = expandedId === pratinho.id;
          const isFavorite = favoriteIds.includes(pratinho.id);
          const isChosen = chosenIds.includes(pratinho.id);
          const canUseNow = babyBand === pratinho.ageBand;
          const rating = ratings[pratinho.id] ?? 0;

          return (
            <div
              key={pratinho.id}
              className={`flex flex-col gap-2 rounded-2xl bg-white/80 p-3 shadow-sm shadow-brown-900/5 ${
                isExpanded ? "col-span-2" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="font-heading text-sm font-bold leading-tight text-brown-800">
                  {pratinho.title}
                </p>
                <button type="button" onClick={() => handleFavorite(pratinho.id)} className="shrink-0">
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? "text-terracotta-500" : "text-brown-700/30"}`}
                    strokeWidth={2}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {pratinho.colors.map((c) => (
                  <span key={c} className="rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-semibold text-sage-700">
                    {c}
                  </span>
                ))}
              </div>

              <p className="flex items-center gap-1 text-xs text-brown-700/60">
                <Clock className="h-3 w-3" strokeWidth={2} />
                {pratinho.prepTimeMinutes} min
              </p>

              {canUseNow && (
                <span className="w-fit rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-600">
                  Pode usar nessa faixa
                </span>
              )}

              {isExpanded && (
                <div className="flex flex-col gap-3 border-t border-sage-100 pt-3">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-sage-600">
                      Ingredientes
                    </p>
                    <ul className="flex flex-col gap-1">
                      {pratinho.ingredients.map((ing) => (
                        <li key={ing} className="text-sm text-brown-800">
                          • {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-sage-600">
                      Modo de preparo
                    </p>
                    <ol className="flex flex-col gap-1">
                      {pratinho.steps.map((step, i) => (
                        <li key={step} className="text-sm text-brown-800">
                          {i + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" onClick={() => handleRate(pratinho.id, value)}>
                        <Star
                          className={`h-5 w-5 ${value <= rating ? "text-yellow-500" : "text-brown-700/20"}`}
                          strokeWidth={1.75}
                          fill={value <= rating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCardapio(pratinho)}
                    disabled={isChosen}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary-500 text-sm font-semibold text-white disabled:bg-primary-200"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    {isChosen ? "Já está nas suas escolhas" : "Adicionar ao Cardápio"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShoppingList(pratinho)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
                  >
                    Gerar lista de compras
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(pratinho)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-sage-200 text-sm font-semibold text-sage-700"
                  >
                    <Share2 className="h-4 w-4" strokeWidth={2} />
                    Compartilhar no WhatsApp
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : pratinho.id)}
                className="mt-1 flex min-h-9 items-center justify-center gap-1 rounded-xl bg-sage-50 text-xs font-semibold text-sage-700"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                {isExpanded ? "Fechar" : "Usar Esta Ideia"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
