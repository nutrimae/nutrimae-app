import Link from "next/link";
import { CheckCircle2, AlertTriangle, Info, ListChecks } from "lucide-react";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { BackButton } from "@/components/back-button";
import { ListenButton } from "@/components/listen-button";
import { getServerLocale } from "@/lib/i18n/get-server-locale";

export const MILD_SIGNS = [
  "Pequenas manchinhas vermelhas ao redor da boca",
  "Leve vermelhidão na pele em uma pequena área",
  "Coceira leve, localizada",
  "Fezes um pouco mais moles do que o normal",
  "Pequeno desconforto ou gases após a refeição",
];

export const SEVERE_SIGNS = [
  "Inchaço no rosto, lábios, língua ou olhos",
  "Dificuldade para respirar ou chiado no peito",
  "Vômitos repetidos, logo após comer",
  "Urticária (manchas) espalhada pelo corpo, não só perto da boca",
  "Sonolência excessiva ou moleza incomum",
  "Diarreia com sangue",
];

export const MILD_SIGNS_ES = [
  "Manchitas rojas pequeñas alrededor de la boca",
  "Leve enrojecimiento de la piel en una zona pequeña",
  "Picazón leve y localizada",
  "Heces un poco más blandas de lo normal",
  "Pequeña molestia o gases después de la comida",
];

export const SEVERE_SIGNS_ES = [
  "Hinchazón en el rostro, labios, lengua u ojos",
  "Dificultad para respirar o silbido en el pecho",
  "Vómitos repetidos, justo después de comer",
  "Urticaria (manchas) extendida por el cuerpo, no solo cerca de la boca",
  "Somnolencia excesiva o debilidad inusual",
  "Diarrea con sangre",
];

export default async function AlergiaPage() {
  const locale = await getServerLocale();
  const es = locale === "es";
  const mildSigns = es ? MILD_SIGNS_ES : MILD_SIGNS;
  const severeSigns = es ? SEVERE_SIGNS_ES : SEVERE_SIGNS;

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <div className="sticky top-0 z-40 flex gap-3 bg-terracotta-600 px-4 py-4 text-white shadow-md">
        <Info className="h-6 w-6 shrink-0" strokeWidth={2} />
        <p className="text-sm font-medium">
          {es
            ? "Esta guía es un apoyo de observación y no sustituye la evaluación médica. En caso de duda o síntoma grave, busque atención inmediata."
            : "Este guia é um apoio de observação e não substitui avaliação médica. Em caso de dúvida ou sintoma grave, procure atendimento imediato."}
        </p>
      </div>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-6">
        <BackButton />

        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-800">
            {es ? "Señales de alergia alimentaria" : "Sinais de alergia alimentar"}
          </h1>
          <p className="mt-1 text-brown-700">
            {es
              ? "Después de introducir un alimento nuevo, observe al bebé durante 3 a 5 días antes de ofrecer otro alimento nuevo."
              : "Depois de introduzir um alimento novo, observe o bebê por 3 a 5 dias antes de oferecer outro alimento novo."}
          </p>
          <ListenButton
            contentType="allergy"
            contentId="guia-alergia"
            text={
              es
                ? `Señales de alergia alimentaria. Después de introducir un alimento nuevo, observe al bebé durante 3 a 5 días antes de ofrecer otro alimento nuevo. Señales leves, observar: ${mildSigns.join(". ")}. Señales de alerta grave, atención inmediata: ${severeSigns.join(". ")}.`
                : `Sinais de alergia alimentar. Depois de introduzir um alimento novo, observe o bebê por 3 a 5 dias antes de oferecer outro alimento novo. Sinais leves, observar: ${mildSigns.join(". ")}. Sinais de alerta grave, atendimento imediato: ${severeSigns.join(". ")}.`
            }
            className="mt-3"
          />
        </div>

        <Link
          href="/app/alergia/checklist"
          className="flex items-center gap-3 rounded-2xl bg-primary-100 p-4 text-primary-600"
        >
          <ListChecks className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="font-semibold">
            {es
              ? "Marcar alergénicos conocidos y filtrar recetas automáticamente"
              : "Marcar alergênicos conhecidos e filtrar receitas automaticamente"}
          </span>
        </Link>

        <div>
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-sage-700">
            <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
            {es ? "Señales leves — observar" : "Sinais leves — observar"}
          </h2>
          <ul className="flex flex-col gap-2">
            {mildSigns.map((sign) => (
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
            {es ? "Señales de alerta grave — atención inmediata" : "Sinais de alerta grave — atendimento imediato"}
          </h2>
          <ul className="flex flex-col gap-2">
            {severeSigns.map((sign) => (
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

        <p className="text-center text-sm text-brown-700/90">
          {es
            ? "Ante cualquier señal de alerta grave, llame a los servicios de emergencia o acuda de inmediato al centro de urgencias más cercano."
            : "Diante de qualquer sinal de alerta grave, ligue 192 ou vá ao pronto-socorro mais próximo imediatamente."}
        </p>

        <MedicalDisclaimerFooter />
      </main>
    </div>
  );
}
