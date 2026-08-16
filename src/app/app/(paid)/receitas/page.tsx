"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, ChefHat, Heart } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { ageInMonths } from "@/lib/age";
import { AGE_BAND_LABEL, ageBandForMonths, type AgeBand } from "@/lib/menu";
import { BackButton } from "@/components/back-button";
import {
  RECIPE_MEAL_TYPE_LABEL,
  searchRecipes,
  TOTAL_RECIPES,
  type RecipeMealType,
} from "@/lib/recipes";
import { getFavoriteRecipeIds } from "@/lib/recipe-favorites";

const MEAL_TYPES: RecipeMealType[] = ["cafe", "almoco", "lanche", "ceia"];
const AGE_BANDS: AgeBand[] = ["6-7", "8-9", "10-12", "13-24"];

export default function ReceitasPage() {
  const { activeBaby } = useActiveBaby();
  const months = activeBaby ? ageInMonths(activeBaby.birth_date) : 0;
  const babyBand = useMemo(() => ageBandForMonths(months), [months]);

  const [query, setQuery] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand | "todas">(activeBaby ? babyBand : "todas");
  const [mealType, setMealType] = useState<RecipeMealType | "todas">("todas");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteRecipeIds());
  }, []);

  const results = useMemo(() => {
    const base = searchRecipes({
      query,
      ageBand: ageBand === "todas" ? undefined : ageBand,
      mealType: mealType === "todas" ? undefined : mealType,
    });
    return onlyFavorites ? base.filter((r) => favoriteIds.includes(r.id)) : base;
  }, [query, ageBand, mealType, onlyFavorites, favoriteIds]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Receitas</h1>
        <p className="mt-1 text-sm text-brown-700/70">
          {TOTAL_RECIPES} receitas para os 6 aos 24 meses, com modo de preparo completo.
        </p>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-sage-400"
          strokeWidth={2}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou ingrediente"
          className="min-h-14 w-full rounded-xl border-2 border-sage-100 bg-white pl-12 pr-4 text-base text-brown-800 outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_var(--color-primary-glow)]"
        />
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

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setMealType("todas")}
          className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
            mealType === "todas" ? "bg-primary-500 text-white" : "bg-primary-100 text-brown-700"
          }`}
        >
          Todas as refeições
        </button>
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setMealType(type)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
              mealType === type ? "bg-primary-500 text-white" : "bg-primary-100 text-brown-700"
            }`}
          >
            {RECIPE_MEAL_TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOnlyFavorites((v) => !v)}
        className={`flex min-h-11 w-fit items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
          onlyFavorites ? "bg-terracotta-500 text-white" : "bg-white/80 text-brown-700 shadow-sm shadow-brown-900/5"
        }`}
      >
        <Heart className="h-4 w-4" strokeWidth={2} fill={onlyFavorites ? "currentColor" : "none"} />
        Só salvas
      </button>

      {results.length === 0 ? (
        <p className="py-8 text-center text-brown-700/60">
          Nenhuma receita encontrada com esses filtros.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/app/receitas/${recipe.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5 active:bg-sage-50"
            >
              <div className="flex-1">
                <p className="font-heading font-bold text-brown-800">{recipe.title}</p>
                <p className="mt-0.5 text-xs text-brown-700/60">
                  {AGE_BAND_LABEL[recipe.ageBand].split(" · ")[0]} · {RECIPE_MEAL_TYPE_LABEL[recipe.mealType]}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-brown-700/60">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                    {recipe.prepTimeMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="h-3.5 w-3.5" strokeWidth={2} />
                    {recipe.difficulty === "facil" ? "Fácil" : "Médio"}
                  </span>
                </div>
              </div>
              {favoriteIds.includes(recipe.id) && (
                <Heart className="h-5 w-5 shrink-0 text-terracotta-500" strokeWidth={2} fill="currentColor" />
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
