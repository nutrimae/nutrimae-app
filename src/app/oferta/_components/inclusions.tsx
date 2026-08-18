import { CheckCircle2 } from "lucide-react";

const ITEMS = [
  ["Cardápio semanal", "montado para a idade do seu bebê"],
  ["Guia de cortes seguros", "alimento por alimento"],
  ["Lista de compras", "pronta para cada semana"],
  ["Comunidade de mães", "para trocar experiências"],
  ["Acesso ao app completo", "sem módulos bloqueados"],
  ["Modo de preparo e temperos", "indicados por fase"],
  ["Receitas rápidas", "para os dias corridos"],
  ["Novos conteúdos", "incluídos no mesmo acesso"],
] as const;

export function Inclusions() {
  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8">
      <h2 className="text-center font-heading text-xl font-bold text-brown-800">
        Tudo o que está incluso no seu acesso
      </h2>
      <p className="mt-1 text-center text-sm text-brown-700/70">
        Um único acesso reúne tudo. Nada é vendido separadamente.
      </p>

      <ul className="mt-5 flex flex-col gap-3 rounded-3xl bg-cream-deep p-5">
        {ITEMS.map(([bold, rest]) => (
          <li key={bold} className="flex items-start gap-2.5 text-sm text-brown-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" strokeWidth={2.25} />
            <span>
              <strong className="font-bold text-brown-800">{bold}</strong> {rest}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
