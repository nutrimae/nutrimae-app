import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function SosHighlight() {
  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8">
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-sage-50 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-500 text-white">
          <HeartHandshake className="h-6 w-6" strokeWidth={2} />
        </div>
        <h2 className="font-heading text-lg font-bold text-brown-800">O Manual S.O.S. é gratuito e sempre será</h2>
        <p className="text-sm text-brown-700">
          É um guia de orientação rápida — para você não precisar se preocupar sozinha. Fica disponível para
          qualquer pessoa, sem precisar de assinatura.
        </p>
        <Link
          href="/manual-sos"
          className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-sage-500 px-5 text-sm font-bold text-sage-700 transition-colors hover:bg-sage-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2"
        >
          Conhecer o Manual S.O.S.
        </Link>
      </div>
    </section>
  );
}
