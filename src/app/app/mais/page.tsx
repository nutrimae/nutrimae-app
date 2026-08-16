"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/app/guia-definitivo", label: "Guia Definitivo", icon: BookOpen },
  { href: "/app/receitas", label: "Receitas", icon: ChefHat },
  { href: "/app/busca", label: "Buscar corte seguro", icon: Search },
  { href: "/app/alergia", label: "Guia de Alergia", icon: ShieldAlert },
  { href: "/app/sos", label: "Manual S.O.S.", icon: Siren },
  { href: "/app/diario", label: "Diário do Bebê", icon: BookHeart },
  { href: "/app/desenvolvimento", label: "Marcos do Desenvolvimento", icon: TrendingUp },
  { href: "/app/club", label: "Club das Mães", icon: Users },
  { href: "/app/suporte", label: "Suporte", icon: LifeBuoy, badgeKey: "suporte" },
  { href: "/app/rotina-sono", label: "Rotina do Sono", icon: Moon },
  { href: "/app/calculadora-fraldas", label: "Calculadora de Fraldas", icon: Baby },
  { href: "/app/perfil", label: "Perfil e configurações", icon: UserCog },
];

export default function MaisPage() {
  const supabase = useMemo(() => createClient(), []);
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);

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
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <h1 className="font-heading text-2xl font-bold text-brown-800">Mais</h1>

      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, icon: Icon, badgeKey }) => (
          <Link
            key={href}
            href={href}
            className="relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl bg-white/80 p-4 text-center shadow-sm shadow-brown-900/5 active:bg-sage-50"
          >
            {badgeKey === "suporte" && hasUnreadSupport && (
              <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-terracotta-500" />
            )}
            <Icon className="h-7 w-7 text-sage-600" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-brown-800">{label}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/politica-privacidade"
        className="min-h-12 text-center text-sm font-semibold text-brown-700/60"
      >
        Política de Privacidade
      </Link>
    </main>
  );
}
