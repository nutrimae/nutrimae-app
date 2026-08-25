"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, Camera, ChevronRight, Droplet, Heart, Leaf, Sparkles, Star } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { BabyPhotoUploadModal } from "@/components/baby-photo-upload-modal";
import { Chip } from "@/components/ui/chip";
import { IconAvatar3D } from "@/components/ui/icon-avatar-3d";
import { createClient } from "@/lib/supabase/client";
import { ageInMonths } from "@/lib/age";
import { ageBandForMonths, allergenForDietFilter, getTodaySuggestion, type DietFilter } from "@/lib/menu";

const ICON_HEART = "/images/illustrations/icon-heart.webp";
const ICON_LEAF = "/images/illustrations/icon-leaf.webp";
const ICON_STAR = "/images/illustrations/icon-star.webp";
const ICON_DROPLET = "/images/illustrations/icon-droplet.webp";
const MEAL_BOWL = "/images/illustrations/meal-bowl-3d.webp";

const SHORTCUTS = [
  { image: ICON_LEAF, label: "Cardápio da semana", href: "/app/cardapio" },
  { image: ICON_HEART, label: "Buscar corte seguro", href: "/app/busca" },
  { image: ICON_STAR, label: "Lista de compras", href: "/app/lista-compras" },
];

const MEAL_BENEFITS = [
  { icon: Droplet, text: "Hidrata e refresca", color: "text-primary-500" },
  { icon: Leaf, text: "Fonte natural de nutrientes", color: "text-sage-500" },
  { icon: Sparkles, text: "Ideal para a fase atual", color: "text-amber-500" },
];

const TIPS = [
  { image: ICON_DROPLET, title: "Hidratação é tudo!", text: "Ofereça água ao longo do dia, mesmo fora das refeições.", styles: "bg-primary-50" },
  { image: ICON_LEAF, title: "Pequenas quantidades?", text: "O começo da alimentação é leve, seguro e gradual.", styles: "bg-sage-50" },
  { image: ICON_STAR, title: "Você está no caminho certo!", text: "Cada escolha faz diferença no futuro do seu bebê.", styles: "bg-amber-50" },
];

function MealBowl() {
  return (
    <div className="relative h-[132px] w-[132px] shrink-0 overflow-hidden rounded-[24px] shadow-subtle" aria-hidden="true">
      <Image src={MEAL_BOWL} alt="" fill sizes="132px" className="object-cover" />
    </div>
  );
}

export default function AppHomePage() {
  const router = useRouter();
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);
  const [triedFoodKeys, setTriedFoodKeys] = useState<Set<string> | undefined>();
  const [avoidAllergen, setAvoidAllergen] = useState<ReturnType<typeof allergenForDietFilter>>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<{ babyId: string; url: string } | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    ["/app/busca", "/app/cardapio", "/app/lista-compras", "/app/mais"].forEach((route) => router.prefetch(route));
  }, [router]);

  useEffect(() => {
    if (!activeBaby) return;
    let cancelled = false;
    async function loadPersonalization() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const [productsRes, foodLogRes] = await Promise.all([
        supabase.from("user_products").select("product_id, status").eq("user_id", user.id).in("product_id", ["diario_bebe", "restricao_alimentar"]),
        supabase.from("food_log").select("food_key").eq("baby_id", activeBaby!.id),
      ]);
      if (cancelled) return;
      const products = new Set((productsRes.data ?? []).filter((item) => item.status === "active").map((item) => item.product_id));
      setTriedFoodKeys(products.has("diario_bebe") ? new Set((foodLogRes.data ?? []).map((item) => item.food_key)) : undefined);
      setAvoidAllergen(products.has("restricao_alimentar") ? allergenForDietFilter((activeBaby!.diet_filter as DietFilter) ?? "padrao") : null);
    }
    void loadPersonalization();
    return () => { cancelled = true; };
  }, [activeBaby, supabase]);

  if (!activeBaby) {
    return <main className="flex min-h-[70dvh] items-center justify-center"><div className="h-12 w-12 animate-pulse rounded-full bg-primary-100" aria-label="Carregando dados do bebê" /></main>;
  }

  const months = ageInMonths(activeBaby.birth_date);
  const photoUrl = uploadedPhoto?.babyId === activeBaby.id ? uploadedPhoto.url : activeBaby.photo_url;
  const today = getTodaySuggestion(ageBandForMonths(months), new Date(), { triedFoodKeys, avoidAllergen });
  const firstName = activeBaby.name.split(" ")[0];
  const babyLabel = activeBaby.gender === "male" ? "Meu bebê" : "Minha bebê";

  return (
    <main className="flex w-full flex-col gap-3.5 px-5 pb-5 pt-4">
      <section className="flex items-center justify-between" aria-label="Boas-vindas">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowUpload(true)} className="group relative h-14 w-14 shrink-0 touch-manipulation" aria-label="Alterar foto do bebê">
            {photoUrl ? (
              <Image src={photoUrl} alt={activeBaby.name} width={56} height={56} priority unoptimized className="h-14 w-14 rounded-full border-2 border-primary-500 object-cover shadow-sm" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-500 bg-white text-xl font-bold text-primary-500 shadow-sm">{firstName.charAt(0).toUpperCase()}</span>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white ring-2 ring-cream"><Camera className="h-2.5 w-2.5" strokeWidth={2.5} /></span>
          </button>
          <div>
            <h1 className="text-[20px] font-bold leading-tight tracking-[-0.35px] text-brown-900">Olá, {firstName}! <span aria-hidden="true">💗</span></h1>
            <p className="mt-1 text-[12px] text-brown-700/82">Que bom te ver por aqui!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/suporte" aria-label="Notificações" className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full active:bg-primary-50"><Bell className="h-5 w-5 text-brown-700" strokeWidth={1.8} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-cream" /></Link>
          <Image src="/nutrimae-logo.png" alt="NutriMãe" width={42} height={42} priority className="h-10 w-10 object-contain" />
        </div>
      </section>

      <Link href="/app/perfil" className="flex min-h-[76px] touch-manipulation items-center gap-3 rounded-[18px] bg-white px-4 shadow-subtle transition-transform active:scale-[0.985]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-lg font-bold text-primary-500">{firstName.charAt(0).toUpperCase()}</span>
        <span className="min-w-0 flex-1"><strong className="block truncate text-[16px] text-brown-900">{firstName}</strong><span className="mt-1 flex items-center gap-1 text-[11px] text-brown-700/80"><CalendarDays className="h-3 w-3" />{months} {months === 1 ? "mês" : "meses"} de vida</span></span>
        <Chip color="primary"><Heart className="h-3.5 w-3.5" fill="currentColor" />{babyLabel}<ChevronRight className="h-3.5 w-3.5" /></Chip>
      </Link>

      <section className="grid grid-cols-3 gap-2" aria-label="Atalhos">
        {SHORTCUTS.map(({ image, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex min-h-[92px] touch-manipulation flex-col items-center justify-center gap-1.5 rounded-[16px] bg-white px-2 py-3 shadow-subtle transition-transform active:scale-[0.97]"
          >
            <IconAvatar3D src={image} />
            <span className="text-center text-[11px] font-semibold leading-tight text-brown-900">{label}</span>
          </Link>
        ))}
      </section>

      <section className="mt-1">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h2 className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-brown-900"><Heart className="h-4 w-4 shrink-0 text-primary-500" fill="currentColor" />Sugestão para agora: {today.mealLabel}</h2>
          <Chip color="sage"><Leaf className="h-3 w-3" />Fase: {months} meses</Chip>
        </div>
        <Link href="/app/cardapio" className="block touch-manipulation rounded-[20px] bg-white p-3 shadow-strong transition-transform active:scale-[0.99]">
          <Chip color="amber"><Star className="h-3 w-3" fill="currentColor" />Mais escolhido</Chip>
          <h3 className="mt-2 text-[18px] font-bold leading-tight text-brown-900">{today.suggestion.title}</h3>
          <p className="mt-1 text-[11px] text-brown-700/82">{today.suggestion.description}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="min-w-0 flex-1 space-y-3">{MEAL_BENEFITS.map(({ icon: Icon, text, color }) => <div key={text} className="flex items-center gap-2"><Icon className={`h-4 w-4 shrink-0 ${color}`} strokeWidth={2} /><span className="text-[11px] leading-tight text-brown-800">{text}</span></div>)}</div>
            <MealBowl />
          </div>
          <span className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-[13px] font-bold text-white shadow-[0_4px_16px_var(--color-primary-shadow)]">
            Ver cardápio completo da semana<ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </Link>
      </section>

      <section className="grid grid-cols-3 gap-2" aria-label="Dicas do dia">
        {TIPS.map(({ image, title, text, styles }) => (
          <article key={title} className={`flex min-h-[142px] flex-col rounded-[18px] p-3 ${styles}`}>
            <IconAvatar3D src={image} size="sm" />
            <h3 className="mt-2 text-[11px] font-bold leading-tight text-brown-900">{title}</h3>
            <p className="mt-1 text-[11px] leading-[1.35] text-brown-700/88">{text}</p>
          </article>
        ))}
      </section>

      {showUpload && <BabyPhotoUploadModal babyId={activeBaby.id} onClose={() => setShowUpload(false)} onUploaded={(url) => setUploadedPhoto({ babyId: activeBaby.id, url })} />}
    </main>
  );
}
