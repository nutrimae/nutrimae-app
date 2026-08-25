"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, ChefHat, Heart, Share2, Star, AlertTriangle } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { ListenButton } from "@/components/listen-button";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { AGE_BAND_LABEL } from "@/lib/menu";
import { ALLERGEN_LABEL, RECIPE_MEAL_TYPE_LABEL, RECIPES } from "@/lib/recipes";
import {
  getFavoriteRecipeIds,
  getRecipeRatings,
  setRecipeRating,
  toggleFavoriteRecipe,
} from "@/lib/recipe-favorites";
import { getAllergenChecklist } from "@/lib/allergen-checklist";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const recipe = RECIPES.find((r) => r.id === params.id);
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);

  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [checklistAllergens, setChecklistAllergens] = useState<Awaited<ReturnType<typeof getAllergenChecklist>>>([]);

  useEffect(() => {
    if (!recipe) return;
    setIsFavorite(getFavoriteRecipeIds().includes(recipe.id));
    setRating(getRecipeRatings()[recipe.id] ?? 0);
    if (activeBaby) getAllergenChecklist(supabase, activeBaby.id).then(setChecklistAllergens);
  }, [recipe, activeBaby, supabase]);

  if (!recipe) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <BackButton fallbackHref="/app/receitas" />
        <p>Receita não encontrada.</p>
      </main>
    );
  }

  function handleShare() {
    if (!recipe) return;
    const lines = [
      `🍽️ ${recipe.title}`,
      "",
      "Ingredientes:",
      ...recipe.ingredients.map((i) => `• ${i}`),
      "",
      "Modo de preparo:",
      ...recipe.steps.map((s, i) => `${i + 1}. ${s}`),
      "",
      "Receita do NutriMãe 💚",
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function handleToggleFavorite() {
    if (!recipe) return;
    const next = toggleFavoriteRecipe(recipe.id);
    setIsFavorite(next.includes(recipe.id));
  }

  function handleRate(value: number) {
    if (!recipe) return;
    setRecipeRating(recipe.id, value);
    setRating(value);
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton fallbackHref="/app/receitas" />

      <div>
        <p className="text-sm font-semibold text-primary-600">
          {AGE_BAND_LABEL[recipe.ageBand].split(" · ")[0]} · {RECIPE_MEAL_TYPE_LABEL[recipe.mealType]}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-brown-800">{recipe.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-brown-700/90">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" strokeWidth={2} />
            {recipe.prepTimeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" strokeWidth={2} />
            {recipe.difficulty === "facil" ? "Fácil" : "Médio"}
          </span>
        </div>
      </div>

      {recipe.allergens.length > 0 && (
        <div
          className={`flex items-start gap-2 rounded-2xl p-3 ${
            recipe.allergens.some((a) => checklistAllergens.includes(a)) ? "bg-red-100" : "bg-yellow-100"
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 shrink-0 ${
              recipe.allergens.some((a) => checklistAllergens.includes(a)) ? "text-red-600" : "text-yellow-700"
            }`}
            strokeWidth={2}
          />
          <p className="text-sm text-brown-800">
            {recipe.allergens.some((a) => checklistAllergens.includes(a)) ? (
              <span className="font-semibold text-red-700">
                Contém item do seu checklist de alergênicos.{" "}
              </span>
            ) : null}
            Contém: {recipe.allergens.map((a) => ALLERGEN_LABEL[a]).join(", ")}. Só ofereça se já
            tiver testado cada um desses alimentos individualmente antes.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors ${
            isFavorite ? "bg-terracotta-500 text-white" : "bg-white/80 text-brown-700 shadow-sm shadow-brown-900/5"
          }`}
        >
          <Heart className="h-5 w-5" strokeWidth={2} fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Salva" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
        >
          <Share2 className="h-5 w-5" strokeWidth={2} />
          WhatsApp
        </button>
      </div>

      <div className="flex items-center justify-center gap-1 rounded-2xl bg-white/80 py-3 shadow-sm shadow-brown-900/5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => handleRate(value)} className="p-1">
            <Star
              className={`h-6 w-6 ${value <= rating ? "text-yellow-500" : "text-brown-700/20"}`}
              strokeWidth={1.75}
              fill={value <= rating ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">Ingredientes</h2>
        <ul className="flex flex-col gap-2">
          {recipe.ingredients.map((ingredient) => (
            <li
              key={ingredient}
              className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm shadow-brown-900/5"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-sage-500" />
              <span className="text-brown-800">{ingredient}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">Modo de preparo</h2>
        <ol className="flex flex-col gap-3">
          {recipe.steps.map((step, i) => (
            <li key={step} className="flex gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-500 font-heading font-bold text-white">
                {i + 1}
              </span>
              <p className="text-brown-800">{step}</p>
            </li>
          ))}
        </ol>

        <ListenButton
          contentType="recipe"
          contentId={recipe.id}
          text={[
            `${recipe.title}.`,
            `Ingredientes: ${recipe.ingredients.join(", ")}.`,
            "Modo de preparo:",
            ...recipe.steps.map((s, i) => `Passo ${i + 1}: ${s}`),
          ].join(" ")}
          className="mt-3"
        />
      </section>
    </main>
  );
}
