"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/use-locale";

export default function AuthCodeErrorPage() {
  const { locale } = useLocale();
  const es = locale === "es";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-brown-800">
        {es ? "Uy, ese link ya no es válido" : "Ops, esse link não é mais válido"}
      </h1>
      <p className="max-w-xs text-brown-700">
        {es
          ? "Puede haber vencido o ya haber sido usado. No hay problema, solo pide uno nuevo."
          : "Ele pode ter expirado ou já ter sido usado. Sem problema, é só pedir um novo."}
      </p>
      <Link href="/login" className="w-full max-w-xs">
        <Button>{es ? "Volver al login" : "Voltar para o login"}</Button>
      </Link>
    </main>
  );
}
