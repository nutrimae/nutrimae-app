import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";

const MILD_SIGNS = [
  "Pequenas manchinhas vermelhas ao redor da boca",
  "Leve vermelhidão na pele em uma pequena área",
  "Coceira leve, localizada",
  "Fezes um pouco mais moles do que o normal",
  "Pequeno desconforto ou gases após a refeição",
];

const SEVERE_SIGNS = [
  "Inchaço no rosto, lábios, língua ou olhos",
  "Dificuldade para respirar ou chiado no peito",
  "Vômitos repetidos, logo após comer",
  "Urticária (manchas) espalhada pelo corpo, não só perto da boca",
  "Sonolência excessiva ou moleza incomum",
  "Diarreia com sangue",
];

export default function AlergiaPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <div className="sticky top-0 z-40 flex gap-3 bg-terracotta-600 px-4 py-4 text-white shadow-md">
        <Info className="h-6 w-6 shrink-0" strokeWidth={2} />
        <p className="text-sm font-medium">
          Este guia é um apoio de observação e não substitui avaliação médica. Em caso
          de dúvida ou sintoma grave, procure atendimento imediato.
        </p>
      </div>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-800">
            Sinais de alergia alimentar
          </h1>
          <p className="mt-1 text-brown-700">
            Depois de introduzir um alimento novo, observe o bebê por 3 a 5 dias antes
            de oferecer outro alimento novo.
          </p>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-sage-700">
            <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
            Sinais leves — observar
          </h2>
          <ul className="flex flex-col gap-2">
            {MILD_SIGNS.map((sign) => (
              <li
                key={sign}
                className="flex items-center gap-3 rounded-2xl bg-sage-50 px-4 py-3"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-500" strokeWidth={2} />
                <span className="text-brown-800">{sign}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-red-700">
            <AlertTriangle className="h-5 w-5" strokeWidth={2} />
            Sinais de alerta grave — atendimento imediato
          </h2>
          <ul className="flex flex-col gap-2">
            {SEVERE_SIGNS.map((sign) => (
              <li
                key={sign}
                className="flex items-center gap-3 rounded-2xl bg-red-100 px-4 py-3"
              >
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} />
                <span className="text-brown-800">{sign}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-sm text-brown-700/70">
          Diante de qualquer sinal de alerta grave, ligue 192 ou vá ao pronto-socorro
          mais próximo imediatamente.
        </p>

        <MedicalDisclaimerFooter />
      </main>
    </div>
  );
}
