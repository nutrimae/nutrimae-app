"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren } from "lucide-react";

export function SosButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/app/sos")) return null;

  return (
    <Link
      href="/app/sos"
      aria-label="Abrir manual de emergência"
      className="fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-900/30 ring-4 ring-white active:bg-red-700"
    >
      <Siren className="h-8 w-8" strokeWidth={2} />
    </Link>
  );
}
