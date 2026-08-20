"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock3, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AcessoPendentePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [checking, setChecking] = useState(false);

  async function checkAgain() {
    setChecking(true);
    router.replace("/app");
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary-50 via-cream to-sage-50 px-6 py-10">
      <section className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-strong">
        <Image src="/nutrimae-logo.png" alt="NutriMãe" width={112} height={112} priority className="mx-auto h-24 w-24 object-contain" />
        <span className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Clock3 className="h-6 w-6" /></span>
        <h1 className="mt-4 text-2xl font-bold text-brown-800">Acesso aguardando liberação</h1>
        <p className="mt-3 text-sm leading-relaxed text-brown-700/65">
          O web app é exclusivo para clientes. Se você acabou de comprar, a confirmação pode levar alguns instantes.
        </p>
        <button type="button" onClick={checkAgain} disabled={checking} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 font-semibold text-white disabled:opacity-60">
          <RefreshCw className={`h-5 w-5 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Verificando..." : "Verificar minha compra"}
        </button>
        <Link href="/oferta" className="mt-3 flex min-h-12 items-center justify-center rounded-2xl border border-primary-100 text-sm font-semibold text-primary-600">Ainda não comprei</Link>
        <button type="button" onClick={signOut} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 text-sm text-brown-700/50"><LogOut className="h-4 w-4" />Usar outro e-mail</button>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-brown-700/40"><ShieldCheck className="h-3.5 w-3.5" />Compra validada no servidor</p>
      </section>
    </main>
  );
}
