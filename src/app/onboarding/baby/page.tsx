"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressDots } from "@/components/onboarding/progress-dots";
import { consumeOnboardingMonths } from "@/app/oferta/_components/onboarding-handoff";

type Mode = "data" | "meses";

function birthDateFromMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export default function BabyStepPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("data");
  const [birthDate, setBirthDate] = useState("");
  const [months, setMonths] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  // Pré-preenche com a fase escolhida em /oferta, quando a pessoa veio de lá.
  // Só define o modo/valor — nunca envia o formulário sozinho; a mãe ainda
  // confirma (ou ajusta) antes de continuar.
  useEffect(() => {
    const months = consumeOnboardingMonths();
    if (months) {
      setMode("meses");
      setMonths(String(months));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const finalName = name.trim();
    if (!finalName) {
      setError("Como se chama o bebê?");
      return;
    }

    const finalBirthDate = mode === "data" ? birthDate : birthDateFromMonths(Number(months));
    if (!finalBirthDate) {
      setError("Precisamos da data (ou idade) do bebê.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("babies")
      .insert({ user_id: user.id, name: finalName, birth_date: finalBirthDate })
      .select("id")
      .single();

    setLoading(false);

    if (insertError || !data) {
      setError("Não deu para salvar agora. Tente de novo em instantes.");
      return;
    }

    sessionStorage.setItem("nutrimae_onboarding_baby_id", data.id);
    router.push("/onboarding/gender");
  }

  return (
    <main className="flex min-h-dvh flex-col justify-between px-6 py-10"
      style={{ background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)" }}
    >
      <div className="mx-auto w-full max-w-sm flex-1">
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Conte sobre o seu bebê
        </h1>
        <p className="mt-2 text-sm text-brown-700/70">
          Assim personalizamos as sugestões para a fase certa.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <Input
            id="baby-name"
            label="Nome do bebê"
            placeholder="Ex.: Alice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex rounded-2xl bg-cream-deep/60 p-1">
            <button
              type="button"
              onClick={() => setMode("data")}
              className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === "data" ? "bg-white text-brown-800 shadow-sm" : "text-brown-700/50"
              }`}
            >
              Data de nascimento
            </button>
            <button
              type="button"
              onClick={() => setMode("meses")}
              className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === "meses" ? "bg-white text-brown-800 shadow-sm" : "text-brown-700/50"
              }`}
            >
              Idade em meses
            </button>
          </div>

          {mode === "data" ? (
            <Input
              id="birth-date"
              type="date"
              label="Data de nascimento"
              value={birthDate}
              max={today}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          ) : (
            <Input
              id="months"
              type="number"
              inputMode="numeric"
              label="Idade em meses"
              placeholder="Ex.: 6"
              min={0}
              max={36}
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              required
            />
          )}

          {error && (
            <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} variant="brand">
            {loading ? "Salvando..." : "Continuar"}
          </Button>
        </form>
      </div>

      <div className="mx-auto mt-8 w-full max-w-sm">
        <ProgressDots step={1} total={6} />
      </div>
    </main>
  );
}
