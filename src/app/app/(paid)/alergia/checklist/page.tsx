"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChefHat } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { ALLERGEN_CHECKLIST, ALLERGEN_LABEL, getAllergenChecklist, toggleAllergenChecklist } from "@/lib/allergen-checklist";
import type { Allergen } from "@/lib/recipes";

export default function AllergenChecklistPage() {
  const [selected, setSelected] = useState<Allergen[]>([]);

  useEffect(() => {
    setSelected(getAllergenChecklist());
  }, []);

  function handleToggle(id: Allergen) {
    setSelected(toggleAllergenChecklist(id));
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton fallbackHref="/app/alergia" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Checklist de alergênicos
        </h1>
        <p className="mt-1 text-brown-700">
          Marque os alimentos aos quais o seu bebê já reagiu ou que o pediatra pediu para
          evitar. As receitas passam a esconder automaticamente qualquer item marcado.
        </p>
      </div>

      {selected.length > 0 && (
        <Link
          href="/app/receitas"
          className="flex items-center gap-3 rounded-2xl bg-primary-100 p-4 text-primary-600"
        >
          <ChefHat className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="font-semibold">
            Ver receitas sem {selected.length === 1 ? "esse alérgeno" : `esses ${selected.length} alérgenos`}
          </span>
        </Link>
      )}

      <div className="flex flex-col gap-2">
        {ALLERGEN_CHECKLIST.map((item) => {
          const isChecked = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              className={`flex items-start gap-3 rounded-2xl p-4 text-left shadow-sm shadow-brown-900/5 transition-colors ${
                isChecked ? "bg-terracotta-500/10" : "bg-white/80"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isChecked ? "border-terracotta-500 bg-terracotta-500" : "border-sage-200 bg-white"
                }`}
              >
                {isChecked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </span>
              <div>
                <p className={`font-semibold ${isChecked ? "text-terracotta-700" : "text-brown-800"}`}>
                  {ALLERGEN_LABEL[item.id]}
                </p>
                <p className="mt-0.5 text-sm text-brown-700/80">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <MedicalDisclaimerFooter />
    </main>
  );
}
