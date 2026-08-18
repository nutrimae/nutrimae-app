import type { Metadata } from "next";
import { OfertaContent } from "./_components/oferta-content";

export const metadata: Metadata = {
  title: "NutriMãe — Cardápio e Cortes por Idade do Bebê",
  description:
    "Cardápio semanal, lista de compras e o corte indicado de cada alimento, organizados por idade do bebê.",
  openGraph: {
    title: "NutriMãe — Cardápio e Cortes por Idade do Bebê",
    description: "O corte indicado e o cardápio da semana, organizados por idade do bebê.",
    type: "website",
  },
};

export default function OfertaPage() {
  return <OfertaContent />;
}
