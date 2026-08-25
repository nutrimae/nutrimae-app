const TESTIMONIALS = [
  {
    quote:
      "Eu estava sempre procurando no celular o que preparar e acabava ficando perdida. Ficou muito mais fácil planejar a alimentação da semana.",
    author: "Marina Costa",
    context: "mãe do Leo, 7 meses",
    initials: "MC",
  },
  {
    quote:
      "O que mais gostei foi poder acessar pelo celular quando estou preparando a comida. Não preciso ficar procurando informações em vários lugares.",
    author: "Camila Ribeiro",
    context: "mãe da Sofia, 9 meses",
    initials: "CR",
  },
];

/**
 * Mesmos depoimentos reais da seção #depoimentos da landing
 * (landing-nutrimae/index.html) — repetidos aqui pra reforçar confiança no
 * momento exato da decisão de compra, não só lá em cima na landing.
 */
export function CheckoutTestimonials() {
  return (
    <div className="flex flex-col gap-3">
      {TESTIMONIALS.map((t) => (
        <div key={t.author} className="rounded-[20px] bg-white p-4 shadow-subtle">
          <p className="text-sm leading-snug text-brown-700/86">&ldquo;{t.quote}&rdquo;</p>
          <div className="mt-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
              {t.initials}
            </span>
            <p className="text-xs font-semibold text-brown-900">
              {t.author} <span className="font-normal text-brown-700/70">{t.context}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
