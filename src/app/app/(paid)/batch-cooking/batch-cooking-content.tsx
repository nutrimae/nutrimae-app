"use client";

import { useState } from "react";
import { CheckCircle2, Printer, Snowflake, XCircle } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";

const PORCIONAMENTO_STEPS = [
  {
    title: "Escolha 1 hora livre, uma vez por semana",
    text: "Domingo à tarde ou qualquer janela de 1h costuma bastar pra cozinhar o básico da semana inteira do bebê.",
  },
  {
    title: "Cozinhe em lote, um grupo por vez",
    text: "Cozinhe todos os legumes juntos (uma panela grande), depois as proteínas, depois os grãos — não um prato completo por vez.",
  },
  {
    title: "Amasse ou corte já na consistência da fase atual",
    text: "Se o bebê está em papinha, amasse antes de congelar. Se está em BLW, corte no formato final antes de congelar — economiza tempo no dia a dia.",
  },
  {
    title: "Porcione em quantidades de uma refeição",
    text: "Use potes pequenos ou forminhas de gelo grandes (cubos de ~30-50ml). Uma refeição = 2-4 cubos, dependendo da fase.",
  },
  {
    title: "Etiquete antes de congelar",
    text: "Alimento + data de preparo. Sem isso, depois de 2 semanas ninguém lembra o que é o quê (ver modelo de etiqueta abaixo).",
  },
];

interface ValidadeItem {
  categoria: string;
  exemplos: string;
  geladeira: string;
  congelador: string;
}

const TABELA_VALIDADE: ValidadeItem[] = [
  { categoria: "Legumes e verduras cozidos", exemplos: "abóbora, cenoura, chuchu, batata-doce", geladeira: "2-3 dias", congelador: "2-3 meses" },
  { categoria: "Frutas cozidas ou amassadas", exemplos: "maçã, pera, banana amassada", geladeira: "2 dias", congelador: "1-2 meses" },
  { categoria: "Carnes e aves cozidas", exemplos: "frango desfiado, carne moída refogada", geladeira: "2 dias", congelador: "2-3 meses" },
  { categoria: "Grãos e cereais cozidos", exemplos: "arroz, feijão, lentilha, quinoa", geladeira: "3 dias", congelador: "2-3 meses" },
  { categoria: "Papinhas com proteína misturada", exemplos: "legume + carne já batidos juntos", geladeira: "1-2 dias", congelador: "1 mês" },
];

const CONGELA_BEM = [
  "Legumes e verduras cozidos (sozinhos ou em purê)",
  "Carnes, aves e peixes já cozidos",
  "Grãos e cereais cozidos",
  "Caldos e sopas sem laticínios",
];

const NAO_CONGELA_BEM = [
  "Batata e mandioca cozidas inteiras (ficam com textura arenosa — amasse antes se for congelar)",
  "Iogurte, queijo fresco e outros laticínios cremosos (talham ao descongelar)",
  "Ovo cozido inteiro (a clara fica borrachuda)",
  "Alface, pepino e outros vegetais crus e aquosos",
];

function Label({ alimento, data }: { alimento: string; data: string }) {
  return (
    <div className="flex min-h-20 flex-col justify-center rounded-xl border-2 border-dashed border-sage-300 bg-white p-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-sage-600">NutriMãe</p>
      <p className="mt-1 font-heading text-sm font-bold text-brown-800">{alimento || "Nome do alimento"}</p>
      <p className="text-xs text-brown-700/86">{data || "Data de preparo"}</p>
    </div>
  );
}

export function BatchCookingContent() {
  const [labelFood, setLabelFood] = useState("");
  const [labelDate, setLabelDate] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <div className="print:hidden">
        <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Batch Cooking & Congelamento</h1>
        <p className="mt-1 text-brown-700">
          Cozinhe a semana inteira do seu bebê em uma hora só — método de porcionamento, validade por alimento e
          etiquetas prontas pra imprimir.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">O método, passo a passo</h2>
        <ol className="flex flex-col gap-3">
          {PORCIONAMENTO_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-500 font-heading text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-brown-800">{step.title}</p>
                <p className="mt-1 text-sm text-brown-700">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <Snowflake className="h-5 w-5 text-sage-600" strokeWidth={2} />
          Tabela de validade
        </h2>
        <div className="flex flex-col gap-2">
          {TABELA_VALIDADE.map((item) => (
            <div key={item.categoria} className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
              <p className="font-semibold text-brown-800">{item.categoria}</p>
              <p className="text-xs text-brown-700/86">{item.exemplos}</p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-brown-700">
                  <strong className="text-brown-800">Geladeira:</strong> {item.geladeira}
                </span>
                <span className="text-brown-700">
                  <strong className="text-brown-800">Congelador:</strong> {item.congelador}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-brown-700/82">
          Prazos gerais e conservadores para uso doméstico. Na dúvida sobre cheiro, cor ou textura, descarte —
          segurança alimentar vem antes de economia.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">O que congela bem</h2>
        <div className="flex flex-col gap-2">
          {CONGELA_BEM.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-sage-50 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" strokeWidth={2} />
              <p className="text-sm text-brown-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">O que não congela bem</h2>
        <div className="flex flex-col gap-2">
          {NAO_CONGELA_BEM.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-red-50 p-3">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
              <p className="text-sm text-brown-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">Etiqueta pra imprimir</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <input
            className="min-h-11 rounded-xl border border-sage-200 px-3 text-sm"
            placeholder="Nome do alimento (ex.: Purê de abóbora)"
            value={labelFood}
            onChange={(e) => setLabelFood(e.target.value)}
          />
          <input
            className="min-h-11 rounded-xl border border-sage-200 px-3 text-sm"
            placeholder="Data de preparo (ex.: 22/08)"
            value={labelDate}
            onChange={(e) => setLabelDate(e.target.value)}
          />
          <Label alimento={labelFood} data={labelDate} />
          <button
            type="button"
            onClick={() => window.print()}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
          >
            <Printer className="h-4 w-4" strokeWidth={2} />
            Imprimir etiqueta
          </button>
        </div>
      </section>

        <MedicalDisclaimerFooter />
      </div>

      {/* Só isso aparece na impressão — o resto da página fica escondido
          via print:hidden acima, pra não gastar papel imprimindo a página
          inteira quando a mãe só quer a etiqueta. */}
      <div className="hidden print:block">
        <Label alimento={labelFood} data={labelDate} />
      </div>
    </main>
  );
}
