"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PRODUCTS } from "@/lib/products";

const product = PRODUCTS.nutrimae_assinatura;

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FAQ_ITEMS = [
  {
    q: "Preciso ter experiência para usar o app?",
    a: "Não. Tudo é apresentado em passo a passo, com linguagem simples e imagens de referência. É só escolher a idade do bebê e seguir o que aparece na tela.",
  },
  {
    q: "Funciona para qualquer idade do bebê?",
    a: "O conteúdo cobre a introdução alimentar dos 6 aos 24 meses, separado por faixa etária. Se o seu bebê já passou dos 6 meses, dá para começar a usar normalmente a partir da fase em que ele está agora.",
  },
  {
    q: "O conteúdo é validado por profissionais de saúde?",
    a: "O NutriMãe é um material de organização e planejamento da rotina alimentar. Ele serve como apoio prático no dia a dia, mas não substitui a orientação do pediatra ou do nutricionista que acompanha o seu bebê. Em caso de alergia, restrição alimentar ou qualquer dúvida específica sobre o desenvolvimento dele, consulte sempre o profissional responsável.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. O cancelamento é feito a qualquer momento, direto no seu perfil dentro do app (menu Perfil → Gerenciar assinatura), sem multa e sem tempo mínimo de permanência.",
  },
  {
    q: "Quanto eu pago depois do primeiro mês?",
    a: `No plano mensal, ${formatPrice(product.price)} vale só para o primeiro mês. A partir do segundo, o valor passa a ser ${formatPrice(product.regularPrice)}/mês. No plano anual, o valor é fixo de ${formatPrice(product.annual?.price ?? 0)} à vista, sem reajuste durante o ano.`,
  },
  {
    q: "Como funciona a garantia de 7 dias?",
    a: "Você tem 7 dias para acessar tudo e testar na prática. Se concluir que não faz sentido para a sua rotina, basta solicitar dentro desse prazo que o valor é devolvido integralmente, sem necessidade de justificativa.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8">
      <h2 className="text-center font-heading text-xl font-bold text-brown-800">Perguntas frequentes</h2>

      <div className="mt-5 flex flex-col gap-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.q} className="overflow-hidden rounded-2xl border border-sage-100">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left font-heading text-base font-semibold text-brown-800"
              >
                {item.q}
                <Plus
                  className={`h-5 w-5 shrink-0 text-primary-500 transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-sm text-brown-700">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
