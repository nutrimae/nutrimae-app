"use client";

import { useMemo, useState } from "react";
import { Search, AlertTriangle, X, Snowflake, Sun } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { ageInMonths } from "@/lib/age";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { ageBandForMonths, AGE_BAND_LABEL } from "@/lib/menu";
import { searchFoods, type FoodItem } from "@/lib/foods";
import { getFoodPrepGuide } from "@/lib/food-prep";
import { BackButton } from "@/components/back-button";

export default function BuscaPage() {
  const { activeBaby } = useActiveBaby();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const months = activeBaby ? ageInMonths(activeBaby.birth_date) : 0;
  const ageBand = useMemo(() => ageBandForMonths(months), [months]);

  const results = useMemo(() => searchFoods(query), [query]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Buscar corte seguro
        </h1>
        {activeBaby && (
          <p className="mt-1 text-sm text-brown-700/70">
            Mostrando cortes para {activeBaby.name} · {AGE_BAND_LABEL[ageBand]}
          </p>
        )}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-sage-400"
          strokeWidth={2}
        />
        <input
          autoFocus
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Buscar alimento (ex: uva, cenoura, frango)"
          className="min-h-16 w-full rounded-2xl border-2 border-sage-100 bg-white pl-12 pr-12 text-lg text-brown-800 placeholder:text-brown-700/40 outline-none focus:border-sage-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelected(null);
            }}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-sage-50"
          >
            <X className="h-5 w-5 text-brown-700/60" strokeWidth={2} />
          </button>
        )}
      </div>

      {selected ? (
        <FoodDetail food={selected} ageBand={ageBand} onBack={() => setSelected(null)} />
      ) : query ? (
        results.length > 0 ? (
          <div className="flex flex-col gap-2">
            {results.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => setSelected(food)}
                className="flex min-h-16 items-center gap-4 rounded-2xl bg-white/80 px-4 text-left shadow-sm shadow-brown-900/5 active:bg-sage-50"
              >
                <span className="text-3xl">{food.emoji}</span>
                <span className="font-heading text-lg font-bold text-brown-800">
                  {food.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-center text-brown-700/70">
            Não encontramos &ldquo;{query}&rdquo; ainda. Em caso de dúvida sobre um
            alimento novo, converse com o pediatra do seu bebê.
          </p>
        )
      ) : (
        <p className="mt-4 text-center text-brown-700/70">
          Digite o nome de um alimento para ver o corte recomendado.
        </p>
      )}

      <MedicalDisclaimerFooter />
    </main>
  );
}

function FoodDetail({
  food,
  ageBand,
  onBack,
}: {
  food: FoodItem;
  ageBand: keyof FoodItem["cuts"];
  onBack: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-sm shadow-brown-900/5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 min-h-10 text-sm font-semibold text-sage-600"
      >
        ← Voltar aos resultados
      </button>

      <div className="flex items-center gap-4">
        <span className="text-5xl">{food.emoji}</span>
        <p className="font-heading text-2xl font-bold text-brown-800">{food.name}</p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-sage-600">
          Corte recomendado · {AGE_BAND_LABEL[ageBand]}
        </p>
        <p className="mt-1 text-lg text-brown-800">{food.cuts[ageBand]}</p>
      </div>

      {food.warning && (
        <div className="mt-5 flex gap-3 rounded-2xl bg-terracotta-500/10 p-4">
          <AlertTriangle
            className="h-6 w-6 shrink-0 text-terracotta-600"
            strokeWidth={2}
          />
          <p className="text-brown-800">{food.warning}</p>
        </div>
      )}

      <FoodPrepSection foodId={food.id} />
    </div>
  );
}

function FoodPrepSection({ foodId }: { foodId: string }) {
  const guide = getFoodPrepGuide(foodId);
  if (!guide) return null;

  return (
    <div className="mt-6 border-t border-sage-100 pt-5">
      <p className="mb-3 font-heading text-lg font-bold text-brown-800">Modo de preparo completo</p>

      <ol className="flex flex-col gap-3">
        {guide.steps.map((step, i) => (
          <li key={step.action} className="rounded-2xl bg-sage-50 p-4">
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-500 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="font-semibold text-brown-800">{step.action}</p>
            </div>
            <p className="mt-2 pl-10 text-sm text-brown-700">
              <span className="font-semibold text-sage-700">Por quê: </span>
              {step.why}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-3 rounded-2xl bg-primary-100 p-4">
          <Snowflake className="h-5 w-5 shrink-0 text-primary-600" strokeWidth={2} />
          <div>
            <p className="font-semibold text-brown-800">Congelamento</p>
            <p className="mt-0.5 text-sm text-brown-700">{guide.freezing}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-2xl bg-peach-100 p-4">
          <Sun className="h-5 w-5 shrink-0 text-terracotta-600" strokeWidth={2} />
          <div>
            <p className="font-semibold text-brown-800">Descongelamento</p>
            <p className="mt-0.5 text-sm text-brown-700">{guide.thawing}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
