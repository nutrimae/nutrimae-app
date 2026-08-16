import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ModuleGate } from "@/components/module-gate";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";

const GROUPS = [
  {
    title: "No lugar do leite (vaca)",
    items: [
      { from: "Leite de vaca", to: "Leite vegetal sem açúcar (aveia, arroz) a partir da idade liberada pelo pediatra" },
      { from: "Queijo", to: "Tofu firme amassado ou homus, para dar cremosidade" },
      { from: "Iogurte", to: "Iogurte de coco ou de amêndoas sem açúcar" },
      { from: "Manteiga", to: "Azeite ou óleo vegetal na mesma quantidade" },
    ],
  },
  {
    title: "No lugar do ovo",
    items: [
      { from: "1 ovo (em receitas assadas)", to: "1 colher de sopa de linhaça ou chia moída + 3 colheres de água, hidratada por 5 min" },
      { from: "Ovo mexido", to: "Tofu mexido temperado com açafrão-da-terra" },
      { from: "Ovo para empanar", to: "Purê de banana ou de maçã bem grosso" },
    ],
  },
  {
    title: "No lugar do glúten (trigo)",
    items: [
      { from: "Farinha de trigo", to: "Farinha de arroz, de aveia sem glúten ou polvilho, em receitas testadas" },
      { from: "Macarrão comum", to: "Macarrão de arroz ou de milho" },
      { from: "Pão de trigo", to: "Pão sem glúten ou tapioca" },
      { from: "Aveia comum", to: "Aveia certificada sem glúten (a comum pode ter contaminação cruzada)" },
    ],
  },
];

export default function SubstituicoesPage() {
  return (
    <ModuleGate productKey="restricao_alimentar">
      <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
        <Link
          href="/app/cardapio"
          className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Voltar ao cardápio
        </Link>

        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-800">
            Guia de substituições
          </h1>
          <p className="mt-1 text-brown-700">
            Trocas comuns para adaptar receitas do dia a dia.
          </p>
        </div>

        {GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="mb-2 font-heading text-lg font-bold text-sage-700">{group.title}</h2>
            <div className="flex flex-col gap-2">
              {group.items.map((item) => (
                <div
                  key={item.from}
                  className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5"
                >
                  <p className="text-sm font-semibold text-terracotta-600">Em vez de {item.from}</p>
                  <p className="mt-1 text-brown-800">{item.to}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <MedicalDisclaimerFooter />
      </main>
    </ModuleGate>
  );
}
