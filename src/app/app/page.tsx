"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Search, CalendarDays, Camera, Heart, Droplet, Sparkles, Bell } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BabyPhotoUploadModal } from "@/components/baby-photo-upload-modal";
import { ageInMonths } from "@/lib/age";
import {
  ageBandForMonths,
  allergenForDietFilter,
  getTodaySuggestion,
  type DietFilter,
} from "@/lib/menu";

const BENEFIT_CARDS = [
  { emoji: "❤️", label: "Mais saúde", tint: "bg-red-50" },
  { emoji: "🌿", label: "Menos preocupação", tint: "bg-sage-50" },
  { emoji: "😊", label: "Crescimento feliz", tint: "bg-peach-100" },
];

const TIP_CARDS = [
  {
    icon: Droplet,
    title: "Hidratação é tudo!",
    text: "Ofereça água ao longo do dia, mesmo fora das refeições.",
    tint: "bg-sky-50 text-sky-600",
  },
  {
    icon: Sparkles,
    title: "Pequenas quantidades",
    text: "O começo da alimentação é leve, seguro e gradual.",
    tint: "bg-sage-50 text-sage-600",
  },
  {
    icon: Heart,
    title: "Você está no caminho certo!",
    text: "Cada escolha faz diferença no futuro do seu bebê.",
    tint: "bg-peach-100 text-terracotta-600",
  },
];

const SUGGESTION_BENEFITS = [
  "Rico em nutrientes importantes para a fase",
  "Textura pensada para a idade do bebê",
  "Um sabor novo para descobrir juntos",
];

function greetingForHour(hour: number): string {
  if (hour < 12) return "Bom dia, mãe! ☀️";
  if (hour < 18) return "Boa tarde, mãe! 🌤️";
  return "Boa noite, mãe! 🌙";
}

const MOTIVATIONAL_HEADLINES = [
  { title: "Cada escolha nutre um futuro incrível! 💕", subtitle: "Pequenas decisões hoje, grandes conquistas amanhã." },
  { title: "Você está no caminho certo, mãe. 🌱", subtitle: "Cada refeição é uma nova oportunidade de descoberta." },
  { title: "Mãe segura gera bebê confiante. ❤️", subtitle: "Sua atenção nos detalhes já faz toda a diferença." },
  { title: "Isso não é só comida — é exploração.", subtitle: "Cada sabor novo é um passo na confiança do seu bebê." },
  { title: "Você está criando memórias de segurança. ✨", subtitle: "E isso vale muito mais do que parece hoje." },
  { title: "Um dia de cada vez, com carinho. 🌤️", subtitle: "Você não precisa acertar tudo — só estar presente." },
  { title: "Que sorte a desse bebê, ter você. 💛", subtitle: "Continue confiando no seu instinto de mãe." },
];

function headlineForToday() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return MOTIVATIONAL_HEADLINES[dayOfYear % MOTIVATIONAL_HEADLINES.length];
}

const WHY_SUBSCRIBE = [
  {
    icon: CalendarDays,
    title: "Cardápio inteligente semanal",
    text: "Novas sugestões toda semana, baseadas na fase do seu bebê.",
    tint: "bg-sage-50 text-sage-600",
  },
  {
    icon: Heart,
    title: "Comunidade de mães",
    text: "Milhares de mães trocando experiências e tirando dúvidas.",
    tint: "bg-primary-100 text-primary-600",
  },
  {
    icon: Sparkles,
    title: "Acompanhamento completo",
    text: "Veja o progresso alimentar do seu bebê mês a mês no Diário.",
    tint: "bg-peach-100 text-terracotta-600",
  },
];

export default function AppHomePage() {
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);

  const [triedFoodKeys, setTriedFoodKeys] = useState<Set<string> | undefined>(undefined);
  const [avoidAllergen, setAvoidAllergen] = useState<ReturnType<typeof allergenForDietFilter>>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    setPhotoUrl(activeBaby?.photo_url ?? null);
  }, [activeBaby?.photo_url]);

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

      setTriedFoodKeys(
        active.has("diario_bebe")
          ? new Set((foodLogRes.data ?? []).map((r) => r.food_key))
          : undefined,
      );
      setAvoidAllergen(
        active.has("restricao_alimentar")
          ? allergenForDietFilter((activeBaby!.diet_filter as DietFilter) ?? "padrao")
          : null,
      );
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeBaby, supabase]);

  if (!activeBaby) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando os dados do bebê...</p>
      </main>
    );
  }

  const months = ageInMonths(activeBaby.birth_date);
  const ageBand = ageBandForMonths(months);
  const today = getTodaySuggestion(ageBand, new Date(), { triedFoodKeys, avoidAllergen });
  const firstName = activeBaby.name.split(" ")[0];
  const headline = headlineForToday();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-8">
      {/* Hero */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="group relative h-16 w-16 shrink-0 rounded-full"
            aria-label="Alterar foto do bebê"
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={activeBaby.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-4 border-primary-300 object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary-300 bg-primary-100 font-heading text-xl font-bold text-primary-600">
                {activeBaby.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm">
              <Camera className="h-3 w-3" strokeWidth={2} />
            </span>
          </button>

          <div>
            <p className="text-sm font-semibold text-brown-700">{greetingForHour(new Date().getHours())}</p>
            <h1 className="font-heading text-2xl font-bold text-brown-800">{activeBaby.name}</h1>
            <p className="text-sm text-brown-700/70">
              {months} {months === 1 ? "mês" : "meses"}
            </p>
          </div>
        </div>

        <Link
          href="/app/suporte"
          aria-label="Notificações"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm shadow-primary-500/10"
        >
          <Bell className="h-5 w-5 text-brown-700" strokeWidth={1.75} />
        </Link>
      </div>

      {/* Card motivacional */}
      <div className="animate-fade-in-up rounded-3xl bg-gradient-to-b from-primary-100 to-white p-5 shadow-sm shadow-primary-500/10">
        <p className="type-h2 font-heading text-brown-800">{headline.title}</p>
        <p className="mt-1 type-small text-brown-700">{headline.subtitle}</p>
      </div>

      {/* Benefícios */}
      <div>
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">
          Como está {firstName} hoje?
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {BENEFIT_CARDS.map((b, i) => (
            <div
              key={b.label}
              style={{ animationDelay: `${i * 0.1}s` }}
              className={`lift-on-hover animate-fade-in-up flex cursor-default flex-col items-center gap-1 rounded-2xl ${b.tint} px-2 py-4 text-center shadow-[var(--shadow-subtle)]`}
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="text-xs font-semibold text-brown-800">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sugestão do momento */}
      <div>
        <h2 className="font-heading text-lg font-bold text-brown-800">
          Sugestão para agora: {today.mealLabel}
        </h2>
        <Link href="/app/cardapio" className="mt-3 block">
          <div className="rounded-3xl bg-gradient-to-b from-primary-100 to-white p-5 shadow-sm shadow-primary-500/10 transition-transform active:scale-[0.99]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Badge variant="solid" className="mb-1 bg-white/70 text-primary-600">
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                  Mais escolhido
                </Badge>
                <p className="font-heading text-lg font-bold text-brown-800">
                  {today.suggestion.title}
                </p>
                <p className="mt-1 text-sm text-brown-700">{today.suggestion.description}</p>
              </div>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-primary-500" strokeWidth={2} />
            </div>

            <ul className="mt-3 flex flex-col gap-1.5">
              {SUGGESTION_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-brown-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </Link>
      </div>

      {/* Dicas */}
      <div className="grid grid-cols-3 gap-2">
        {TIP_CARDS.map((tip) => (
          <div
            key={tip.title}
            className={`flex flex-col items-center gap-2 rounded-2xl ${tip.tint} p-3 text-center`}
          >
            <tip.icon className="h-6 w-6" strokeWidth={1.75} />
            <div>
              <p className="text-xs font-bold leading-tight">{tip.title}</p>
              <p className="mt-1 text-[11px] leading-tight opacity-80">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Por que continuar assinando */}
      <div>
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">
          Por que continuar com o NutriMäe?
        </h2>
        <div className="flex flex-col gap-2">
          {WHY_SUBSCRIBE.map((reason) => (
            <div key={reason.title} className={`flex items-center gap-3 rounded-2xl ${reason.tint} p-3`}>
              <reason.icon className="h-6 w-6 shrink-0" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-bold leading-tight">{reason.title}</p>
                <p className="mt-0.5 text-xs leading-tight opacity-80">{reason.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link href="/app/busca">
        <Button variant="brand" className="flex items-center justify-center gap-2">
          <Search className="h-5 w-5" strokeWidth={2} />
          Buscar corte seguro
        </Button>
      </Link>

      <Link
        href="/app/cardapio"
        className="flex min-h-12 items-center justify-center gap-2 text-center text-base font-semibold text-primary-600"
      >
        <CalendarDays className="h-4 w-4" strokeWidth={2} />
        Ver cardápio completo da semana
      </Link>

      {showUpload && (
        <BabyPhotoUploadModal
          babyId={activeBaby.id}
          onClose={() => setShowUpload(false)}
          onUploaded={(url) => setPhotoUrl(url)}
        />
      )}
    </main>
  );
}
