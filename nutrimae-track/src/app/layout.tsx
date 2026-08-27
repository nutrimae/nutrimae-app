import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriMãe Track",
  description: "Painel de vendas e atribuição — NutriMãe",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0e0b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* DESIGN CONTRACT — NutriMãe Track (mundo próprio; brief pinado pelo dono: gramática Utmify)
        THESIS: terminal de dinheiro para uma pessoa decidir escala — o que entrou, o que saiu, o que sobrou e qual campanha fez isso; recusa o admin-panel genérico de cards uniformes com ícone.
        OWN-WORLD: "operação noturna" — pretos esverdeados (#0a0e0b/#10150f), fios de 1px (#1e2a1f), verde-dinheiro (#2fe08c) como única cor de ganho, vermelho suave só para gasto/perda, âmbar em delta neutro; numerais tabulares grandes, sombra longa e escura (não glow).
        STORY: em segundos o dono lê faturamento/vendas/investimento/lucro/ROAS com variação vs período anterior, vê o ritmo diário e decide qual campanha escalar ou matar.
        FIRST VIEWPORT: header (wordmark + 7/14/30d + sair) → banda do dinheiro (faturamento herói à esquerda, 4 métricas ao lado divididas por fios) → ritmo diário (barras verdes × vermelhas por dia) → início da tabela de campanhas.
        FORM: brief pinado Utmify; pedido precisamente especificado — construído direto (exceção new-work.md), sem rola de direções.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. */}
        {children}
      </body>
    </html>
  );
}
