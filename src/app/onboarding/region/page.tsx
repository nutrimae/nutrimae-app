"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { COUNTRIES, DEFAULT_COUNTRY, COUNTRY_TO_LATAM_REGION, type Country } from "@/lib/i18n/country";

const COPY = {
  title: "¿De qué país eres?",
  subtitle: "Así te mostramos precios, alimentos y recetas de tu país. Puedes cambiarlo después en tu perfil.",
  saving: "Guardando...",
  continue: "Continuar",
} as const;

export default function RegionStepPage() {
  const router = useRouter();
  const supabase = createClient();
  const t = COPY;
  // Pré-seleciona Chile (mercado já lançado) em vez de deixar vazio — country
  // importa pro checkout/precificação futuro, então este step sempre grava um
  // valor, sem opção de "Omitir" como o antigo step de região tinha.
  const [selected, setSelected] = useState<Country>(DEFAULT_COUNTRY);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Grava country (granularidade que interessa pro checkout) e, junto,
      // a latam_region correspondente — inferida a partir do país — pra não
      // perder a priorização de receitas/alimentos que já usa LatamRegion
      // (ver src/lib/i18n/country.ts, COUNTRY_TO_LATAM_REGION). Assim a
      // usuária responde uma pergunta só (o país, com bandeira).
      await supabase
        .from("profiles")
        .update({ country: selected, latam_region: COUNTRY_TO_LATAM_REGION[selected] })
        .eq("user_id", user.id);
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
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-brown-700/70">
          {t.subtitle}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {COUNTRIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelected(c.key)}
              className={`flex min-h-14 items-center gap-3 rounded-2xl px-5 text-left text-lg font-semibold transition-colors ${
                selected === c.key
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-white/80 text-brown-800 shadow-sm shadow-brown-900/5"
              }`}
            >
              <span className="text-2xl">{c.flag}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-sm">
        <ProgressDots step={4} total={6} />
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={handleContinue} disabled={loading} variant="brand">
            {loading ? t.saving : t.continue}
          </Button>
        </div>
      </div>
    </main>
  );
}
