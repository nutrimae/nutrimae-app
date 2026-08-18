// Conteúdo do Protocolo Intestino Livre — Módulo B da Área VIP.

export interface StoolLightFood {
  name: string;
}

export interface StoolLightCategory {
  key: "prendem" | "neutros" | "soltam";
  emoji: string;
  title: string;
  description: string;
  foods: StoolLightFood[];
}

// "Semáforo do Cocô": categoriza alimentos pelo efeito no trânsito intestinal.
export const STOOL_LIGHT_CATEGORIES: StoolLightCategory[] = [
  {
    key: "prendem",
    emoji: "🔴",
    title: "Prendem",
    description: "Oferecer com moderação quando o intestino já está preso",
    foods: [{ name: "Maçã" }, { name: "Banana Prata" }, { name: "Goiaba" }],
  },
  {
    key: "neutros",
    emoji: "🟡",
    title: "Neutros",
    description: "Não prendem nem soltam — seguros no dia a dia",
    foods: [{ name: "Arroz" }, { name: "Cenoura cozida" }],
  },
  {
    key: "soltam",
    emoji: "🟢",
    title: "Soltam (o SOS)",
    description: "Os primeiros a oferecer quando o intestino está preso",
    foods: [{ name: "Mamão" }, { name: "Ameixa" }, { name: "Abacate" }, { name: "Aveia" }],
  },
];

export interface LaxativeRecipe {
  id: string;
  title: string;
  prepMinutes: number;
  ingredients: string[];
  steps: string;
}

export const LAXATIVE_RECIPES: LaxativeRecipe[] = [
  {
    id: "caldinho-de-ameixa",
    title: "Caldinho de Ameixa",
    prepMinutes: 5,
    ingredients: ["4 ameixas secas sem caroço", "200ml de água"],
    steps: "Ferva as ameixas na água por 5 minutos, amasse levemente e ofereça o caldo morno.",
  },
  {
    id: "papinha-mamao-aveia",
    title: "Papinha de Mamão com Aveia",
    prepMinutes: 5,
    ingredients: ["1/2 mamão papaia", "1 colher (sopa) de aveia em flocos finos", "água filtrada"],
    steps: "Amasse o mamão, misture a aveia hidratada e sirva em temperatura ambiente.",
  },
  {
    id: "pure-abacate-ameixa",
    title: "Purê de Abacate com Ameixa",
    prepMinutes: 5,
    ingredients: ["1/4 de abacate maduro", "2 ameixas secas hidratadas e picadas"],
    steps: "Amasse o abacate, misture as ameixas picadas e sirva imediatamente.",
  },
  {
    id: "suco-ameixa-diluido",
    title: "Suco de Ameixa Diluído",
    prepMinutes: 5,
    ingredients: ["3 ameixas secas", "150ml de água morna"],
    steps: "Deixe as ameixas de molho na água morna por alguns minutos, bata e coe antes de oferecer.",
  },
  {
    id: "papinha-pera-ameixa",
    title: "Papinha de Pera com Ameixa",
    prepMinutes: 10,
    ingredients: ["1 pera madura", "2 ameixas secas", "canela em pó (opcional)"],
    steps: "Cozinhe a pera com as ameixas até amolecer, amasse e finalize com uma pitada de canela.",
  },
];
