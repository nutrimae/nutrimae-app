"use client";

import { useState } from "react";
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

// Rota pública do Manual S.O.S. — sem login, sem assinatura, sem oferta.
// Fica fora de /app de propósito: não pode depender de ActiveBabyProvider
// (contexto só disponível para usuárias autenticadas). A escolha de faixa
// etária para a manobra de desengasgo é feita manualmente aqui, pela mesma
// razão — nunca adivinhar.

type View = "identify" | "reflex" | "choking" | "gag_info" | "allergy" | "gut" | "fever";
type AgeGroup = "infant" | "child";

const INFANT_STEPS = [
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

const CHILD_STEPS = [
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

const EXTRA_TOPICS: { view: View; icon: typeof HelpCircle; title: string }[] = [
  { view: "gag_info", icon: HelpCircle, title: "Reflexo de tosse (gag) vs. engasgo real" },
  { view: "allergy", icon: ShieldAlert, title: "Reação alérgica — identificar rápido" },
  { view: "gut", icon: Activity, title: "Constipação vs. diarreia" },
  { view: "fever", icon: Thermometer, title: "Febre depois de uma refeição nova" },
];

function CallSamuBar() {
  return (
    <a
      href="tel:192"
      className="sticky top-0 z-40 flex min-h-16 items-center justify-center gap-3 bg-red-600 px-4 text-lg font-bold text-white shadow-md"
    >
      <Phone className="h-6 w-6" strokeWidth={2.25} />
      Ligar 192 agora (SAMU)
    </a>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      Voltar
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

function AgeGroupPicker({ onPick }: { onPick: (group: AgeGroup) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-brown-800">
        Para a manobra certa, primeiro diga a faixa de idade de quem está engasgando:
      </p>
      <button
        type="button"
        onClick={() => onPick("infant")}
        className="flex min-h-16 items-center gap-3 rounded-2xl bg-white/80 p-4 text-left shadow-sm shadow-brown-900/5 active:bg-sage-50"
      >
        <Baby className="h-7 w-7 shrink-0 text-sage-600" strokeWidth={1.75} />
        <span className="font-heading text-lg font-bold text-brown-800">Bebê até 1 ano</span>
      </button>
      <button
        type="button"
        onClick={() => onPick("child")}
        className="flex min-h-16 items-center gap-3 rounded-2xl bg-white/80 p-4 text-left shadow-sm shadow-brown-900/5 active:bg-sage-50"
      >
        <PersonStanding className="h-7 w-7 shrink-0 text-sage-600" strokeWidth={1.75} />
        <span className="font-heading text-lg font-bold text-brown-800">Criança acima de 1 ano</span>
      </button>
    </div>
  );
}

export default function SosPage() {
  const [view, setView] = useState<View>("identify");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);

  const isInfant = ageGroup === "infant";
  const steps = isInfant ? INFANT_STEPS : CHILD_STEPS;

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <CallSamuBar />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-5 px-4 py-6">
        {view === "identify" && (
          <>
            <PageBackButton fallbackHref="/" />

            <div>
              <h1 className="font-heading text-2xl font-bold text-brown-800">
                Manual S.O.S. — Antes de agir, identifique
              </h1>
              <p className="mt-1 text-brown-700">
                Toque na situação que mais parece com o que está acontecendo agora.
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
                  Está tossindo, chorando ou fazendo barulho
                </p>
                <p className="mt-1 text-sm text-brown-700/80">
                  Provavelmente é reflexo de tosse ou engasgo leve (gag reflex).
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
                  Sem tossir, sem chorar, sem conseguir respirar
                </p>
                <p className="mt-1 text-sm text-red-700/80">
                  Rosto roxo ou azulado, boca aberta sem som. Isso é engasgo real.
                </p>
              </div>
            </button>

            <p className="mt-2 rounded-2xl bg-peach-100 p-4 text-sm text-brown-700">
              Este guia é um resumo educativo e não substitui um curso certificado de
              primeiros socorros. Em qualquer dúvida, ligue 192 imediatamente.
            </p>

            <div>
              <h2 className="mb-2 font-heading text-base font-bold text-brown-800">
                Outras dúvidas do dia a dia
              </h2>
              <div className="flex flex-col gap-2">
                {EXTRA_TOPICS.map((topic) => (
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
            <BackButton onClick={() => setView("identify")} />

            <div className="rounded-3xl bg-sage-100 p-6">
              <p className="font-heading text-xl font-bold text-brown-800">
                Isso é bom sinal — não faça manobras
              </p>
              <p className="mt-3 text-lg text-brown-800">
                Se está tossindo, chorando ou fazendo barulho, as vias aéreas ainda estão
                parcialmente livres e o próprio corpo está tentando expulsar o alimento.
                Intervir agora pode empurrar o objeto mais fundo.
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">O que fazer</p>
              <InfoList
                items={[
                  "Fique calma e por perto, sem tirar os olhos da criança.",
                  "Incentive a tosse — não bata nas costas nem coloque os dedos na boca dela.",
                  "Observe: a tosse deve ceder em poucos minutos.",
                  "Se a tosse parar de fazer ruído, o rosto mudar de cor ou ela parar de respirar, mude imediatamente para a manobra de engasgo abaixo.",
                ]}
              />
            </div>

            <button
              type="button"
              onClick={() => setView("choking")}
              className="mt-2 min-h-14 rounded-2xl border-2 border-red-200 text-base font-semibold text-red-600"
            >
              Piorou? Ver manobra de engasgo
            </button>
          </>
        )}

        {view === "choking" && (
          <>
            <BackButton
              onClick={() => {
                setView("identify");
                setAgeGroup(null);
              }}
            />

            {ageGroup === null ? (
              <AgeGroupPicker onPick={setAgeGroup} />
            ) : (
              <>
                <div className="flex items-start gap-3 rounded-3xl bg-red-100 p-5">
                  <AlertTriangle className="h-7 w-7 shrink-0 text-red-600" strokeWidth={2} />
                  <div>
                    <p className="font-heading text-lg font-bold text-red-700">
                      Manobra de desengasgo — {isInfant ? "bebê até 1 ano" : "criança acima de 1 ano"}
                    </p>
                    <p className="mt-1 text-sm text-red-700/80">
                      Peça para alguém ligar 192 enquanto você age. Se estiver sozinha, faça a
                      manobra por 1 minuto antes de parar para ligar.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAgeGroup(null)}
                  className="w-fit text-xs font-semibold text-sage-600 underline"
                >
                  Trocar faixa de idade
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

                <p className="mt-2 rounded-2xl bg-peach-100 p-4 text-sm text-brown-700">
                  Resumo educativo, não substitui treinamento certificado. Ligue 192
                  imediatamente e continue as manobras até o socorro chegar ou desengasgar.
                </p>
              </>
            )}
          </>
        )}

        {view === "gag_info" && (
          <>
            <BackButton onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              Reflexo de tosse (gag) vs. engasgo real
            </h1>

            <div className="rounded-3xl bg-sage-100 p-5">
              <p className="font-heading font-bold text-brown-800">Gag reflex — normal e protetor</p>
              <p className="mt-2 text-brown-800">
                Tosse forte, rosto pode ficar vermelho, olhos podem lacrimejar, mas o bebê
                continua respirando e fazendo barulho. É o corpo aprendendo a lidar com
                texturas novas — comum na introdução alimentar.
              </p>
            </div>

            <div className="rounded-3xl bg-red-100 p-5">
              <p className="font-heading font-bold text-red-700">Engasgo real — emergência</p>
              <p className="mt-2 text-brown-800">
                Silêncio (sem tossir, sem chorar), dificuldade visível pra respirar, rosto
                roxo ou azulado. Aqui não se espera — vá direto pra manobra de desengasgo.
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">Em casa, no gag</p>
              <InfoList
                items={[
                  "Deixe o bebê tossir por conta própria.",
                  "Não bata nas costas nem coloque os dedos na boca dele.",
                  "Fique por perto, calma, observando.",
                ]}
              />
            </div>

            <button
              type="button"
              onClick={() => setView("choking")}
              className="mt-2 min-h-14 rounded-2xl border-2 border-red-200 text-base font-semibold text-red-600"
            >
              É engasgo real? Ver manobra
            </button>
          </>
        )}

        {view === "allergy" && (
          <>
            <BackButton onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              Reação alérgica — identificar rápido
            </h1>

            <div className="rounded-2xl bg-sage-50 p-4">
              <p className="font-heading font-bold text-sage-700">Sinais leves</p>
              <p className="mt-1 text-brown-800">
                Coceira leve na boca, pequenas bolinhas de vermelhidão perto da boca.
              </p>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-4">
              <p className="font-heading font-bold text-yellow-800">Sinais moderados</p>
              <p className="mt-1 text-brown-800">Inchaço nos lábios, vômito, diarreia.</p>
            </div>
            <div className="rounded-2xl bg-red-100 p-4">
              <p className="font-heading font-bold text-red-700">Sinais graves</p>
              <p className="mt-1 text-brown-800">
                Dificuldade pra respirar, inchaço na garganta ou no rosto.
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">O que fazer</p>
              <InfoList
                items={[
                  "Remova o alimento e observe de perto.",
                  "Sinais leves/moderados: fale com o pediatra o quanto antes.",
                  "Sinais graves: ligue 192 imediatamente.",
                ]}
              />
            </div>
          </>
        )}

        {view === "gut" && (
          <>
            <BackButton onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              Constipação vs. diarreia
            </h1>

            <p className="text-brown-800">
              A frequência das evacuações varia bastante de bebê pra bebê — isso sozinho não
              é motivo de alarme.
            </p>

            <div className="rounded-2xl bg-yellow-100 p-4">
              <p className="font-heading font-bold text-yellow-800">Sinais de alerta — constipação</p>
              <p className="mt-1 text-brown-800">Fezes muito duras, esforço visível, desconforto.</p>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-4">
              <p className="font-heading font-bold text-yellow-800">Sinais de alerta — diarreia</p>
              <p className="mt-1 text-brown-800">
                Mais de 8 evacuações por dia, fezes bem líquidas.
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">Soluções caseiras simples</p>
              <InfoList
                items={[
                  "Ofereça mais água ao longo do dia.",
                  "Frutas ricas em fibra (ameixa, mamão, pera) ajudam na constipação.",
                  "Mantenha a hidratação em foco durante episódios de diarreia.",
                ]}
              />
            </div>

            <p className="rounded-2xl bg-red-100 p-4 text-sm text-red-700">
              Procure o pediatra se durar mais de 2 dias, tiver sangue nas fezes, febre
              junto, ou sinais de desidratação.
            </p>
          </>
        )}

        {view === "fever" && (
          <>
            <BackButton onClick={() => setView("identify")} />
            <h1 className="font-heading text-xl font-bold text-brown-800">
              Febre depois de uma refeição nova
            </h1>

            <div className="rounded-3xl bg-sage-100 p-5">
              <p className="text-brown-800">
                Alimento, por si só, não causa febre — quem causa febre são infecções
                (vírus, bactérias). Se a febre apareceu perto de uma refeição nova,
                provavelmente é coincidência, não alergia.
              </p>
            </div>

            <div>
              <p className="font-heading text-lg font-bold text-brown-800">O que fazer</p>
              <InfoList
                items={[
                  "Mantenha o bebê bem hidratado.",
                  "Ofereça alimentos leves, sem forçar.",
                  "Febre acima de 38°C, ou muito abatido: procure o pediatra.",
                ]}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
