"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Search,
  CalendarDays,
  Camera,
  Heart,
  Droplet,
  Sparkles,
  Bell,
  Headphones,
  Cookie,
  X,
  Star,
  Shield,
  Leaf,
  Smile,
  CheckCircle2,
} from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { BabyPhotoUploadModal } from "@/components/baby-photo-upload-modal";
import { ageInMonths } from "@/lib/age";
import {
  ageBandForMonths,
  allergenForDietFilter,
  getTodaySuggestion,
  type DietFilter,
} from "@/lib/menu";

const SUGGESTION_BENEFITS = [
  { icon: Droplet, text: "Hidrata e refresca", color: "text-sky-500" },
  { icon: Leaf, text: "Fonte natural de nutrientes", color: "text-sage-500" },
  { icon: Sparkles, text: "Ideal para a fase atual", color: "text-peach-500" },
];

const TIP_CARDS = [
  {
    icon: Droplet,
    title: "Hidratação é tudo!",
    text: "Ofereça água ao longo do dia, mesmo fora das refeições.",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    emoji: "🍼",
  },
  {
    icon: Leaf,
    title: "Pequenas quantidades",
    text: "O começo da alimentação é leve, seguro e gradual.",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    emoji: "🥣",
  },
  {
    icon: Smile,
    title: "Você está no caminho certo!",
    text: "Cada escolha faz diferença no futuro do seu bebê.",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    emoji: "💕",
  },
];

const WHY_SUBSCRIBE = [
  {
    icon: CalendarDays,
    title: "Cardápio inteligente semanal",
    text: "Novas sugestões toda semana, baseadas na fase do seu bebê.",
    iconBg: "bg-sage-100",
    iconColor: "text-sage-600",
  },
  {
    icon: Star,
    title: "Comunidade de mães",
    text: "Milhares de mães trocando experiências e tirando dúvidas.",
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  {
    icon: Shield,
    title: "Acompanhamento completo",
    text: "Veja o progresso alimentar do seu bebê mês a mês no Diário.",
    iconBg: "bg-peach-100",
    iconColor: "text-terracotta-600",
  },
];

function greetingForHour(hour: number): string {
  if (hour < 12) return "Olá";
  if (hour < 18) return "Olá";
  return "Olá";
}

export default function AppHomePage() {
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);

  const [triedFoodKeys, setTriedFoodKeys] = useState<Set<string> | undefined>(undefined);
  const [avoidAllergen, setAvoidAllergen] = useState<ReturnType<typeof allergenForDietFilter>>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [teethingDismissed, setTeethingDismissed] = useState(true);

  useEffect(() => {
    setPhotoUrl(activeBaby?.photo_url ?? null);
  }, [activeBaby?.photo_url]);

  useEffect(() => {
    if (!activeBaby) return;
    const key = `nutrimae:teething-banner-dismissed:${activeBaby.id}`;
    setTeethingDismissed(window.localStorage.getItem(key) === "1");
  }, [activeBaby]);

  function dismissTeethingBanner() {
    if (!activeBaby) return;
    window.localStorage.setItem(`nutrimae:teething-banner-dismissed:${activeBaby.id}`, "1");
    setTeethingDismissed(true);
  }

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
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center text-brown-700">
        <Image src="/nutrimae-logo.png" alt="" width={80} height={80} className="h-16 w-16 animate-pulse-soft object-contain" />
        <p className="text-sm">Carregando os dados do bebê...</p>
      </main>
    );
  }

  const months = ageInMonths(activeBaby.birth_date);
  const ageBand = ageBandForMonths(months);
  const today = getTodaySuggestion(ageBand, new Date(), { triedFoodKeys, avoidAllergen });
  const firstName = activeBaby.name.split(" ")[0];
  const genderLabel = activeBaby.gender === "male" ? "Meu bebê" : "Minha bebê";

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-6 pt-4">
      {/* ──── Hero greeting ──── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="group relative h-14 w-14 shrink-0"
            aria-label="Alterar foto do bebê"
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={activeBaby.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border-[3px] border-primary-200 object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-primary-200 bg-primary-50 font-heading text-xl font-bold text-primary-500">
                {activeBaby.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white ring-2 ring-cream">
              <Camera className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
          </button>

          <div>
            <h1 className="font-heading text-xl font-bold text-brown-800">
              {greetingForHour(new Date().getHours())}, {firstName}! <span className="text-primary-500">❤️</span>
            </h1>
            <p className="text-sm text-brown-700/60">Que bom te ver por aqui!</p>
          </div>
        </div>

        <Link
          href="/app/suporte"
          aria-label="Notificações"
          className="relative mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-subtle"
        >
          <Bell className="h-5 w-5 text-brown-700/50" strokeWidth={1.75} />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white ring-2 ring-cream">
            2
          </span>
        </Link>
      </div>

      {/* ──── Baby info card ──── */}
      <Link
        href="/app/perfil"
        className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-subtle active:scale-[0.99] transition-transform"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 font-heading text-lg font-bold text-primary-500">
          {activeBaby.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-heading text-base font-bold text-brown-800">{firstName}</p>
          <p className="flex items-center gap-1 text-xs text-brown-700/50">
            <CalendarDays className="h-3 w-3" strokeWidth={2} />
            {months} {months === 1 ? "mês" : "meses"} de vida
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5">
          <Heart className="h-3.5 w-3.5 text-primary-500" strokeWidth={2} fill="currentColor" />
          <span className="text-xs font-semibold text-primary-600">{genderLabel}</span>
          <ChevronRight className="h-3.5 w-3.5 text-primary-400" strokeWidth={2} />
        </div>
      </Link>

      {/* ──── Benefit pills ──── */}
      <div className="flex gap-2">
        {[
          { icon: Heart, label: "Mais saúde", iconColor: "text-primary-500", bg: "bg-white" },
          { icon: Leaf, label: "Menos preocupação", iconColor: "text-sage-500", bg: "bg-white" },
          { icon: Smile, label: "Crescimento feliz", iconColor: "text-orange-500", bg: "bg-white" },
        ].map((b) => (
          <div
            key={b.label}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl ${b.bg} px-2 py-3 shadow-subtle`}
          >
            <b.icon className={`h-4 w-4 shrink-0 ${b.iconColor}`} strokeWidth={2} fill="currentColor" />
            <span className="text-[11px] font-semibold text-brown-800">{b.label}</span>
          </div>
        ))}
      </div>

      {/* ──── Suggestion header ──── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-primary-500" strokeWidth={2} fill="currentColor" />
          <h2 className="font-heading text-sm font-bold text-brown-800">
            Sugestão para agora: {today.mealLabel}
          </h2>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-sage-50 px-2.5 py-1">
          <Leaf className="h-3 w-3 text-sage-500" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-sage-700">
            Fase: {months} {months === 1 ? "mês" : "meses"}
          </span>
        </div>
      </div>

      {/* ──── Food suggestion card ──── */}
      <Link
        href="/app/cardapio"
        className="block rounded-2xl bg-white p-4 shadow-subtle transition-transform active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
              <Star className="h-3 w-3 text-amber-500" strokeWidth={2} fill="currentColor" />
              <span className="text-[10px] font-bold text-amber-700">Mais escolhido</span>
            </div>
            <p className="font-heading text-lg font-bold text-brown-800">
              {today.suggestion.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-brown-700/60">
              {today.suggestion.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {SUGGESTION_BENEFITS.map((benefit) => (
            <div key={benefit.text} className="flex items-center gap-2">
              <benefit.icon className={`h-4 w-4 shrink-0 ${benefit.color}`} strokeWidth={2} />
              <span className="text-sm text-brown-700">{benefit.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-end">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 shadow-sm">
            <ChevronRight className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </Link>

      {/* ──── Teething banner ──── */}
      {months >= 5 && months <= 7 && !teethingDismissed && (
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-subtle">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50">
            <Cookie className="h-5 w-5 text-primary-500" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brown-800">Os dentinhos podem estar chegando</p>
            <p className="mt-0.5 text-xs text-brown-700/50">
              Veja 15 opções de mordedores naturais seguros para essa fase.
            </p>
            <Link
              href="/app/mordedores-naturais"
              className="mt-2 inline-block text-xs font-semibold text-primary-500"
            >
              Ver Mordedores Naturais
            </Link>
          </div>
          <button type="button" onClick={dismissTeethingBanner} className="shrink-0 rounded-full p-1">
            <X className="h-3.5 w-3.5 text-brown-700/30" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ──── Tips cards ──── */}
      <div className="grid grid-cols-3 gap-2">
        {TIP_CARDS.map((tip) => (
          <div
            key={tip.title}
            className={`flex flex-col justify-between rounded-2xl ${tip.bg} p-3`}
          >
            <div>
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${tip.iconBg}`}>
                <tip.icon className={`h-4 w-4 ${tip.iconColor}`} strokeWidth={2} />
              </div>
              <p className="text-[11px] font-bold leading-tight text-brown-800">{tip.title}</p>
              <p className="mt-1 text-[10px] leading-tight text-brown-700/60">{tip.text}</p>
            </div>
            <div className="mt-3 text-right text-xl">{tip.emoji}</div>
          </div>
        ))}
      </div>

      {/* ──── Audiobooks widget ──── */}
      <Link
        href="/app/audiobooks"
        className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-subtle transition-transform active:scale-[0.99]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50">
          <Headphones className="h-5 w-5 text-primary-500" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brown-800">Audiobooks para o dia a dia</p>
          <p className="text-[11px] text-brown-700/50">Janela imunológica, engasgo vs. gag e mais.</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-brown-700/30" strokeWidth={2} />
      </Link>

      {/* ──── Por que continuar ──── */}
      <div>
        <h2 className="mb-2 font-heading text-sm font-bold text-brown-800">
          Por que continuar com o NutriMãe?
        </h2>
        <div className="flex flex-col gap-2">
          {WHY_SUBSCRIBE.map((reason) => (
            <div key={reason.title} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-subtle">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${reason.iconBg}`}>
                <reason.icon className={`h-4.5 w-4.5 ${reason.iconColor}`} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-brown-800">{reason.title}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-brown-700/50">{reason.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── Search CTA ──── */}
      <Link
        href="/app/busca"
        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-base font-bold text-white shadow-[0_4px_16px_var(--color-primary-shadow)] transition-all active:scale-[0.98]"
      >
        <Search className="h-5 w-5" strokeWidth={2} />
        Buscar corte seguro
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </Link>

      {/* ──── Cardápio link ──── */}
      <Link
        href="/app/cardapio"
        className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-brown-700/60"
      >
        <CheckCircle2 className="h-4 w-4 text-brown-700/40" strokeWidth={2} />
        Ver cardápio completo da semana
        <ChevronRight className="h-4 w-4 text-brown-700/40" strokeWidth={2} />
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
