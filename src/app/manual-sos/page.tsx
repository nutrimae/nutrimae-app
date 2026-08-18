import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Manual S.O.S. de Emergência | NutriMãe",
  description: "Acesso público e gratuito ao Manual S.O.S. do NutriMãe.",
};

export default function ManualSosPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-sage-50 via-cream to-white px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-sage-200/70 bg-white/90 p-7 text-center shadow-[0_18px_55px_rgba(84,105,74,0.10)] sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-500 text-white shadow-sm">
          <HeartHandshake className="h-7 w-7" aria-hidden="true" strokeWidth={1.8} />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
          Acesso público e gratuito
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-brown-800">
          Manual S.O.S. de Emergência
        </h1>
        <p className="mt-4 text-base leading-7 text-brown-700">
          Esta área é livre, sem assinatura e sem necessidade de login. O conteúdo completo do manual será
          organizado nesta página.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-700">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" strokeWidth={1.8} />
          Acesso direto para qualquer pessoa
        </div>

        <p className="mt-6 text-sm leading-6 text-brown-700/70">
          Conteúdo educativo. Este material não substitui avaliação ou atendimento de profissionais de saúde.
        </p>

        <Link
          href="/login"
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-sage-500 px-5 py-3 text-sm font-bold text-sage-700 transition-colors hover:bg-sage-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2"
        >
          Voltar para o NutriMãe
        </Link>
      </section>
    </main>
  );
}
