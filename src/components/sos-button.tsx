"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren } from "lucide-react";
import { useLocale } from "@/lib/use-locale";

export function SosButton() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const es = locale === "es";

  if (pathname.startsWith("/sos")) return null;
  // Evita confundir com o "SOS Desmame" e sobrepor um botão vermelho vibrante
  // em cima do Modo Madrugada, que é pensado para não ofuscar os olhos.
  if (pathname.startsWith("/app/sos-desmame")) return null;

  return (
    <Link
      href="/sos"
      aria-label={es ? "Abrir manual de emergencia" : "Abrir manual de emergência"}
      className="fixed bottom-[76px] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/25 ring-[3px] ring-white transition-transform duration-200 active:scale-95"
    >
      <Siren className="h-7 w-7" strokeWidth={2} />
    </Link>
  );
}
