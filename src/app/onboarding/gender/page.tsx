"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import type { BabyGender } from "@/lib/types";

export default function GenderStepPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState<BabyGender | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(gender: BabyGender) {
    setError(null);
    const babyId = sessionStorage.getItem("nutrimae_onboarding_baby_id");
    if (!babyId) {
      router.push("/onboarding/photo");
      return;
    }

    setSaving(gender);
    const { error: updateError } = await supabase
      .from("babies")
      .update({ gender })
      .eq("id", babyId);

    setSaving(null);

    if (updateError) {
      setError("Não deu para salvar agora. Tente de novo.");
      return;
    }

    router.push("/onboarding/photo");
  }

  return (
    <main className="flex min-h-dvh flex-col justify-between px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="mx-auto w-full max-w-sm flex-1">
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Seu bebê é menino ou menina?
        </h1>
        <p className="mt-2 text-sm text-brown-700/70">
          Usamos isso só para deixar o app com as cores do seu jeitinho.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleSelect("female")}
            disabled={saving !== null}
            className="flex min-h-24 items-center gap-4 rounded-3xl border-2 border-pink-200/60 bg-gradient-to-r from-pink-50 to-white px-6 text-left shadow-subtle transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            <span className="text-4xl">👧</span>
            <div>
              <p className="font-heading text-lg font-bold text-brown-800">Menina</p>
              <p className="text-xs text-brown-700/60">Tema em tons de rosa</p>
            </div>
            {saving === "female" && (
              <span className="ml-auto text-xs font-semibold text-brown-700/50">Salvando...</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelect("male")}
            disabled={saving !== null}
            className="flex min-h-24 items-center gap-4 rounded-3xl border-2 border-sky-200/60 bg-gradient-to-r from-sky-50 to-white px-6 text-left shadow-subtle transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            <span className="text-4xl">👦</span>
            <div>
              <p className="font-heading text-lg font-bold text-brown-800">Menino</p>
              <p className="text-xs text-brown-700/60">Tema em tons de azul</p>
            </div>
            {saving === "male" && (
              <span className="ml-auto text-xs font-semibold text-brown-700/50">Salvando...</span>
            )}
          </button>
        </div>

        {error && (
          <div className="animate-scale-in mt-4 rounded-xl bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 w-full max-w-sm">
        <ProgressDots step={2} total={5} />
      </div>
    </main>
  );
}
