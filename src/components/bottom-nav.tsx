"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, ShoppingBasket, LayoutGrid, Crown } from "lucide-react";
import { useVipAccess } from "@/lib/use-vip-access";

const ITEMS = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/cardapio", label: "Cardápio", icon: CalendarDays },
  { href: "/app/lista-compras", label: "Lista", icon: ShoppingBasket },
  { href: "/app/mais", label: "Mais", icon: LayoutGrid },
];

const VIP_PATHS = ["/app/vip", "/app/sos-desmame", "/app/protocolo-intestino"];

export function BottomNav() {
  const pathname = usePathname();
  const { hasAny: hasVipAccess } = useVipAccess();

  // Tela imersiva "Modo Madrugada": sem navegação clara por cima do fundo escuro.
  if (pathname.startsWith("/app/sos-desmame")) return null;

  const vipActive = VIP_PATHS.some((path) => pathname.startsWith(path));

  return (
    <nav className="sticky bottom-0 z-40 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="flex">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                active ? "text-primary-500" : "text-gray-400"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-b-full bg-primary-500" />
              )}
              <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.5} fill={active ? "currentColor" : "none"} />
              {label}
            </Link>
          );
        })}

        {/*
          has_vip_access = false → esta aba NÃO EXISTE no DOM (nem sequer é
          renderizada, muito menos escondida via CSS). Só aparece depois que a
          usuária compra pelo menos um dos módulos da Área VIP.
        */}
        {hasVipAccess && (
          <Link
            href="/app/vip"
            prefetch
            aria-current={vipActive ? "page" : undefined}
            className={`relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors ${
              vipActive ? "text-amber-600" : "text-amber-500"
            }`}
          >
            {vipActive && (
              <span className="absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-b-full bg-amber-500" />
            )}
            <span className="animate-vip-glow flex h-6 w-6 items-center justify-center rounded-full">
              <Crown className="h-5 w-5" strokeWidth={2} fill="currentColor" />
            </span>
            VIP
          </Link>
        )}
      </div>
    </nav>
  );
}
