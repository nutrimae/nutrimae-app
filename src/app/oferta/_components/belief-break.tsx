import { X, Check } from "lucide-react";

const COLUMNS = [
  {
    title: "PDF ou e-book parado",
    negative: true,
    points: [
      "Não sabe a idade do seu bebê",
      "Você garimpa a resposta em páginas soltas",
      "Nunca muda quando o bebê muda",
    ],
  },
  {
    title: "Grupo de WhatsApp",
    negative: true,
    points: ["Opinião solta, sem fonte", "Rola pra cima e some", "Difícil de achar de novo quando precisa"],
  },
  {
    title: "NutriMãe",
    negative: false,
    points: [
      "Organizado pela fase que você escolheu acima",
      "Busca em 2 toques, no celular",
      "Atualiza junto com o crescimento do bebê",
    ],
  },
];

export function BeliefBreak() {
  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8">
      <h2 className="text-center font-heading text-xl font-bold text-brown-800">
        Onde a informação costuma se perder
      </h2>

      <div className="mt-5 flex flex-col gap-3">
        {COLUMNS.map((column) => (
          <div
            key={column.title}
            className={`rounded-2xl border-2 p-4 ${
              column.negative ? "border-transparent bg-cream-deep" : "border-primary-500 bg-primary-100"
            }`}
          >
            <h3
              className={`font-heading text-base font-bold ${
                column.negative ? "text-brown-700" : "text-primary-600"
              }`}
            >
              {column.title}
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {column.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-brown-700">
                  {column.negative ? (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-brown-700/40" strokeWidth={2.5} />
                  ) : (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" strokeWidth={2.5} />
                  )}
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
