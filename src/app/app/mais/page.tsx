"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShieldAlert,
  Siren,
  BookHeart,
  Users,
  LifeBuoy,
  Moon,
  Baby,
  UserCog,
  TrendingUp,
  BookOpen,
  ChefHat,
  Hand,
  Headphones,
  Palette,
  Cookie,
  Download,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/app/downloads", label: "Downloads", icon: Download, color: "text-primary-600" },
  { href: "/app/utensilios-recomendados", label: "Utensílios Recomendados", icon: ShoppingBag, color: "text-peach-500" },
  { href: "/app/guia-definitivo", label: "Guia Definitivo", icon: BookOpen, color: "text-sage-600" },
  { href: "/app/receitas", label: "Receitas", icon: ChefHat, color: "text-terracotta-500" },
  { href: "/app/pratinhos-divertidos", label: "Pratinhos Divertidos", icon: Palette, color: "text-primary-500" },
  { href: "/app/blw", label: "Guia BLW", icon: Hand, color: "text-sage-500" },
  { href: "/app/mordedores-naturais", label: "Mordedores Naturais", icon: Cookie, color: "text-peach-400" },
  { href: "/app/audiobooks", label: "Audiobooks", icon: Headphones, color: "text-primary-600" },
  { href: "/app/busca", label: "Buscar corte seguro", icon: Search, color: "text-sage-600" },
  { href: "/app/alergia", label: "Guia de Alergia", icon: ShieldAlert, color: "text-terracotta-600" },
  { href: "/sos", label: "Manual S.O.S.", icon: Siren, color: "text-red-500" },
  { href: "/app/diario", label: "Diário do Bebê", icon: BookHeart, color: "text-primary-500" },
  { href: "/app/desenvolvimento", label: "Marcos do Desenvolvimento", icon: TrendingUp, color: "text-sage-500" },
  { href: "/app/club", label: "Comunidade das Mães", icon: Users, color: "text-primary-600" },
  { href: "/app/suporte", label: "Suporte", icon: LifeBuoy, badgeKey: "suporte", color: "text-sage-600" },
  { href: "/app/rotina-sono", label: "Rotina do Sono", icon: Moon, color: "text-indigo-400" },
  { href: "/app/calculadora-fraldas", label: "Calculadora de Fraldas", icon: Baby, color: "text-primary-500" },
  { href: "/app/perfil", label: "Perfil e configurações", icon: UserCog, color: "text-brown-700" },
];

export default function MaisPage() {
  const supabase = useMemo(() => createClient(), []);
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);

  // Regra de ouro da Área VIP: o acesso aos módulos comprados via order bump
  // NUNCA aparece aqui em "Mais" — só no botão VIP dedicado (bottom nav).
  // Ver src/lib/use-vip-access.ts e src/components/bottom-nav.tsx.
  const items = ITEMS;

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("support_messages")
        .select("id")
        .eq("sender", "admin")
        .eq("read_by_user", false)
        .limit(1);

      setHasUnreadSupport((data ?? []).length > 0);
    }
    check();
  }, [supabase]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-brown-800">Mais</h1>
        <Image
          src="/nutrimae-logo.png"
          alt="NutriMãe"
          width={40}
          height={40}
          className="h-8 w-8 object-contain opacity-60"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map(({ href, label, icon: Icon, badgeKey, color }, i) => (
          <Link
            key={href}
            href={href}
            className="animate-fade-in-up glass-card relative flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center transition-all duration-200 active:scale-[0.98]"
            style={{ animationDelay: `${i * 0.025}s` }}
          >
            {badgeKey === "suporte" && hasUnreadSupport && (
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-cream-deep/50 ${color}`}>
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-semibold leading-tight text-brown-800">{label}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/politica-privacidade"
        className="min-h-11 text-center text-xs font-medium text-brown-700/40 transition-colors hover:text-brown-700/60"
      >
        Política de Privacidade
      </Link>
    </main>
  );
}
