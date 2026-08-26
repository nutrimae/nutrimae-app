"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { trackEvent } from "./track";
import { scrollToSection } from "./scroll";
import { saveQuizAnswer, track } from "@/lib/tracking/client";

type Method = "papinha" | "blw" | "misto" | "nao-decidi";
type Allergen = "nao" | "ovo" | "leite" | "outro";

const METHOD_OPTIONS: { key: Method; label: string }[] = [
  { key: "papinha", label: "Papinha" },
  { key: "blw", label: "BLW" },
  { key: "misto", label: "Misto" },
  { key: "nao-decidi", label: "Ainda não decidi" },
];

const ALLERGEN_OPTIONS: { key: Allergen; label: string }[] = [
  { key: "nao", label: "Nenhum conhecido" },
  { key: "ovo", label: "Ovo" },
  { key: "leite", label: "Leite" },
  { key: "outro", label: "Outro" },
];

function methodNote(method: Method): string {
  switch (method) {
    case "papinha":
      return "Anotado — papinha. As receitas em textura de papinha já aparecem primeiro pra você.";
    case "blw":
      return "Anotado — BLW. O guia de cortes por pedaço fica em destaque na sua tela inicial.";
    case "misto":
      return "Anotado — método misto. Você recebe as duas texturas lado a lado, sem precisar escolher uma só.";
    case "nao-decidi":
      return "Sem problema. O app mostra os dois métodos lado a lado para você decidir com calma.";
  }
}

function allergenNote(allergen: Allergen): string {
  switch (allergen) {
    case "nao":
      return "Sem alergênico conhecido — seguimos com a introdução gradual recomendada.";
    case "ovo":
      return "Anotado — ovo. As receitas com ovo já saem sinalizadas para você.";
    case "leite":
      return "Anotado — leite. As receitas com leite já saem sinalizadas para você.";
    case "outro":
      return "Anotado. No app dá para marcar o alergênico específico e filtrar as receitas.";
  }
}

export function AssistantChat() {
  const [method, setMethod] = useState<Method | null>(null);
  const [allergen, setAllergen] = useState<Allergen | null>(null);

  function handleFinish() {
    trackEvent("AssistantFinish");
    scrollToSection("oferta");
  }

  function selectMethod(key: Method) {
    if (!method) track("quiz_started", { quiz_version: "offer-v1" });
    setMethod(key);
    saveQuizAnswer("method", key);
    trackEvent("AssistantAnswer", { question: "method", answer: key });
  }

  function selectAllergen(key: Allergen) {
    setAllergen(key);
    saveQuizAnswer("allergen", key);
    trackEvent("AssistantAnswer", { question: "allergen", answer: key });
    trackEvent("AssistantComplete");
  }

  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm shadow-brown-900/10">
        <div className="flex items-center gap-3 bg-primary-500 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary-600">
            <Bot className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Assistente NutriMãe</p>
            <p className="text-xs text-white/85">respostas automáticas · não é uma pessoa real</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-brown-800">Qual método vocês pretendem seguir?</p>
            <div className="grid grid-cols-2 gap-2">
              {METHOD_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => selectMethod(option.key)}
                  aria-pressed={method === option.key}
                  className={`min-h-11 rounded-xl border-2 px-2 text-sm font-semibold transition-colors ${
                    method === option.key
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-transparent bg-cream-deep text-brown-800 hover:border-primary-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {method && <p className="mt-2 text-sm text-sage-700">{methodNote(method)}</p>}
          </div>

          {method && (
            <div>
              <p className="mb-2 text-sm font-semibold text-brown-800">
                Algum alergênico já é conhecido?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALLERGEN_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => selectAllergen(option.key)}
                    aria-pressed={allergen === option.key}
                    className={`min-h-11 rounded-xl border-2 px-2 text-sm font-semibold transition-colors ${
                      allergen === option.key
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-transparent bg-cream-deep text-brown-800 hover:border-primary-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {allergen && <p className="mt-2 text-sm text-sage-700">{allergenNote(allergen)}</p>}
            </div>
          )}

          {method && allergen && (
            <button
              type="button"
              onClick={handleFinish}
              className="min-h-12 rounded-xl bg-primary-500 px-4 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]"
            >
              Ver o que isso muda no meu plano
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
