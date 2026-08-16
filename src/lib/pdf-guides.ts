export interface PdfGuideInfo {
  slug: string;
  title: string;
  description: string;
  emoji: string;
}

export const PDF_GUIDES: PdfGuideInfo[] = [
  {
    slug: "guia-definitivo",
    title: "Guia Definitivo da Introdução Alimentar",
    description: "Primeiros 7 dias, progressão por idade e segurança alimentar.",
    emoji: "📖",
  },
  {
    slug: "receitas",
    title: "Receitas Completas",
    description: "Todas as receitas por faixa etária, com ingredientes e preparo.",
    emoji: "🍽️",
  },
  {
    slug: "guia-blw",
    title: "Guia de Cortes BLW",
    description: "30 alimentos com tamanho, preparo e segurança para Baby-Led Weaning.",
    emoji: "✋",
  },
  {
    slug: "checklist-alergenicos",
    title: "Checklist de Alergênicos",
    description: "Os 14 alérgenos de declaração obrigatória, para marcar e imprimir.",
    emoji: "⚠️",
  },
  {
    slug: "pratinhos-divertidos",
    title: "Pratinhos Divertidos",
    description: "30 ideias de apresentação colorida por faixa etária.",
    emoji: "🎨",
  },
  {
    slug: "mordedores-naturais",
    title: "Mordedores Naturais",
    description: "15 opções naturais e sinais de teething.",
    emoji: "🦷",
  },
  {
    slug: "preparo-alimentos",
    title: "Modo de Preparo dos Alimentos",
    description: "Passo a passo de preparo, congelamento e descongelamento.",
    emoji: "🔪",
  },
];

export function getPdfGuide(slug: string): PdfGuideInfo | undefined {
  return PDF_GUIDES.find((g) => g.slug === slug);
}
