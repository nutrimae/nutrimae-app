"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, RefreshCw, Salad } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { ageInMonths } from "@/lib/age";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { BalancedPlate } from "@/components/balanced-plate";
import {
  AGE_BAND_LABEL,
  ageBandForMonths,
  allergenForDietFilter,
  DAYS,
  DIET_FILTER_LABEL,
  MEAL_TYPES,
  getSuggestion,
  poolSize,
  slugifyIngredient,
  todayDayIndex,
  type DietFilter,
  type MealType,
} from "@/lib/menu";

export default function CardapioPage() {
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);

  const [dayIndex, setDayIndex] = useState(() => todayDayIndex());
  const [expanded, setExpanded] = useState<MealType | null>(null);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const [hasDiario, setHasDiario] = useState(false);
  const [hasRestricao, setHasRestricao] = useState(false);
  const [triedFoodKeys, setTriedFoodKeys] = useState<Set<string>>(new Set());
  const [dietFilter, setDietFilter] = useState<DietFilter>("padrao");

  const months = activeBaby ? ageInMonths(activeBaby.birth_date) : 0;
  const ageBand = useMemo(() => ageBandForMonths(months), [months]);

  useEffect(() => {
    if (!activeBaby) return;
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const [productsRes, foodLogRes] = await Promise.all([
        supabase
          .from("user_products")
          .select("product_id, status")
          .eq("user_id", user.id)
          .in("product_id", ["diario_bebe", "restricao_alimentar"]),
        supabase.from("food_log").select("food_key").eq("baby_id", activeBaby!.id),
      ]);

      if (cancelled) return;

      const active = new Set(
        (productsRes.data ?? []).filter((p) => p.status === "active").map((p) => p.product_id),
      );
      setHasDiario(active.has("diario_bebe"));
      setHasRestricao(active.has("restricao_alimentar"));
      setTriedFoodKeys(new Set((foodLogRes.data ?? []).map((r) => r.food_key)));
      setDietFilter((activeBaby!.diet_filter as DietFilter) ?? "padrao");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeBaby, supabase]);

  async function handleDietFilterChange(filter: DietFilter) {
    setDietFilter(filter);
    setOverrides({});
    if (activeBaby) {
      await supabase.from("babies").update({ diet_filter: filter }).eq("id", activeBaby.id);
    }
  }

  if (!activeBaby) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando o cardápio...</p>
      </main>
    );
  }

  const avoidAllergen = hasRestricao ? allergenForDietFilter(dietFilter) : null;
  const suggestionOptions = {
    triedFoodKeys: hasDiario ? triedFoodKeys : undefined,
    avoidAllergen,
  };

  function overrideKey(mealType: MealType) {
    return `${dayIndex}-${mealType}-${dietFilter}`;
  }

  function handleSwap(mealType: MealType) {
    const key = overrideKey(mealType);
    const size = poolSize(ageBand, mealType);
    const current = overrides[key] ?? dayIndex % size;
    setOverrides((prev) => ({ ...prev, [key]: (current + 1) % size }));
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Cardápio da semana</h1>
        <p className="mt-1 text-sm text-brown-700/70">{AGE_BAND_LABEL[ageBand]}</p>
        {hasDiario && (
          <p className="mt-1 text-sm text-sage-600">
            Priorizando sabores que {activeBaby.name.split(" ")[0]} ainda não provou ✨
          </p>
        )}
      </div>

      {hasRestricao && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(DIET_FILTER_LABEL) as DietFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleDietFilterChange(filter)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                filter === dietFilter
                  ? "bg-terracotta-500 text-white"
                  : "bg-peach-100 text-brown-700"
              }`}
            >
              {DIET_FILTER_LABEL[filter]}
            </button>
          ))}
        </div>
      )}

      {hasRestricao && dietFilter !== "padrao" && (
        <Link
          href="/app/cardapio/substituicoes"
          className="flex min-h-14 items-center gap-3 rounded-2xl bg-sage-50 px-4 text-sage-700"
        >
          <Salad className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="text-sm font-semibold">Ver guia de substituições</span>
        </Link>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day, i) => (
          <button
            key={day.key}
            type="button"
            onClick={() => {
              setDayIndex(i);
              setExpanded(null);
            }}
            className={`min-h-12 shrink-0 rounded-2xl px-4 text-base font-semibold transition-colors ${
              i === dayIndex
                ? "bg-sage-500 text-white"
                : "bg-sage-50 text-brown-700/70 active:bg-sage-100"
            }`}
          >
            {day.short}
          </button>
        ))}
      </div>

      <p className="text-center font-heading text-lg font-bold text-brown-800">
        {DAYS[dayIndex].label}
      </p>

      <div className="flex flex-col gap-3">
        {MEAL_TYPES.map(({ key: mealType, label }) => {
          const key = overrideKey(mealType);
          const suggestion = getSuggestion(ageBand, mealType, dayIndex, {
            overrideIndex: overrides[key],
            ...suggestionOptions,
          });
          const isOpen = expanded === mealType;

          return (
            <div
              key={mealType}
              className="overflow-hidden rounded-3xl bg-white/80 shadow-sm shadow-brown-900/5"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : mealType)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-sage-600">
                    {label}
                  </p>
                  <p className="mt-1 font-heading text-lg font-bold text-brown-800">
                    {suggestion.title}
                  </p>
                  {!isOpen && (
                    <p className="mt-1 text-sm text-brown-700/70">{suggestion.description}</p>
                  )}
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-sage-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={2}
                />
              </button>

              {isOpen && (
                <div className="border-t border-sage-100 px-5 pb-5 pt-4">
                  <p className="text-sm font-semibold text-brown-700">Modo de preparo</p>
                  <p className="mt-1 text-brown-700">{suggestion.prep}</p>

                  <p className="mt-4 text-sm font-semibold text-brown-700">Ingredientes</p>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {suggestion.ingredients.map((ing) => (
                      <li
                        key={ing.name}
                        className={`rounded-full px-3 py-1 text-sm ${
                          hasDiario && !triedFoodKeys.has(slugifyIngredient(ing.name))
                            ? "bg-sage-100 text-sage-700"
                            : "bg-peach-100 text-brown-800"
                        }`}
                      >
                        {ing.name}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleSwap(mealType)}
                    className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sage-50 text-base font-semibold text-sage-700 active:bg-sage-100"
                  >
                    <RefreshCw className="h-4 w-4" strokeWidth={2} />
                    Trocar sugestão
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BalancedPlate triedFoodKeys={hasDiario ? triedFoodKeys : undefined} />

      <MedicalDisclaimerFooter />
    </main>
  );
}
