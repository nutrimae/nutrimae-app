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

export const TOTAL_DIARY_FOODS = DIARY_FOODS.length;

export type Reaction = "gostou" | "neutro" | "nao_gostou";

export const REACTION_LABEL: Record<Reaction, string> = {
  gostou: "Gostou",
  neutro: "Neutro",
  nao_gostou: "Não gostou",
};

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
