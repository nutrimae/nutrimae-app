import { Star } from "lucide-react";

// PLACEHOLDER VISÍVEL PROIBIDO: nunca renderizar nome/depoimento inventado.
// Enquanto não houver relato real e autorizado, mostramos este estado vazio
// elegante em vez de um card fake. Assim que houver depoimento real, troque
// o conteúdo deste componente pelo card com nome, foto e texto do relato,
// sempre focado em ORGANIZAÇÃO/ROTINA — nunca em resultado de saúde do bebê
// (peso, desenvolvimento, cura de seletividade, alergia).
export function Testimonial() {
  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8">
      <p className="text-center text-xs font-bold uppercase tracking-wide text-brown-700/60">
        O que as mães estão dizendo
      </p>

      <div className="mt-3 rounded-3xl bg-cream-deep p-6 text-center">
        <div className="mx-auto flex w-fit gap-0.5 text-peach-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
          ))}
        </div>
        <p className="mt-3 text-sm font-medium text-brown-700">
          Estamos coletando os primeiros relatos das mães que entraram esta semana.
        </p>
        <p className="mt-1 text-xs text-brown-700/60">
          Assim que tivermos depoimentos reais e autorizados, eles aparecem aqui.
        </p>
      </div>
    </section>
  );
}
