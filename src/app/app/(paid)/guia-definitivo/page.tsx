"use client";

import { useMemo } from "react";
import { BookOpen, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { ageInMonths } from "@/lib/age";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { BackButton } from "@/components/back-button";
import { FIRST_WEEK_DAYS, PROGRESSION_STAGES, SAFETY_RULES } from "@/lib/introduction-guide";

export default function GuiaDefinitivoPage() {
  const { activeBaby } = useActiveBaby();
  const months = activeBaby ? ageInMonths(activeBaby.birth_date) : null;

  const currentStageIndex = useMemo(() => {
    if (months === null) return -1;
    return PROGRESSION_STAGES.findIndex(
      (stage) => months >= stage.fromMonth && months <= stage.toMonth,
    );
  }, [months]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-8 px-4 py-6">
      <BackButton />

      <div>
        <div className="mb-2 flex items-center gap-2 text-primary-600">
          <BookOpen className="h-6 w-6" strokeWidth={2} />
          <span className="text-sm font-bold uppercase tracking-wide">Guia definitivo</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          A introdução alimentar, do começo ao fim
        </h1>
        <p className="mt-1 text-brown-700">
          Tudo o que você precisa saber para começar com segurança e confiança — sem enrolação.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          O que é introdução alimentar?
        </h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <p className="text-brown-800">
            É o processo de apresentar ao bebê os primeiros alimentos sólidos, além do leite
            materno ou fórmula, geralmente a partir dos 6 meses. Não é sobre substituir o leite —
            é sobre expandir o paladar, desenvolver a habilidade de mastigar e engolir, e começar
            a construir uma relação saudável com a comida.
          </p>
          <p className="text-brown-800">
            Cada bebê tem seu próprio ritmo. Alguns aceitam tudo de primeira, outros levam
            semanas para topar uma nova textura — e isso é absolutamente normal.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          Passo a passo: os primeiros 7 dias
        </h2>
        <p className="mb-3 text-sm text-brown-700/80">
          Um roteiro ilustrativo — ajuste ao ritmo do seu bebê e à orientação do pediatra.
        </p>
        <ol className="flex flex-col gap-3 border-l-2 border-sage-200 pl-4">
          {FIRST_WEEK_DAYS.map((item) => (
            <li key={item.day} className="-ml-[21px] rounded-2xl bg-sage-50 p-4 pl-6">
              <span className="text-xs font-bold uppercase tracking-wide text-sage-600">
                Dia {item.day}
              </span>
              <p className="mt-1 font-heading text-lg font-bold text-brown-800">{item.title}</p>
              <p className="mt-1 text-sm text-brown-700">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          Progressão dos 6 aos 24 meses
        </h2>
        <div className="flex flex-col gap-3">
          {PROGRESSION_STAGES.map((stage, i) => {
            const isCurrent = i === currentStageIndex;
            return (
              <div
                key={stage.label}
                className={`rounded-2xl p-4 shadow-sm shadow-brown-900/5 ${
                  isCurrent ? "bg-primary-100" : "bg-white/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-lg font-bold text-brown-800">{stage.label}</p>
                  {isCurrent && (
                    <span className="flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Seu bebê está nesta fase!
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-col gap-1 text-sm text-brown-700">
                  <p><span className="font-semibold text-brown-800">Textura:</span> {stage.texture}</p>
                  <p><span className="font-semibold text-brown-800">Frequência:</span> {stage.frequency}</p>
                  <p><span className="font-semibold text-brown-800">Quantidade:</span> {stage.quantity}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-red-700">
          <ShieldAlert className="h-5 w-5" strokeWidth={2} />
          Segurança alimentar — o que evitar
        </h2>
        <div className="flex flex-col gap-2">
          {SAFETY_RULES.map((rule) => (
            <div
              key={rule.title}
              className={`flex gap-3 rounded-2xl p-4 ${
                rule.severity === "proibido" ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 shrink-0 ${
                  rule.severity === "proibido" ? "text-red-600" : "text-yellow-700"
                }`}
                strokeWidth={2}
              />
              <div>
                <p
                  className={`font-heading font-bold ${
                    rule.severity === "proibido" ? "text-red-700" : "text-yellow-800"
                  }`}
                >
                  {rule.title}
                </p>
                <p className="mt-0.5 text-sm text-brown-800">{rule.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MedicalDisclaimerFooter />
    </main>
  );
}
