"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Share2, Star } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { UTENSIL_CATEGORY_LABEL, UTENSILS, type UtensilCategory } from "@/lib/utensils";

const CATEGORIES: UtensilCategory[] = ["hora-de-comer", "preparo", "armazenamento", "seguranca"];

export default function UtensiliosRecomendadosPage() {
  const [onlyEssential, setOnlyEssential] = useState(false);

  const list = useMemo(() => (onlyEssential ? UTENSILS.filter((u) => u.essential) : UTENSILS), [onlyEssential]);

  function handleShare() {
    const essentials = UTENSILS.filter((u) => u.essential);
    const lines = [
      "🧺 Utensílios essenciais para a introdução alimentar",
      "",
      ...essentials.map((u) => `• ${u.emoji} ${u.name}`),
      "",
      "Lista completa no NutriMãe 💚",
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Utensílios Recomendados</h1>
        <p className="mt-1 text-brown-700">
          O que realmente ajuda na rotina da introdução alimentar — e o que procurar na hora de comprar.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOnlyEssential(false)}
          className={`min-h-10 flex-1 rounded-full text-sm font-semibold transition-colors ${
            !onlyEssential ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
          }`}
        >
          Todos ({UTENSILS.length})
        </button>
        <button
          type="button"
          onClick={() => setOnlyEssential(true)}
          className={`min-h-10 flex-1 rounded-full text-sm font-semibold transition-colors ${
            onlyEssential ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
          }`}
        >
          <Star className="mr-1 inline h-3.5 w-3.5" strokeWidth={2} fill="currentColor" />
          Essenciais
        </button>
      </div>

      {CATEGORIES.map((cat) => {
        const items = list.filter((u) => u.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
              {UTENSIL_CATEGORY_LABEL[cat]}
            </h2>
            <div className="flex flex-col gap-2">
              {items.map((u) => (
                <div key={u.id} className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
                  <div className="flex items-start gap-3">
                    {u.imageUrl ? (
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sage-50">
                        <Image
                          src={u.imageUrl}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl">{u.emoji}</span>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-brown-800">{u.name}</p>
                        {u.essential && (
                          <Star className="h-3.5 w-3.5 shrink-0 text-yellow-500" strokeWidth={2} fill="currentColor" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-brown-700">{u.why}</p>
                      <div className="mt-2 flex items-start gap-2 rounded-xl bg-sage-50 p-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-600" strokeWidth={2} />
                        <p className="text-xs text-brown-700">
                          <span className="font-semibold">O que procurar: </span>
                          {u.whatToLookFor}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <button
        type="button"
        onClick={handleShare}
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
      >
        <Share2 className="h-4 w-4" strokeWidth={2} />
        Compartilhar lista de essenciais
      </button>

      <MedicalDisclaimerFooter />
    </main>
  );
}
