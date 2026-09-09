import type { Locale } from "@/lib/i18n/locale";

export type FoodCategory = "frutas" | "legumes" | "proteinas" | "cereais";

export interface DiaryFood {
  key: string;
  name: string;
  category: FoodCategory;
  emoji: string;
}

export const FOOD_CATEGORY_LABEL: Record<FoodCategory, string> = {
  frutas: "Frutas",
  legumes: "Legumes e verduras",
  proteinas: "Proteínas",
  cereais: "Cereais e grãos",
};

export const FOOD_CATEGORY_LABEL_ES: Record<FoodCategory, string> = {
  frutas: "Frutas",
  legumes: "Verduras y hortalizas",
  proteinas: "Proteínas",
  cereais: "Cereales y granos",
};

export function getFoodCategoryLabel(locale: Locale = "pt-BR"): Record<FoodCategory, string> {
  return locale === "es" ? FOOD_CATEGORY_LABEL_ES : FOOD_CATEGORY_LABEL;
}

export const DIARY_FOODS: DiaryFood[] = [
  // Frutas
  { key: "banana", name: "Banana", category: "frutas", emoji: "🍌" },
  { key: "maca", name: "Maçã", category: "frutas", emoji: "🍎" },
  { key: "pera", name: "Pera", category: "frutas", emoji: "🍐" },
  { key: "mamao", name: "Mamão", category: "frutas", emoji: "🧡" },
  { key: "manga", name: "Manga", category: "frutas", emoji: "🥭" },
  { key: "uva", name: "Uva", category: "frutas", emoji: "🍇" },
  { key: "morango", name: "Morango", category: "frutas", emoji: "🍓" },
  { key: "abacate", name: "Abacate", category: "frutas", emoji: "🥑" },
  { key: "laranja", name: "Laranja", category: "frutas", emoji: "🍊" },
  { key: "melancia", name: "Melancia", category: "frutas", emoji: "🍉" },
  // Legumes e verduras
  { key: "cenoura", name: "Cenoura", category: "legumes", emoji: "🥕" },
  { key: "abobrinha", name: "Abobrinha", category: "legumes", emoji: "🥒" },
  { key: "brocolis", name: "Brócolis", category: "legumes", emoji: "🥦" },
  { key: "batata-doce", name: "Batata-doce", category: "legumes", emoji: "🍠" },
  { key: "batata", name: "Batata", category: "legumes", emoji: "🥔" },
  { key: "chuchu", name: "Chuchu", category: "legumes", emoji: "🥒" },
  { key: "abobora", name: "Abóbora", category: "legumes", emoji: "🎃" },
  { key: "couve-flor", name: "Couve-flor", category: "legumes", emoji: "🥦" },
  { key: "beterraba", name: "Beterraba", category: "legumes", emoji: "🟣" },
  { key: "vagem", name: "Vagem", category: "legumes", emoji: "🫛" },
  // Proteínas
  { key: "frango", name: "Frango", category: "proteinas", emoji: "🍗" },
  { key: "carne-moida", name: "Carne moída", category: "proteinas", emoji: "🍖" },
  { key: "peixe", name: "Peixe", category: "proteinas", emoji: "🐟" },
  { key: "ovo", name: "Ovo", category: "proteinas", emoji: "🥚" },
  { key: "feijao", name: "Feijão", category: "proteinas", emoji: "🫘" },
  { key: "lentilha", name: "Lentilha", category: "proteinas", emoji: "🟤" },
  { key: "grao-de-bico", name: "Grão-de-bico", category: "proteinas", emoji: "🟡" },
  { key: "tofu", name: "Tofu", category: "proteinas", emoji: "⬜" },
  { key: "iogurte", name: "Iogurte", category: "proteinas", emoji: "🥣" },
  { key: "queijo", name: "Queijo", category: "proteinas", emoji: "🧀" },
  // Cereais e grãos
  { key: "arroz", name: "Arroz", category: "cereais", emoji: "🍚" },
  { key: "aveia", name: "Aveia", category: "cereais", emoji: "🌾" },
  { key: "macarrao", name: "Macarrão", category: "cereais", emoji: "🍝" },
  { key: "pao", name: "Pão integral", category: "cereais", emoji: "🍞" },
  { key: "quinoa", name: "Quinoa", category: "cereais", emoji: "🌾" },
  { key: "milho", name: "Milho", category: "cereais", emoji: "🌽" },
  { key: "cuscuz", name: "Cuscuz de milho", category: "cereais", emoji: "🟨" },
  { key: "tapioca", name: "Tapioca", category: "cereais", emoji: "⚪" },
  { key: "granola", name: "Granola", category: "cereais", emoji: "🥣" },
  { key: "torrada", name: "Torrada", category: "cereais", emoji: "🍞" },
];

export const DIARY_FOODS_ES: DiaryFood[] = [
  // Frutas
  { key: "banana", name: "Banana", category: "frutas", emoji: "🍌" },
  { key: "maca", name: "Manzana", category: "frutas", emoji: "🍎" },
  { key: "pera", name: "Pera", category: "frutas", emoji: "🍐" },
  { key: "mamao", name: "Papaya", category: "frutas", emoji: "🧡" },
  { key: "manga", name: "Mango", category: "frutas", emoji: "🥭" },
  { key: "uva", name: "Uva", category: "frutas", emoji: "🍇" },
  { key: "morango", name: "Fresa", category: "frutas", emoji: "🍓" },
  { key: "abacate", name: "Aguacate", category: "frutas", emoji: "🥑" },
  { key: "laranja", name: "Naranja", category: "frutas", emoji: "🍊" },
  { key: "melancia", name: "Sandía", category: "frutas", emoji: "🍉" },
  // Verduras y hortalizas
  { key: "cenoura", name: "Zanahoria", category: "legumes", emoji: "🥕" },
  { key: "abobrinha", name: "Calabacín", category: "legumes", emoji: "🥒" },
  { key: "brocolis", name: "Brócoli", category: "legumes", emoji: "🥦" },
  { key: "batata-doce", name: "Camote", category: "legumes", emoji: "🍠" },
  { key: "batata", name: "Papa", category: "legumes", emoji: "🥔" },
  { key: "chuchu", name: "Chayote", category: "legumes", emoji: "🥒" },
  { key: "abobora", name: "Calabaza", category: "legumes", emoji: "🎃" },
  { key: "couve-flor", name: "Coliflor", category: "legumes", emoji: "🥦" },
  { key: "beterraba", name: "Remolacha", category: "legumes", emoji: "🟣" },
  { key: "vagem", name: "Ejotes", category: "legumes", emoji: "🫛" },
  // Proteínas
  { key: "frango", name: "Pollo", category: "proteinas", emoji: "🍗" },
  { key: "carne-moida", name: "Carne molida", category: "proteinas", emoji: "🍖" },
  { key: "peixe", name: "Pescado", category: "proteinas", emoji: "🐟" },
  { key: "ovo", name: "Huevo", category: "proteinas", emoji: "🥚" },
  { key: "feijao", name: "Frijoles", category: "proteinas", emoji: "🫘" },
  { key: "lentilha", name: "Lentejas", category: "proteinas", emoji: "🟤" },
  { key: "grao-de-bico", name: "Garbanzos", category: "proteinas", emoji: "🟡" },
  { key: "tofu", name: "Tofu", category: "proteinas", emoji: "⬜" },
  { key: "iogurte", name: "Yogur", category: "proteinas", emoji: "🥣" },
  { key: "queijo", name: "Queso", category: "proteinas", emoji: "🧀" },
  // Cereales y granos
  { key: "arroz", name: "Arroz", category: "cereais", emoji: "🍚" },
  { key: "aveia", name: "Avena", category: "cereais", emoji: "🌾" },
  { key: "macarrao", name: "Fideos", category: "cereais", emoji: "🍝" },
  { key: "pao", name: "Pan integral", category: "cereais", emoji: "🍞" },
  { key: "quinoa", name: "Quinua", category: "cereais", emoji: "🌾" },
  { key: "milho", name: "Maíz", category: "cereais", emoji: "🌽" },
  { key: "cuscuz", name: "Cuscús de maíz", category: "cereais", emoji: "🟨" },
  { key: "tapioca", name: "Tapioca", category: "cereais", emoji: "⚪" },
  { key: "granola", name: "Granola", category: "cereais", emoji: "🥣" },
  { key: "torrada", name: "Pan tostado", category: "cereais", emoji: "🍞" },
];

export function getDiaryFoods(locale: Locale = "pt-BR"): DiaryFood[] {
  return locale === "es" ? DIARY_FOODS_ES : DIARY_FOODS;
}

export const TOTAL_DIARY_FOODS = DIARY_FOODS.length;

export type Reaction = "gostou" | "neutro" | "nao_gostou";

export const REACTION_LABEL: Record<Reaction, string> = {
  gostou: "Gostou",
  neutro: "Neutro",
  nao_gostou: "Não gostou",
};

export const REACTION_LABEL_ES: Record<Reaction, string> = {
  gostou: "Le gustó",
  neutro: "Neutro",
  nao_gostou: "No le gustó",
};

export function getReactionLabel(locale: Locale = "pt-BR"): Record<Reaction, string> {
  return locale === "es" ? REACTION_LABEL_ES : REACTION_LABEL;
}

export const REACTION_EMOJI: Record<Reaction, string> = {
  gostou: "😋",
  neutro: "😐",
  nao_gostou: "😖",
};

export interface MilestoneDef {
  key: string;
  title: string;
  description: string;
}

export const MILESTONES: MilestoneDef[] = [
  {
    key: "primeira_papinha",
    title: "Primeira papinha",
    description: "O primeiro contato com comida além do leite.",
  },
  {
    key: "primeira_vez_mesa",
    title: "Primeira vez à mesa",
    description: "Sentou(a) à mesa com a família na hora da refeição.",
  },
  {
    key: "primeiro_talher",
    title: "Primeiro talher",
    description: "Segurou uma colher ou garfo pela primeira vez.",
  },
  {
    key: "primeira_fruta",
    title: "Primeira fruta inteira",
    description: "Comeu um pedaço de fruta sem ser amassada.",
  },
  {
    key: "primeira_proteina",
    title: "Primeira proteína",
    description: "Primeira vez experimentando carne, frango, peixe ou ovo.",
  },
  {
    key: "comeu_sozinho",
    title: "Comeu sozinho(a)",
    description: "Levou a comida à boca sem ajuda pela primeira vez.",
  },
  {
    key: "primeiro_copo",
    title: "Primeiro copo de treino",
    description: "Bebeu água ou líquido no copinho de treino.",
  },
];

export const MILESTONES_ES: MilestoneDef[] = [
  {
    key: "primeira_papinha",
    title: "Primera papilla",
    description: "El primer contacto con comida además de la leche.",
  },
  {
    key: "primeira_vez_mesa",
    title: "Primera vez en la mesa",
    description: "Se sentó a la mesa con la familia a la hora de comer.",
  },
  {
    key: "primeiro_talher",
    title: "Primer cubierto",
    description: "Sostuvo una cuchara o tenedor por primera vez.",
  },
  {
    key: "primeira_fruta",
    title: "Primera fruta entera",
    description: "Comió un trozo de fruta sin triturar.",
  },
  {
    key: "primeira_proteina",
    title: "Primera proteína",
    description: "Primera vez probando carne, pollo, pescado o huevo.",
  },
  {
    key: "comeu_sozinho",
    title: "Comió solo(a)",
    description: "Llevó la comida a la boca sin ayuda por primera vez.",
  },
  {
    key: "primeiro_copo",
    title: "Primer vaso de entrenamiento",
    description: "Bebió agua o líquido en el vasito de entrenamiento.",
  },
];

export function getMilestones(locale: Locale = "pt-BR"): MilestoneDef[] {
  return locale === "es" ? MILESTONES_ES : MILESTONES;
}
