export type PlateGroup = "carboidratos" | "proteinas" | "vegetais" | "frutas" | "laticinios";

export interface PlateGroupInfo {
  key: PlateGroup;
  label: string;
  percent: number;
  color: string;
  textColor: string;
  description: string;
  examples: string[];
}

export const PLATE_GROUPS: PlateGroupInfo[] = [
  {
    key: "carboidratos",
    label: "Carboidratos",
    percent: 30,
    color: "#FFA500",
    textColor: "#7a4e00",
    description: "Energia pro seu bebê brincar e crescer.",
    examples: ["Arroz", "Batata", "Macarrão", "Pão integral"],
  },
  {
    key: "proteinas",
    label: "Proteínas",
    percent: 25,
    color: "#FF6B6B",
    textColor: "#7a1f1f",
    description: "Constrói músculos e ossos fortes.",
    examples: ["Frango", "Ovos", "Feijão", "Iogurte", "Queijo"],
  },
  {
    key: "vegetais",
    label: "Vegetais",
    percent: 25,
    color: "#10B981",
    textColor: "#064e3b",
    description: "Vitaminas e minerais para a imunidade.",
    examples: ["Brócolis", "Cenoura", "Abóbora", "Espinafre"],
  },
  {
    key: "frutas",
    label: "Frutas",
    percent: 15,
    color: "#8B5CF6",
    textColor: "#3b1f6b",
    description: "Fibras e doçura natural.",
    examples: ["Maçã", "Banana", "Morango", "Melancia"],
  },
  {
    key: "laticinios",
    label: "Laticínios",
    percent: 5,
    color: "#F3E8FF",
    textColor: "#5b21b6",
    description: "Cálcio para ossos saudáveis.",
    examples: ["Leite", "Iogurte", "Queijo"],
  },
];
