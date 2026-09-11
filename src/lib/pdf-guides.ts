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
  {
    slug: "utensilios-recomendados",
    title: "Utensílios Recomendados",
    description: "O que ajuda na rotina e o que procurar na hora de comprar.",
    emoji: "🧺",
  },
];

export const PDF_GUIDES_ES: PdfGuideInfo[] = [
  {
    slug: "guia-definitivo",
    title: "Guía Definitiva de la Introducción Alimentaria",
    description: "Primeros 7 días, progresión por edad y seguridad alimentaria.",
    emoji: "📖",
  },
  {
    slug: "receitas",
    title: "Recetas Completas",
    description: "Todas las recetas por rango de edad, con ingredientes y preparación.",
    emoji: "🍽️",
  },
  {
    slug: "guia-blw",
    title: "Guía de Cortes BLW",
    description: "30 alimentos con tamaño, preparación y seguridad para Baby-Led Weaning.",
    emoji: "✋",
  },
  {
    slug: "checklist-alergenicos",
    title: "Checklist de Alergénicos",
    description: "Los 14 alérgenos de declaración obligatoria, para marcar e imprimir.",
    emoji: "⚠️",
  },
  {
    slug: "pratinhos-divertidos",
    title: "Platitos Divertidos",
    description: "30 ideas de presentación colorida por rango de edad.",
    emoji: "🎨",
  },
  {
    slug: "mordedores-naturais",
    title: "Mordedores Naturales",
    description: "15 opciones naturales y señales de dentición.",
    emoji: "🦷",
  },
  {
    slug: "preparo-alimentos",
    title: "Modo de Preparación de los Alimentos",
    description: "Paso a paso de preparación, congelación y descongelación.",
    emoji: "🔪",
  },
  {
    slug: "utensilios-recomendados",
    title: "Utensilios Recomendados",
    description: "Qué ayuda en la rutina y qué buscar al comprar.",
    emoji: "🧺",
  },
];

export function getPdfGuides(locale: "pt-BR" | "es" = "es"): PdfGuideInfo[] {
  return locale === "pt-BR" ? PDF_GUIDES : PDF_GUIDES_ES;
}

export function getPdfGuide(slug: string): PdfGuideInfo | undefined {
  return PDF_GUIDES.find((g) => g.slug === slug);
}
