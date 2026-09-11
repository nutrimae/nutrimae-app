"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Volume2,
  VolumeX,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  Thermometer,
  Activity,
  ShieldAlert,
  Baby,
  PersonStanding,
} from "lucide-react";
import { BackButton as PageBackButton } from "@/components/back-button";
import { ListenButton } from "@/components/listen-button";
import { useLocale } from "@/lib/use-locale";

// Rota pública do Manual S.O.S. — sem login, sem assinatura, sem oferta.
// Fica fora de /app de propósito: não pode depender de ActiveBabyProvider
// (contexto só disponível para usuárias autenticadas). A escolha de faixa
// etária para a manobra de desengasgo é feita manualmente aqui, pela mesma
// razão — nunca adivinhar.
//
// Número de emergência (2026-09-10): essa página inteira estava hardcoded
// em português com o SAMU do Brasil (192) — foi ao ar assim pro Chile, o
// que é grave (192 não funciona lá). Hoje o app só comercializa no Chile
// no locale "es", então o número usado no branch es é o SAMU chileno (131).
// Se/quando expandir pra outros países de língua espanhola, isso precisa
// virar um número por país, não só por idioma.

type View = "identify" | "reflex" | "choking" | "gag_info" | "allergy" | "gut" | "fever";
type AgeGroup = "infant" | "child";

export function getInfantSteps(es: boolean): { title: string; text: string }[] {
  return es
    ? [
        {
          title: "Ponlo boca abajo sobre tu antebrazo",
          text: "Apoya al bebé boca abajo sobre tu antebrazo, con la cabeza más baja que el cuerpo. Sostén el mentón con los dedos, sin apretar el cuello.",
        },
        {
          title: "5 golpes firmes en la espalda",
          text: "Con el talón de la mano, da hasta 5 golpes firmes entre los omóplatos, de abajo hacia arriba.",
        },
        {
          title: "Si no sale, gíralo boca arriba",
          text: "Aún con la cabeza más baja que el cuerpo, aplica hasta 5 compresiones en el medio del pecho, dos dedos debajo de la línea de los pezones.",
        },
        {
          title: "Repite el ciclo",
          text: "Alterna 5 golpes en la espalda y 5 compresiones en el pecho hasta que el objeto salga o el bebé llore y respire.",
        },
        {
          title: "Si pierde la conciencia",
          text: "Inicia maniobras de reanimación si sabes cómo, y mantén la llamada con el SAMU (131) todo el tiempo.",
        },
      ]
    : [
        {
          title: "Vire de bruços no seu antebraço",
          text: "Apoie o bebê de bruços sobre seu antebraço, com a cabeça mais baixa que o corpo. Segure o queixo com os dedos, sem apertar o pescoço.",
        },
        {
          title: "5 tapinhas firmes nas costas",
          text: "Com o calcanhar da mão, dê até 5 tapinhas firmes entre as omoplatas, de baixo para cima.",
        },
        {
          title: "Se não sair, vire de barriga para cima",
          text: "Ainda com a cabeça mais baixa que o corpo, aplique até 5 compressões no meio do peito, dois dedos abaixo da linha dos mamilos.",
        },
        {
          title: "Repita o ciclo",
          text: "Alterne 5 tapinhas nas costas e 5 compressões no peito até o objeto sair ou o bebê chorar e respirar.",
        },
        {
          title: "Se ele perder a consciência",
          text: "Inicie manobras de reanimação se souber como, e mantenha a ligação com o SAMU (192) o tempo todo.",
        },
      ];
}

export function getChildSteps(es: boolean): { title: string; text: string }[] {
  return es
    ? [
        {
          title: "Ponte detrás del niño",
          text: "Arrodíllate o agáchate detrás de él, a la altura de su cuerpo.",
        },
        {
          title: "Coloca el puño arriba del ombligo",
          text: "Cierra un puño y colócalo justo arriba del ombligo, con el pulgar hacia adentro.",
        },
        {
          title: "Compresiones hacia adentro y hacia arriba",
          text: "Envuelve el puño con la otra mano y haz compresiones rápidas, hacia adentro y hacia arriba, con firmeza.",
        },
        {
          title: "Repite hasta que se destape",
          text: "Continúa las compresiones hasta que el objeto salga o el niño logre toser, llorar o respirar.",
        },
        {
          title: "Si pierde la conciencia",
          text: "Inicia maniobras de reanimación si sabes cómo, y mantén la llamada con el SAMU (131) todo el tiempo.",
        },
      ]
    : [
        {
          title: "Fique atrás da criança",
          text: "Ajoelhe-se ou abaixe-se atrás dela, na altura do corpo dela.",
        },
        {
          title: "Posicione o punho acima do umbigo",
          text: "Feche um punho e posicione logo acima do umbigo, com o polegar voltado para dentro.",
        },
        {
          title: "Compressões para dentro e para cima",
          text: "Envolva o punho com a outra mão e faça compressões rápidas, para dentro e para cima, com firmeza.",
        },
        {
          title: "Repita até desengasgar",
          text: "Continue as compressões até o objeto sair ou a criança conseguir tossir, chorar ou respirar.",
        },
        {
          title: "Se ela perder a consciência",
          text: "Inicie manobras de reanimação se souber como, e mantenha a ligação com o SAMU (192) o tempo todo.",
        },
      ];
}

// Textos narrados pelo ListenButton — precisam ser EXATAMENTE o texto exibido
// na tela correspondente (ver regra em src/lib/tts.ts), montados aqui uma vez
// pra não divergir se o JSX for editado depois.
export function getReflexText(es: boolean): string {
  return es
    ? "Esto es buena señal — no hagas maniobras. Si está tosiendo, llorando o haciendo ruido, las vías respiratorias todavía están parcialmente libres y el propio cuerpo está tratando de expulsar el alimento. Intervenir ahora puede empujar el objeto más adentro. Qué hacer: Mantén la calma y quédate cerca, sin quitarle los ojos de encima al niño. Anímalo a toser — no le des golpes en la espalda ni metas los dedos en su boca. Observa: la tos debería ceder en pocos minutos. Si la tos deja de hacer ruido, la cara cambia de color o deja de respirar, cambia de inmediato a la maniobra de atragantamiento de abajo."
    : "Isso é bom sinal — não faça manobras. Se está tossindo, chorando ou fazendo barulho, as vias aéreas ainda estão parcialmente livres e o próprio corpo está tentando expulsar o alimento. Intervir agora pode empurrar o objeto mais fundo. O que fazer: Fique calma e por perto, sem tirar os olhos da criança. Incentive a tosse — não bata nas costas nem coloque os dedos na boca dela. Observe: a tosse deve ceder em poucos minutos. Se a tosse parar de fazer ruído, o rosto mudar de cor ou ela parar de respirar, mude imediatamente para a manobra de engasgo abaixo.";
}

export function getGagInfoText(es: boolean): string {
  return es
    ? "Reflejo de náusea (arcada) vs. atragantamiento real. Reflejo de náusea — normal y protector: Tos fuerte, la cara puede ponerse roja, los ojos pueden lagrimear, pero el bebé sigue respirando y haciendo ruido. Es el cuerpo aprendiendo a manejar texturas nuevas — común en la introducción alimentaria. Atragantamiento real — emergencia: Silencio (sin toser, sin llorar), dificultad visible para respirar, cara morada o azulada. Aquí no se espera — ve directo a la maniobra de desatragantamiento. En casa, ante el reflejo de náusea: Deja que el bebé tosa por sí solo. No le des golpes en la espalda ni metas los dedos en su boca. Quédate cerca, con calma, observando."
    : "Reflexo de tosse (gag) vs. engasgo real. Gag reflex — normal e protetor: Tosse forte, rosto pode ficar vermelho, olhos podem lacrimejar, mas o bebê continua respirando e fazendo barulho. É o corpo aprendendo a lidar com texturas novas — comum na introdução alimentar. Engasgo real — emergência: Silêncio (sem tossir, sem chorar), dificuldade visível pra respirar, rosto roxo ou azulado. Aqui não se espera — vá direto pra manobra de desengasgo. Em casa, no gag: Deixe o bebê tossir por conta própria. Não bata nas costas nem coloque os dedos na boca dele. Fique por perto, calma, observando.";
}

export function getAllergySosText(es: boolean): string {
  return es
    ? "Reacción alérgica — identificar rápido. Señales leves: Picazón leve en la boca, pequeñas ronchas rojas cerca de la boca. Señales moderadas: Hinchazón en los labios, vómito, diarrea. Señales graves: Dificultad para respirar, hinchazón en la garganta o en la cara. Qué hacer: Retira el alimento y observa de cerca. Señales leves/moderadas: habla con el pediatra lo antes posible. Señales graves: llama al 131 de inmediato."
    : "Reação alérgica — identificar rápido. Sinais leves: Coceira leve na boca, pequenas bolinhas de vermelhidão perto da boca. Sinais moderados: Inchaço nos lábios, vômito, diarreia. Sinais graves: Dificuldade pra respirar, inchaço na garganta ou no rosto. O que fazer: Remova o alimento e observe de perto. Sinais leves/moderados: fale com o pediatra o quanto antes. Sinais graves: ligue 192 imediatamente.";
}

export function getGutText(es: boolean): string {
  return es
    ? "Estreñimiento vs. diarrea. La frecuencia de las evacuaciones varía bastante de un bebé a otro — eso por sí solo no es motivo de alarma. Señales de alerta — estreñimiento: Deposiciones muy duras, esfuerzo visible, molestia. Señales de alerta — diarrea: Más de 8 evacuaciones por día, deposiciones muy líquidas. Soluciones caseras simples: Ofrece más agua durante el día. Frutas ricas en fibra (ciruela, papaya, pera) ayudan con el estreñimiento. Mantén la hidratación como prioridad durante episodios de diarrea. Consulta al pediatra si dura más de 2 días, hay sangre en las deposiciones, fiebre junto, o señales de deshidratación."
    : "Constipação vs. diarreia. A frequência das evacuações varia bastante de bebê pra bebê — isso sozinho não é motivo de alarme. Sinais de alerta — constipação: Fezes muito duras, esforço visível, desconforto. Sinais de alerta — diarreia: Mais de 8 evacuações por dia, fezes bem líquidas. Soluções caseiras simples: Ofereça mais água ao longo do dia. Frutas ricas em fibra (ameixa, mamão, pera) ajudam na constipação. Mantenha a hidratação em foco durante episódios de diarreia. Procure o pediatra se durar mais de 2 dias, tiver sangue nas fezes, febre junto, ou sinais de desidratação.";
}

export function getFeverText(es: boolean): string {
  return es
    ? "Fiebre después de una comida nueva. El alimento, por sí solo, no causa fiebre — quienes causan fiebre son las infecciones (virus, bacterias). Si la fiebre apareció cerca de una comida nueva, probablemente sea coincidencia, no alergia. Qué hacer: Mantén al bebé bien hidratado. Ofrece alimentos livianos, sin forzar. Fiebre por encima de 38°C, o muy decaído: consulta al pediatra."
    : "Febre depois de uma refeição nova. Alimento, por si só, não causa febre — quem causa febre são infecções (vírus, bactérias). Se a febre apareceu perto de uma refeição nova, provavelmente é coincidência, não alergia. O que fazer: Mantenha o bebê bem hidratado. Ofereça alimentos leves, sem forçar. Febre acima de 38°C, ou muito abatido: procure o pediatra.";
}

function getExtraTopics(es: boolean): { view: View; icon: typeof HelpCircle; title: string }[] {
  return [
    {
      view: "gag_info",
      icon: HelpCircle,
      title: es ? "Reflejo de náusea (arcada) vs. atragantamiento real" : "Reflexo de tosse (gag) vs. engasgo real",
    },
    {
      view: "allergy",
      icon: ShieldAlert,
      title: es ? "Reacción alérgica — identificar rápido" : "Reação alérgica — identificar rápido",
    },
    { view: "gut", icon: Activity, title: es ? "Estreñimiento vs. diarrea" : "Constipação vs. diarreia" },
    {
      view: "fever",
      icon: Thermometer,
      title: es ? "Fiebre después de una comida nueva" : "Febre depois de uma refeição nova",
    },
  ];
}

function CallSamuBar({ es }: { es: boolean }) {
  const number = es ? "131" : "192";
  return (
    <a
      href={`tel:${number}`}
      className="sticky top-0 z-40 flex min-h-16 items-center justify-center gap-3 bg-red-600 px-4 text-lg font-bold text-white shadow-md"
    >
      <Phone className="h-6 w-6" strokeWidth={2.25} />
      {es ? `Llamar al ${number} ahora (SAMU)` : `Ligar ${number} agora (SAMU)`}
    </a>
  );
}

function BackButton({ onClick, es }: { onClick: () => void; es: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      {es ? "Volver" : "Voltar"}
    </button>
  );
}

function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {items.map((text) => (
        <li key={text} className="flex gap-3 text-brown-800">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sage-500" />
          {text}
        </li>
      ))}
    </ul>
  );
}

function AgeGroupPicker({ onPick, es }: { onPick: (group: AgeGroup) => void; es: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-brown-800">
        {es
          ? "Para la maniobra correcta, primero indica la edad de quien se está atragantando:"
          : "Para a manobra certa, primeiro diga a faixa de idade de quem está engasgando:"}
      </p>
      <button
        type="button"
        onClick={() => onPick("infant")}
        className="flex min-h-16 items-center gap-3 rounded-2xl bg-white/80 p-4 text-left shadow-sm shadow-brown-900/5 active:bg-sage-50"
      >
        <Baby className="h-7 w-7 shrink-0 text-sage-600" strokeWidth={1.75} />
        <span className="font-heading text-lg font-bold text-brown-800">
          {es ? "Bebé hasta 1 año" : "Bebê até 1 ano"}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onPick("child")}
        className="flex min-h-16 items-center gap-3 rounded-2xl bg-white/80 p-4 text-left shadow-sm shadow-brown-900/5 active:bg-sage-50"
      >
        <PersonStanding className="h-7 w-7 shrink-0 text-sage-600" strokeWidth={1.75} />
        <span className="font-heading text-lg font-bold text-brown-800">
          {es ? "Niño mayor de 1 año" : "Criança acima de 1 ano"}
        </span>
      </button>
    </div>
  );
}

export default function SosPage() {
  const [view, setView] = useState<View>("identify");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const { locale } = useLocale();
  const es = locale === "es";
  const samuNumber = es ? "131" : "192";

  // Registrar Service Worker para cache offline dos áudios do S.O.S.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silent fail — SW é opcional, o app funciona sem ele
      });
    }
  }, []);

  const isInfant = ageGroup === "infant";
  const steps = isInfant ? getInfantSteps(es) : getChildSteps(es);
  const extraTopics = getExtraTopics(es);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <CallSamuBar es={es} />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-5 px-4 py-6">
        {view === "identify" && (
          <>
            <PageBackButton fallbackHref="/" />

            <div>
              <h1 className="font-heading text-2xl font-bold text-brown-800">
                {es ? "Manual S.O.S. — Antes de actuar, identifica" : "Manual S.O.S. — Antes de agir, identifique"}
              </h1>
              <p className="mt-1 text-brown-700">
                {es
                  ? "Toca la situación que más se parece a lo que está pasando ahora."
                  : "Toque na situação que mais parece com o que está acontecendo agora."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setView("reflex")}
              className="flex min-h-24 items-center gap-4 rounded-3xl bg-sage-100 p-5 text-left active:bg-sage-200"
            >
              <Volume2 className="h-10 w-10 shrink-0 text-sage-600" strokeWidth={1.75} />
              <div>
                <p className="font-heading text-lg font-bold text-brown-800">
                  {es ? "Está tosiendo, llorando o haciendo ruido" : "Está tossindo, chorando ou fazendo barulho"}
                </p>
                <p className="mt-1 text-sm text-brown-700/80">
                  {es
                    ? "Probablemente es reflejo de náusea o atragantamiento leve (gag reflex)."
                    : "Provavelmente é reflexo de tosse ou engasgo leve (gag reflex)."}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setView("choking")}
              className="flex min-h-24 items-center gap-4 rounded-3xl bg-red-100 p-5 text-left active:bg-red-200"
            >
              <VolumeX className="h-10 w-10 shrink-0 text-red-600" strokeWidth={1.75} />
              <div>
                <p className="font-heading text-lg font-bold text-red-700">
                  {es ? "Sin toser, sin llorar, sin poder respirar" : "Sem tossir, sem chorar, sem conseguir respirar"}
                </p>
                <p className="mt-1 text-sm text-red-700/80">
                  {es
                    ? "Cara morada o azulada, boca abierta sin sonido. Esto es un atragantamiento real."
                    : "Rosto roxo ou azulado, boca aberta sem som. Isso é engasgo real."}
                </p>
              </div>
            </button>

            <p className="mt-2 rounded-2xl bg-peach-100 p-4 text-sm text-brown-700">
              {es
                ? `Esta guía es un resumen educativo y no reemplaza un curso certificado de primeros auxilios. Ante cualquier duda, llama al ${samuNumber} de inmediato.`
                : `Este guia é um resumo educativo e não substitui um curso certificado de primeiros socorros. Em qualquer dúvida, ligue ${samuNumber} imediatamente.`}
            </p>

            <div>
              <h2 className="mb-2 font-heading text-base font-bold text-brown-800">
                {es ? "Otras dudas del día a día" : "Outras dúvidas do dia a dia"}
              </h2>
              <div className="flex flex-col gap-2">
                {extraTopics.map((topic) => (
                  <button
                    key={topic.view}
                    type="button"
                    onClick={() => setView(topic.view)}
                    className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/80 px-4 text-left shadow-sm shadow-brown-900/5"
                  >
                    <topic.icon className="h-5 w-5 shrink-0 text-sage-600" strokeWidth={2} />
                    <span className="font-semibold text-brown-800">{topic.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {view === "reflex" && (
          <>
            <BackButton es={es} onClick={() => setView("identify")} />

            <div className="rounded-3xl bg-sage-100 p-6">
              <p className="font-heading text-xl font-bold text-brown-800">
                {es ? "Esto es buena señal — no hagas maniobras" : "Isso é bom sinal — não faça manobras"}
              </p>
              <p className="mt-3 text-lg text-brown-800">
                {es
                  ? "Si está tosiendo, llorando o haciendo ruido, las vías respiratorias todavía están parcialmente libres y el propio cuerpo está tratando de expulsar el alimento. Intervenir ahora puede empujar el objeto más adentro."
                  : "Se está tossindo, chorando ou fazendo barulho, as vias aéreas ainda estão parcialmente livres e o próprio corpo está tentando expulsar o alimento. Intervir agora pode empurrar o objeto mais fundo."}
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">{es ? "Qué hacer" : "O que fazer"}</p>
              <InfoList
                items={
                  es
                    ? [
                        "Mantén la calma y quédate cerca, sin quitarle los ojos de encima al niño.",
                        "Anímalo a toser — no le des golpes en la espalda ni metas los dedos en su boca.",
                        "Observa: la tos debería ceder en pocos minutos.",
                        "Si la tos deja de hacer ruido, la cara cambia de color o deja de respirar, cambia de inmediato a la maniobra de atragantamiento de abajo.",
                      ]
                    : [
                        "Fique calma e por perto, sem tirar os olhos da criança.",
                        "Incentive a tosse — não bata nas costas nem coloque os dedos na boca dela.",
                        "Observe: a tosse deve ceder em poucos minutos.",
                        "Se a tosse parar de fazer ruído, o rosto mudar de cor ou ela parar de respirar, mude imediatamente para a manobra de engasgo abaixo.",
                      ]
                }
              />
            </div>

            <ListenButton contentType="sos" contentId="reflex" text={getReflexText(es)} className="w-fit" />

            <button
              type="button"
              onClick={() => setView("choking")}
              className="mt-2 min-h-14 rounded-2xl border-2 border-red-200 text-base font-semibold text-red-600"
            >
              {es ? "¿Empeoró? Ver maniobra de atragantamiento" : "Piorou? Ver manobra de engasgo"}
            </button>
          </>
        )}

        {view === "choking" && (
          <>
            <BackButton
              es={es}
              onClick={() => {
                setView("identify");
                setAgeGroup(null);
              }}
            />

            {ageGroup === null ? (
              <AgeGroupPicker es={es} onPick={setAgeGroup} />
            ) : (
              <>
                <div className="flex items-start gap-3 rounded-3xl bg-red-100 p-5">
                  <AlertTriangle className="h-7 w-7 shrink-0 text-red-600" strokeWidth={2} />
                  <div>
                    <p className="font-heading text-lg font-bold text-red-700">
                      {es
                        ? `Maniobra de desatragantamiento — ${isInfant ? "bebé hasta 1 año" : "niño mayor de 1 año"}`
                        : `Manobra de desengasgo — ${isInfant ? "bebê até 1 ano" : "criança acima de 1 ano"}`}
                    </p>
                    <p className="mt-1 text-sm text-red-700/80">
                      {es
                        ? `Pide a alguien que llame al ${samuNumber} mientras actúas. Si estás sola, haz la maniobra durante 1 minuto antes de detenerte a llamar.`
                        : `Peça para alguém ligar ${samuNumber} enquanto você age. Se estiver sozinha, faça a manobra por 1 minuto antes de parar para ligar.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAgeGroup(null)}
                  className="w-fit text-xs font-semibold text-sage-600 underline"
                >
                  {es ? "Cambiar la edad" : "Trocar faixa de idade"}
                </button>

                <ol className="flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <li key={step.title} className="flex gap-4 rounded-3xl bg-white/80 p-5 shadow-sm shadow-brown-900/5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 font-heading text-lg font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-heading text-lg font-bold text-brown-800">
                          {step.title}
                        </p>
                        <p className="mt-1 text-brown-700">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <ListenButton
                  contentType="sos"
                  contentId={`engasgo-${ageGroup}`}
                  text={steps
                    .map((s, i) => (es ? `Paso ${i + 1}: ${s.title}. ${s.text}` : `Passo ${i + 1}: ${s.title}. ${s.text}`))
                    .join(" ")}
                  className="mt-3"
                />

                <p className="mt-2 rounded-2xl bg-peach-100 p-4 text-sm text-brown-700">
                  {es
                    ? `Resumen educativo, no reemplaza un entrenamiento certificado. Llama al ${samuNumber} de inmediato y continúa las maniobras hasta que llegue ayuda o se destape.`
                    : `Resumo educativo, não substitui treinamento certificado. Ligue ${samuNumber} imediatamente e continue as manobras até o socorro chegar ou desengasgar.`}
                </p>
              </>
            )}
          </>
        )}

        {view === "gag_info" && (
          <>
            <BackButton es={es} onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              {es ? "Reflejo de náusea (arcada) vs. atragantamiento real" : "Reflexo de tosse (gag) vs. engasgo real"}
            </h1>

            <div className="rounded-3xl bg-sage-100 p-5">
              <p className="font-heading font-bold text-brown-800">
                {es ? "Reflejo de náusea — normal y protector" : "Gag reflex — normal e protetor"}
              </p>
              <p className="mt-2 text-brown-800">
                {es
                  ? "Tos fuerte, la cara puede ponerse roja, los ojos pueden lagrimear, pero el bebé sigue respirando y haciendo ruido. Es el cuerpo aprendiendo a manejar texturas nuevas — común en la introducción alimentaria."
                  : "Tosse forte, rosto pode ficar vermelho, olhos podem lacrimejar, mas o bebê continua respirando e fazendo barulho. É o corpo aprendendo a lidar com texturas novas — comum na introdução alimentar."}
              </p>
            </div>

            <div className="rounded-3xl bg-red-100 p-5">
              <p className="font-heading font-bold text-red-700">
                {es ? "Atragantamiento real — emergencia" : "Engasgo real — emergência"}
              </p>
              <p className="mt-2 text-brown-800">
                {es
                  ? "Silencio (sin toser, sin llorar), dificultad visible para respirar, cara morada o azulada. Aquí no se espera — ve directo a la maniobra de desatragantamiento."
                  : "Silêncio (sem tossir, sem chorar), dificuldade visível pra respirar, rosto roxo ou azulado. Aqui não se espera — vá direto pra manobra de desengasgo."}
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">
                {es ? "En casa, ante el reflejo de náusea" : "Em casa, no gag"}
              </p>
              <InfoList
                items={
                  es
                    ? [
                        "Deja que el bebé tosa por sí solo.",
                        "No le des golpes en la espalda ni metas los dedos en su boca.",
                        "Quédate cerca, con calma, observando.",
                      ]
                    : [
                        "Deixe o bebê tossir por conta própria.",
                        "Não bata nas costas nem coloque os dedos na boca dele.",
                        "Fique por perto, calma, observando.",
                      ]
                }
              />
            </div>

            <ListenButton contentType="sos" contentId="gag-info" text={getGagInfoText(es)} className="w-fit" />

            <button
              type="button"
              onClick={() => setView("choking")}
              className="mt-2 min-h-14 rounded-2xl border-2 border-red-200 text-base font-semibold text-red-600"
            >
              {es ? "¿Es un atragantamiento real? Ver maniobra" : "É engasgo real? Ver manobra"}
            </button>
          </>
        )}

        {view === "allergy" && (
          <>
            <BackButton es={es} onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              {es ? "Reacción alérgica — identificar rápido" : "Reação alérgica — identificar rápido"}
            </h1>

            <div className="rounded-2xl bg-sage-50 p-4">
              <p className="font-heading font-bold text-sage-700">{es ? "Señales leves" : "Sinais leves"}</p>
              <p className="mt-1 text-brown-800">
                {es
                  ? "Picazón leve en la boca, pequeñas ronchas rojas cerca de la boca."
                  : "Coceira leve na boca, pequenas bolinhas de vermelhidão perto da boca."}
              </p>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-4">
              <p className="font-heading font-bold text-yellow-800">{es ? "Señales moderadas" : "Sinais moderados"}</p>
              <p className="mt-1 text-brown-800">
                {es ? "Hinchazón en los labios, vómito, diarrea." : "Inchaço nos lábios, vômito, diarreia."}
              </p>
            </div>
            <div className="rounded-2xl bg-red-100 p-4">
              <p className="font-heading font-bold text-red-700">{es ? "Señales graves" : "Sinais graves"}</p>
              <p className="mt-1 text-brown-800">
                {es
                  ? "Dificultad para respirar, hinchazón en la garganta o en la cara."
                  : "Dificuldade pra respirar, inchaço na garganta ou no rosto."}
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">{es ? "Qué hacer" : "O que fazer"}</p>
              <InfoList
                items={
                  es
                    ? [
                        "Retira el alimento y observa de cerca.",
                        "Señales leves/moderadas: habla con el pediatra lo antes posible.",
                        `Señales graves: llama al ${samuNumber} de inmediato.`,
                      ]
                    : [
                        "Remova o alimento e observe de perto.",
                        "Sinais leves/moderados: fale com o pediatra o quanto antes.",
                        `Sinais graves: ligue ${samuNumber} imediatamente.`,
                      ]
                }
              />
            </div>

            <ListenButton contentType="sos" contentId="allergy" text={getAllergySosText(es)} className="w-fit" />
          </>
        )}

        {view === "gut" && (
          <>
            <BackButton es={es} onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              {es ? "Estreñimiento vs. diarrea" : "Constipação vs. diarreia"}
            </h1>

            <p className="text-brown-800">
              {es
                ? "La frecuencia de las evacuaciones varía bastante de un bebé a otro — eso por sí solo no es motivo de alarma."
                : "A frequência das evacuações varia bastante de bebê pra bebê — isso sozinho não é motivo de alarme."}
            </p>

            <div className="rounded-2xl bg-yellow-100 p-4">
              <p className="font-heading font-bold text-yellow-800">
                {es ? "Señales de alerta — estreñimiento" : "Sinais de alerta — constipação"}
              </p>
              <p className="mt-1 text-brown-800">
                {es ? "Deposiciones muy duras, esfuerzo visible, molestia." : "Fezes muito duras, esforço visível, desconforto."}
              </p>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-4">
              <p className="font-heading font-bold text-yellow-800">
                {es ? "Señales de alerta — diarrea" : "Sinais de alerta — diarreia"}
              </p>
              <p className="mt-1 text-brown-800">
                {es
                  ? "Más de 8 evacuaciones por día, deposiciones muy líquidas."
                  : "Mais de 8 evacuações por dia, fezes bem líquidas."}
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">
                {es ? "Soluciones caseras simples" : "Soluções caseiras simples"}
              </p>
              <InfoList
                items={
                  es
                    ? [
                        "Ofrece más agua durante el día.",
                        "Frutas ricas en fibra (ciruela, papaya, pera) ayudan con el estreñimiento.",
                        "Mantén la hidratación como prioridad durante episodios de diarrea.",
                      ]
                    : [
                        "Ofereça mais água ao longo do dia.",
                        "Frutas ricas em fibra (ameixa, mamão, pera) ajudam na constipação.",
                        "Mantenha a hidratação em foco durante episódios de diarreia.",
                      ]
                }
              />
            </div>

            <p className="rounded-2xl bg-red-100 p-4 text-sm text-red-700">
              {es
                ? "Consulta al pediatra si dura más de 2 días, hay sangre en las deposiciones, fiebre junto, o señales de deshidratación."
                : "Procure o pediatra se durar mais de 2 dias, tiver sangue nas fezes, febre junto, ou sinais de desidratação."}
            </p>

            <ListenButton contentType="sos" contentId="gut" text={getGutText(es)} className="w-fit" />
          </>
        )}

        {view === "fever" && (
          <>
            <BackButton es={es} onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              {es ? "Fiebre después de una comida nueva" : "Febre depois de uma refeição nova"}
            </h1>

            <div className="rounded-3xl bg-sage-100 p-5">
              <p className="text-brown-800">
                {es
                  ? "El alimento, por sí solo, no causa fiebre — quienes causan fiebre son las infecciones (virus, bacterias). Si la fiebre apareció cerca de una comida nueva, probablemente sea coincidencia, no alergia."
                  : "Alimento, por si só, não causa febre — quem causa febre são infecções (vírus, bactérias). Se a febre apareceu perto de uma refeição nova, provavelmente é coincidência, não alergia."}
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">{es ? "Qué hacer" : "O que fazer"}</p>
              <InfoList
                items={
                  es
                    ? [
                        "Mantén al bebé bien hidratado.",
                        "Ofrece alimentos livianos, sin forzar.",
                        "Fiebre por encima de 38°C, o muy decaído: consulta al pediatra.",
                      ]
                    : [
                        "Mantenha o bebê bem hidratado.",
                        "Ofereça alimentos leves, sem forçar.",
                        "Febre acima de 38°C, ou muito abatido: procure o pediatra.",
                      ]
                }
              />
            </div>

            <ListenButton contentType="sos" contentId="fever" text={getFeverText(es)} className="w-fit" />
          </>
        )}
      </main>
    </div>
  );
}
