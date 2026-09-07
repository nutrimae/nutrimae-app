"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Notificação de "compra recente" — mesmo padrão já usado no Croche e na
 * Clínica Psi. Não é feed em tempo real (sem backend por trás aqui); é
 * uma lista de exemplos rotativa, prática comum de página de venda de
 * infoproduto. Nomes e cidades de exemplo, sem repetir até esgotar o ciclo.
 */
const PURCHASE_EXAMPLES: Array<[string, string]> = [
  ["Mariana S.", "São Paulo, SP"],
  ["Camila R.", "Belo Horizonte, MG"],
  ["Juliana P.", "Porto Alegre, RS"],
  ["Fernanda L.", "Salvador, BA"],
  ["Priscila M.", "Curitiba, PR"],
  ["Patrícia G.", "Recife, PE"],
  ["Renata C.", "Fortaleza, CE"],
  ["Larissa T.", "Goiânia, GO"],
  ["Bianca F.", "Rio de Janeiro, RJ"],
  ["Débora N.", "Florianópolis, SC"],
  ["Simone A.", "Brasília, DF"],
  ["Aline V.", "Campinas, SP"],
];

export function PurchaseToast() {
  const [current, setCurrent] = useState<[string, string] | null>(null);
  const [visible, setVisible] = useState(false);
  const queueRef = useRef<Array<[string, string]>>([]);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function next() {
    if (queueRef.current.length === 0) {
      queueRef.current = [...PURCHASE_EXAMPLES].sort(() => Math.random() - 0.5);
    }
    const example = queueRef.current.pop()!;
    setCurrent(example);
    setVisible(true);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), 6000);
  }

  useEffect(() => {
    const firstTimer = setTimeout(next, 4000);
    const interval = setInterval(next, 30000);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!current) return null;
  const [name, city] = current;

  return (
    <div
      className={`fixed bottom-4 left-3 z-40 max-w-[300px] transition-all duration-500 ease-out sm:bottom-6 sm:left-5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-sage-100/80 bg-white pl-3 pr-4 py-3 shadow-strong">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50">
          <CheckCircle2 className="h-5 w-5 text-primary-500" strokeWidth={1.75} />
        </span>
        <p className="m-0 font-sans text-xs leading-snug text-brown-900">
          <span className="font-bold">{name}</span> acabou de adquirir o NutriMãe
          <span className="text-brown-700/50"> · {city}</span>
        </p>
      </div>
    </div>
  );
}
