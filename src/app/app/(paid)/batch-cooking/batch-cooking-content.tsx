"use client";

import { useState } from "react";
import { CheckCircle2, Printer, Snowflake, XCircle } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { useLocale } from "@/lib/use-locale";

const PORCIONAMENTO_STEPS_PT = [
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

const PORCIONAMENTO_STEPS_ES = [
  {
    title: "Elija 1 hora libre, una vez por semana",
    text: "El domingo por la tarde o cualquier ventana de 1h suele bastar para cocinar lo básico de toda la semana del bebé.",
  },
  {
    title: "Cocine por lotes, un grupo a la vez",
    text: "Cocine todos los vegetales juntos (una olla grande), luego las proteínas, luego los granos — no un plato completo a la vez.",
  },
  {
    title: "Aplaste o corte ya en la consistencia de la etapa actual",
    text: "Si el bebé está en papilla, aplaste antes de congelar. Si está en BLW, corte en el formato final antes de congelar — ahorra tiempo en el día a día.",
  },
  {
    title: "Porcione en cantidades de una comida",
    text: "Use potes pequeños o cubeteras grandes (cubos de ~30-50ml). Una comida = 2-4 cubos, según la etapa.",
  },
  {
    title: "Etiquete antes de congelar",
    text: "Alimento + fecha de preparación. Sin eso, después de 2 semanas nadie recuerda qué es qué (vea el modelo de etiqueta abajo).",
  },
];

interface ValidadeItem {
  categoria: string;
  exemplos: string;
  geladeira: string;
  congelador: string;
}

const TABELA_VALIDADE_PT: ValidadeItem[] = [
  { categoria: "Legumes e verduras cozidos", exemplos: "abóbora, cenoura, chuchu, batata-doce", geladeira: "2-3 dias", congelador: "2-3 meses" },
  { categoria: "Frutas cozidas ou amassadas", exemplos: "maçã, pera, banana amassada", geladeira: "2 dias", congelador: "1-2 meses" },
  { categoria: "Carnes e aves cozidas", exemplos: "frango desfiado, carne moída refogada", geladeira: "2 dias", congelador: "2-3 meses" },
  { categoria: "Grãos e cereais cozidos", exemplos: "arroz, feijão, lentilha, quinoa", geladeira: "3 dias", congelador: "2-3 meses" },
  { categoria: "Papinhas com proteína misturada", exemplos: "legume + carne já batidos juntos", geladeira: "1-2 dias", congelador: "1 mês" },
];

const TABELA_VALIDADE_ES: ValidadeItem[] = [
  { categoria: "Verduras cocidas", exemplos: "calabaza, zanahoria, chayote, batata", geladeira: "2-3 días", congelador: "2-3 meses" },
  { categoria: "Frutas cocidas o aplastadas", exemplos: "manzana, pera, banana aplastada", geladeira: "2 días", congelador: "1-2 meses" },
  { categoria: "Carnes y aves cocidas", exemplos: "pollo desmenuzado, carne molida salteada", geladeira: "2 días", congelador: "2-3 meses" },
  { categoria: "Granos y cereales cocidos", exemplos: "arroz, frijoles, lentejas, quinoa", geladeira: "3 días", congelador: "2-3 meses" },
  { categoria: "Papillas con proteína mezclada", exemplos: "verdura + carne ya licuadas juntas", geladeira: "1-2 días", congelador: "1 mes" },
];

const CONGELA_BEM_PT = [
  "Legumes e verduras cozidos (sozinhos ou em purê)",
  "Carnes, aves e peixes já cozidos",
  "Grãos e cereais cozidos",
  "Caldos e sopas sem laticínios",
];

const CONGELA_BEM_ES = [
  "Verduras cocidas (solas o en puré)",
  "Carnes, aves y pescados ya cocidos",
  "Granos y cereales cocidos",
  "Caldos y sopas sin lácteos",
];

const NAO_CONGELA_BEM_PT = [
  "Batata e mandioca cozidas inteiras (ficam com textura arenosa — amasse antes se for congelar)",
  "Iogurte, queijo fresco e outros laticínios cremosos (talham ao descongelar)",
  "Ovo cozido inteiro (a clara fica borrachuda)",
  "Alface, pepino e outros vegetais crus e aquosos",
];

const NAO_CONGELA_BEM_ES = [
  "Papa y mandioca cocidas enteras (quedan con textura arenosa — aplaste antes si va a congelar)",
  "Yogur, queso fresco y otros lácteos cremosos (se cortan al descongelar)",
  "Huevo cocido entero (la clara queda gomosa)",
  "Lechuga, pepino y otros vegetales crudos y acuosos",
];

function Label({ alimento, data, es }: { alimento: string; data: string; es: boolean }) {
  return (
    <div className="flex min-h-20 flex-col justify-center rounded-xl border-2 border-dashed border-sage-300 bg-white p-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-sage-600">NutriMãe</p>
      <p className="mt-1 font-heading text-sm font-bold text-brown-800">
        {alimento || (es ? "Nombre del alimento" : "Nome do alimento")}
      </p>
      <p className="text-xs text-brown-700/86">{data || (es ? "Fecha de preparación" : "Data de preparo")}</p>
    </div>
  );
}

export function BatchCookingContent() {
  const [labelFood, setLabelFood] = useState("");
  const [labelDate, setLabelDate] = useState("");
  const { locale } = useLocale();
  const es = locale === "es";

  const steps = es ? PORCIONAMENTO_STEPS_ES : PORCIONAMENTO_STEPS_PT;
  const validade = es ? TABELA_VALIDADE_ES : TABELA_VALIDADE_PT;
  const congelaBem = es ? CONGELA_BEM_ES : CONGELA_BEM_PT;
  const naoCongelaBem = es ? NAO_CONGELA_BEM_ES : NAO_CONGELA_BEM_PT;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <div className="print:hidden">
        <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          {es ? "Batch Cooking y Congelación" : "Batch Cooking & Congelamento"}
        </h1>
        <p className="mt-1 text-brown-700">
          {es
            ? "Cocine toda la semana de su bebé en una sola hora — método de porcionamiento, vigencia por alimento y etiquetas listas para imprimir."
            : "Cozinhe a semana inteira do seu bebê em uma hora só — método de porcionamento, validade por alimento e etiquetas prontas pra imprimir."}
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          {es ? "El método, paso a paso" : "O método, passo a passo"}
        </h2>
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
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
          {es ? "Tabla de vigencia" : "Tabela de validade"}
        </h2>
        <div className="flex flex-col gap-2">
          {validade.map((item) => (
            <div key={item.categoria} className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
              <p className="font-semibold text-brown-800">{item.categoria}</p>
              <p className="text-xs text-brown-700/86">{item.exemplos}</p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-brown-700">
                  <strong className="text-brown-800">{es ? "Heladera:" : "Geladeira:"}</strong> {item.geladeira}
                </span>
                <span className="text-brown-700">
                  <strong className="text-brown-800">{es ? "Congelador:" : "Congelador:"}</strong> {item.congelador}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-brown-700/82">
          {es
            ? "Plazos generales y conservadores para uso doméstico. Ante la duda sobre olor, color o textura, descarte — la seguridad alimentaria va antes que el ahorro."
            : "Prazos gerais e conservadores para uso doméstico. Na dúvida sobre cheiro, cor ou textura, descarte — segurança alimentar vem antes de economia."}
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          {es ? "Lo que congela bien" : "O que congela bem"}
        </h2>
        <div className="flex flex-col gap-2">
          {congelaBem.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-sage-50 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" strokeWidth={2} />
              <p className="text-sm text-brown-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          {es ? "Lo que no congela bien" : "O que não congela bem"}
        </h2>
        <div className="flex flex-col gap-2">
          {naoCongelaBem.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-red-50 p-3">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
              <p className="text-sm text-brown-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-800">
          {es ? "Etiqueta para imprimir" : "Etiqueta pra imprimir"}
        </h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
          <input
            className="min-h-11 rounded-xl border border-sage-200 px-3 text-sm"
            placeholder={es ? "Nombre del alimento (ej.: Puré de calabaza)" : "Nome do alimento (ex.: Purê de abóbora)"}
            value={labelFood}
            onChange={(e) => setLabelFood(e.target.value)}
          />
          <input
            className="min-h-11 rounded-xl border border-sage-200 px-3 text-sm"
            placeholder={es ? "Fecha de preparación (ej.: 22/08)" : "Data de preparo (ex.: 22/08)"}
            value={labelDate}
            onChange={(e) => setLabelDate(e.target.value)}
          />
          <Label alimento={labelFood} data={labelDate} es={es} />
          <button
            type="button"
            onClick={() => window.print()}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sage-500 text-sm font-semibold text-white"
          >
            <Printer className="h-4 w-4" strokeWidth={2} />
            {es ? "Imprimir etiqueta" : "Imprimir etiqueta"}
          </button>
        </div>
      </section>

        <MedicalDisclaimerFooter />
      </div>

      {/* Só isso aparece na impressão — o resto da página fica escondido
          via print:hidden acima, pra não gastar papel imprimindo a página
          inteira quando a mãe só quer a etiqueta. */}
      <div className="hidden print:block">
        <Label alimento={labelFood} data={labelDate} es={es} />
      </div>
    </main>
  );
}
