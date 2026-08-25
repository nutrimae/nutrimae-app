import Link from "next/link";

export function OfertaFooter() {
  return (
    <footer className="bg-cream-deep px-5 py-8 text-center text-xs text-brown-700/70">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
        <p>NutriMãe · CNPJ 68.580.891/0001-36</p>
        <p>© {new Date().getFullYear()} NutriMãe. Todos os direitos reservados.</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/politica-privacidade"
            className="inline-flex min-h-11 items-center px-1 underline"
          >
            Política de Privacidade
          </Link>
          <span aria-hidden="true">·</span>
          <a href="mailto:contato@nutrimae.com" className="inline-flex min-h-11 items-center px-1 underline">
            Contato
          </a>
        </div>
        <p className="mt-2 text-[11px] text-brown-700/60">
          O NutriMãe é uma ferramenta de organização e planejamento da rotina alimentar. Não substitui orientação
          médica ou nutricional profissional.
        </p>
      </div>
    </footer>
  );
}
