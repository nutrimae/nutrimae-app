"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, ShoppingBasket, Grid2x2 } from "lucide-react";

const ITEMS = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/cardapio", label: "Cardápio", icon: CalendarDays },
  { href: "/app/lista-compras", label: "Lista", icon: ShoppingBasket },
  { href: "/app/mais", label: "Mais", icon: Grid2x2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 flex border-t border-sage-100 bg-cream/95 backdrop-blur">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
              active ? "text-primary-600" : "text-brown-700/50"
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
