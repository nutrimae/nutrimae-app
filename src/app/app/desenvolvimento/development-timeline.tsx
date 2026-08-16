"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Lock } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { ageInMonths } from "@/lib/age";
import { TOTAL_DIARY_FOODS } from "@/lib/food-diary";
import { BackButton } from "@/components/back-button";

interface Stage {
  fromMonth: number;
  toMonth: number;
  title: string;
  description: string;
  showFoodCounter?: boolean;
}

const STAGES: Stage[] = [
  {
    fromMonth: 6,
    toMonth: 6,
    title: "Introdução alimentar começa",
    description: "Primeiro contato com alimento sólido, além do leite.",
  },
  {
    fromMonth: 7,
    toMonth: 7,
    title: "Primeiros sabores",
    description: "Explorando frutas e legumes, um de cada vez.",
    showFoodCounter: true,
  },
  {
    fromMonth: 8,
    toMonth: 8,
    title: "Texturas diferentes",
    description: "Alimentos com mais consistência, amassados grosseiramente.",
  },
  {
    fromMonth: 9,
    toMonth: 12,
    title: "Exploração ampla",
    description: "Maior variedade de proteínas, cereais e temperos leves.",
  },
  {
    fromMonth: 13,
    toMonth: 18,
    title: "Autonomia na refeição",
    description: "Come sozinho(a), usa talheres, mais independência à mesa.",
  },
  {
    fromMonth: 19,
    toMonth: 24,
    title: "Refeição em família",
    description: "Compartilha (quase) a mesma comida da família, em pedaços.",
  },
];

function statusFor(currentMonths: number, stage: Stage): "done" | "current" | "locked" {
  if (currentMonths > stage.toMonth) return "done";
  if (currentMonths >= stage.fromMonth) return "current";
  return "locked";
}

export function DevelopmentTimeline() {
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);
  const [triedCount, setTriedCount] = useState(0);

  useEffect(() => {
    if (!activeBaby) return;
    let cancelled = false;

    supabase
      .from("food_log")
      .select("food_key", { count: "exact", head: true })
      .eq("baby_id", activeBaby.id)
      .then(({ count }) => {
        if (!cancelled) setTriedCount(count ?? 0);
      });

    return () => {
      cancelled = true;
    };
  }, [activeBaby, supabase]);

  if (!activeBaby) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando...</p>
      </main>
    );
  }

  const currentMonths = ageInMonths(activeBaby.birth_date);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Marcos do desenvolvimento
        </h1>
        <p className="mt-1 text-brown-700">
          A jornada alimentar de {activeBaby.name}, mês a mês.
        </p>
      </div>

      <ol className="flex flex-col gap-3 border-l-2 border-sage-200 pl-4">
        {STAGES.map((stage) => {
          const status = statusFor(currentMonths, stage);
          const label = stage.fromMonth === stage.toMonth
            ? `Mês ${stage.fromMonth}`
            : `Meses ${stage.fromMonth}–${stage.toMonth}`;

          return (
            <li
              key={stage.title}
              className={`-ml-[21px] rounded-2xl p-4 pl-6 ${
                status === "current"
                  ? "bg-primary-100"
                  : status === "done"
                    ? "bg-sage-50"
                    : "bg-white/60"
              }`}
            >
              <div className="flex items-center gap-2">
                {status === "done" && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-600" strokeWidth={2} />
                )}
                {status === "current" && (
                  <Clock className="h-5 w-5 shrink-0 text-primary-600" strokeWidth={2} />
                )}
                {status === "locked" && (
                  <Lock className="h-5 w-5 shrink-0 text-brown-700/40" strokeWidth={2} />
                )}
                <span className="text-xs font-bold uppercase tracking-wide text-brown-700/60">
                  {label}
                </span>
              </div>
              <p
                className={`mt-1 font-heading text-lg font-bold ${
                  status === "locked" ? "text-brown-700/50" : "text-brown-800"
                }`}
              >
                {stage.title}
              </p>
              <p className={`mt-0.5 text-sm ${status === "locked" ? "text-brown-700/40" : "text-brown-700"}`}>
                {stage.description}
              </p>
              {stage.showFoodCounter && status !== "locked" && (
                <p className="mt-2 text-sm font-semibold text-primary-600">
                  {triedCount} de {TOTAL_DIARY_FOODS} sabores provados
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
