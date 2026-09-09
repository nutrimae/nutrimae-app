// Conteúdo do Protocolo Intestino Livre — Módulo B da Área VIP.

import type { Locale } from "@/lib/i18n/locale";

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

export const STOOL_LIGHT_CATEGORIES_ES: StoolLightCategory[] = [
  {
    key: "prendem",
    emoji: "🔴",
    title: "Astringentes",
    description: "Ofrecer con moderación cuando el intestino ya está estreñido",
    foods: [{ name: "Manzana" }, { name: "Banana" }, { name: "Guayaba" }],
  },
  {
    key: "neutros",
    emoji: "🟡",
    title: "Neutros",
    description: "No estriñen ni ablandan — seguros para el día a día",
    foods: [{ name: "Arroz" }, { name: "Zanahoria cocida" }],
  },
  {
    key: "soltam",
    emoji: "🟢",
    title: "Laxantes (el SOS)",
    description: "Los primeros para ofrecer cuando el intestino está estreñido",
    foods: [{ name: "Papaya" }, { name: "Ciruela" }, { name: "Palta" }, { name: "Avena" }],
  },
];

export function getStoolLightCategories(locale: Locale = "pt-BR"): StoolLightCategory[] {
  return locale === "es" ? STOOL_LIGHT_CATEGORIES_ES : STOOL_LIGHT_CATEGORIES;
}

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

export const LAXATIVE_RECIPES_ES: LaxativeRecipe[] = [
  {
    id: "caldinho-de-ameixa",
    title: "Caldito de Ciruela",
    prepMinutes: 5,
    ingredients: ["4 ciruelas secas sin carozo", "200ml de agua"],
    steps: "Hierve las ciruelas en el agua durante 5 minutos, aplástalas un poco y ofrece el caldo tibio.",
  },
  {
    id: "papinha-mamao-aveia",
    title: "Papilla de Papaya con Avena",
    prepMinutes: 5,
    ingredients: ["1/2 papaya", "1 cucharada (sopera) de avena en copos finos", "agua filtrada"],
    steps: "Aplasta la papaya, mezcla la avena hidratada y sirve a temperatura ambiente.",
  },
  {
    id: "pure-abacate-ameixa",
    title: "Puré de Palta con Ciruela",
    prepMinutes: 5,
    ingredients: ["1/4 de palta madura", "2 ciruelas secas hidratadas y picadas"],
    steps: "Aplasta la palta, mezcla las ciruelas picadas y sirve de inmediato.",
  },
  {
    id: "suco-ameixa-diluido",
    title: "Jugo de Ciruela Diluido",
    prepMinutes: 5,
    ingredients: ["3 ciruelas secas", "150ml de agua tibia"],
    steps: "Deja las ciruelas en remojo en el agua tibia unos minutos, licúa y cuela antes de ofrecer.",
  },
  {
    id: "papinha-pera-ameixa",
    title: "Papilla de Pera con Ciruela",
    prepMinutes: 10,
    ingredients: ["1 pera madura", "2 ciruelas secas", "canela en polvo (opcional)"],
    steps: "Cocina la pera con las ciruelas hasta que ablanden, aplasta y termina con una pizca de canela.",
  },
];

export function getLaxativeRecipes(locale: Locale = "pt-BR"): LaxativeRecipe[] {
  return locale === "es" ? LAXATIVE_RECIPES_ES : LAXATIVE_RECIPES;
}
