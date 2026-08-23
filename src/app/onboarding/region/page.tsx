"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { REGIONS, type Region } from "@/lib/regions";

export default function RegionStepPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<Region | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) {
      router.push("/onboarding/tour");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").update({ region: selected }).eq("user_id", user.id);
    }

    setLoading(false);
    router.push("/onboarding/tour");
  }

  return (
    <main
      className="flex min-h-dvh flex-col justify-between px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="mx-auto w-full max-w-sm flex-1">
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          De qual região do Brasil vocês são?
        </h1>
        <p className="mt-2 text-sm text-brown-700/70">
          Assim priorizamos alimentos e receitas da sua região. Totalmente opcional!
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {REGIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setSelected(selected === r.key ? null : r.key)}
              className={`flex min-h-14 items-center gap-3 rounded-2xl px-5 text-left text-lg font-semibold transition-colors ${
                selected === r.key
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-white/80 text-brown-800 shadow-sm shadow-brown-900/5"
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-sm">
        <ProgressDots step={4} total={6} />
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={handleContinue} disabled={loading} variant="brand">
            {loading ? "Salvando..." : selected ? "Continuar" : "Pular"}
          </Button>
        </div>
      </div>
    </main>
  );
}
