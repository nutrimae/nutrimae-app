"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronDown, ShieldAlert, XCircle } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import {
  BLW_CATEGORY_LABEL,
  BLW_FOODS,
  BLW_FORBIDDEN_FOODS,
  BLW_GOLDEN_RULES,
  type BlwCategory,
} from "@/lib/blw";

type Tab = "alimentos" | "tamanho" | "seguranca";
const CATEGORIES: BlwCategory[] = ["frutas", "vegetais", "proteina", "graos", "laticinios"];

export default function BlwPage() {
  const [tab, setTab] = useState<Tab>("alimentos");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Guia de cortes BLW</h1>
        <p className="mt-1 text-brown-700">
          Baby-Led Weaning é a introdução alimentar guiada pelo bebê: em vez de papinhas
          amassadas na colher, ele explora pedaços seguros com as próprias mãos, no seu ritmo.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["alimentos", "Guia de Alimentos"],
            ["tamanho", "Tamanho & Proporção"],
            ["seguranca", "Segurança"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
              tab === key ? "bg-primary-500 text-white" : "bg-primary-100 text-brown-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "alimentos" && <FoodsTab />}
      {tab === "tamanho" && <SizeTab />}
      {tab === "seguranca" && <SafetyTab />}

      <Link
        href="/app/receitas?blw=1"
        className="flex min-h-14 items-center justify-center rounded-2xl bg-sage-500 text-center text-base font-semibold text-white"
      >
        Ver receitas próprias para BLW
      </Link>

      <MedicalDisclaimerFooter />
    </main>
  );
}

function FoodsTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<BlwCategory, typeof BLW_FOODS>();
    for (const cat of CATEGORIES) map.set(cat, BLW_FOODS.filter((f) => f.category === cat));
    return map;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {CATEGORIES.map((cat) => (
        <section key={cat}>
          <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
            {BLW_CATEGORY_LABEL[cat]}
          </h2>
          <div className="flex flex-col gap-2">
            {byCategory.get(cat)?.map((food) => {
              const isOpen = expanded === food.id;
              return (
                <div key={food.id} className="rounded-2xl bg-white/80 shadow-sm shadow-brown-900/5">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : food.id)}
                    className="flex min-h-16 w-full items-center gap-3 px-4 text-left"
                  >
                    <span className="text-2xl">{food.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-brown-800">{food.name}</p>
                      <p className="text-xs text-brown-700/60">A partir de {food.minAgeMonths} meses</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-brown-700/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-2 px-4 pb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-sage-600">Tamanho</p>
                        <p className="text-sm text-brown-800">{food.sizeGuide}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-sage-600">Como preparar</p>
                        <p className="text-sm text-brown-800">{food.prep}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function SizeTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-sage-50 p-4">
        <p className="text-brown-800">
          Sem uma referência de bolso, use partes do seu próprio corpo — elas estão sempre à
          mão e são um guia de tamanho confiável em qualquer cozinha.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {[
          { ref: "👆 Um dedo indicador", use: "Bastões finos e compridos: cenoura, batata-doce, pão." },
          { ref: "✌️ Dois dedos juntos", use: "Bastões largos: banana, abacate, manga, abobrinha." },
          { ref: "✊ Palma da mão fechada", use: "Bolinhos e almôndegas: carne moída, arroz, cuscuz." },
          { ref: "🤏 Ponta dos dedos", use: "Grãos e pedaços pequenos, só a partir de quando o bebê já pega com a pinça (geralmente 9+ meses): feijão, grão-de-bico, uva em quartos." },
        ].map((item) => (
          <div key={item.ref} className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
            <span className="text-2xl">{item.ref.split(" ")[0]}</span>
            <div>
              <p className="font-semibold text-brown-800">{item.ref.slice(item.ref.indexOf(" ") + 1)}</p>
              <p className="mt-0.5 text-sm text-brown-700">{item.use}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-primary-100 p-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" strokeWidth={2} />
        <p className="text-sm text-brown-800">
          Regra geral: se o pedaço é mais comprido que a mão fechada do bebê, ele consegue segurar
          a ponta e morder a outra sem engolir inteiro.
        </p>
      </div>
    </div>
  );
}

function SafetyTab() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Regras de ouro</h2>
        <div className="flex flex-col gap-2">
          {BLW_GOLDEN_RULES.map((rule) => (
            <div key={rule.title} className="flex items-start gap-3 rounded-2xl bg-sage-50 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-600" strokeWidth={2} />
              <div>
                <p className="font-semibold text-brown-800">{rule.title}</p>
                <p className="mt-0.5 text-sm text-brown-700">{rule.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-red-700">
          <XCircle className="h-5 w-5" strokeWidth={2} />
          Alimentos proibidos em BLW
        </h2>
        <div className="flex flex-col gap-2">
          {BLW_FORBIDDEN_FOODS.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-red-100 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" strokeWidth={2} />
              <p className="text-sm text-brown-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <ShieldAlert className="h-5 w-5 text-primary-600" strokeWidth={2} />
          Engasgo vs. gag (reflexo de tosse)
        </h2>
        <div className="flex flex-col gap-2">
          <div className="rounded-2xl bg-sage-100 p-4">
            <p className="font-heading font-bold text-brown-800">Gag — normal, faz parte do BLW</p>
            <p className="mt-1 text-sm text-brown-800">
              O bebê tosse, engasga um pouco, o rosto pode ficar vermelho e os olhos lacrimejam —
              mas ele continua fazendo barulho e respirando. É o corpo empurrando o alimento para
              frente sozinho. Não intervenha, apenas observe por perto.
            </p>
          </div>
          <div className="rounded-2xl bg-red-100 p-4">
            <p className="font-heading font-bold text-red-700">Engasgo real — emergência</p>
            <p className="mt-1 text-sm text-brown-800">
              Silêncio total (sem tossir, sem chorar), dificuldade visível para respirar, rosto
              roxo ou azulado. Aqui não se espera — vá direto para a manobra de desengasgo.
            </p>
          </div>
          <Link
            href="/sos"
            className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-red-200 text-sm font-semibold text-red-600"
          >
            Ver manual completo de manobras por idade
          </Link>
        </div>
      </section>
    </div>
  );
}
