import type { AgeBand } from "@/lib/menu";
import type { Region } from "@/lib/regions";

export type RecipeMealType = "cafe" | "almoco" | "lanche" | "ceia";

export const RECIPE_MEAL_TYPE_LABEL: Record<RecipeMealType, string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  ceia: "Ceia",
};

export type Allergen =
  | "ovo"
  | "leite"
  | "gluten"
  | "amendoim"
  | "castanhas"
  | "peixe"
  | "crustaceos"
  | "moluscos"
  | "soja"
  | "gergelim"
  | "mostarda"
  | "aipo"
  | "sulfitos"
  | "tremoco"
  | "mel";

export const ALLERGEN_LABEL: Record<Allergen, string> = {
  ovo: "Ovo",
  leite: "Leite",
  gluten: "Glúten",
  amendoim: "Amendoim",
  castanhas: "Castanhas",
  peixe: "Peixe",
  crustaceos: "Crustáceos",
  moluscos: "Moluscos",
  soja: "Soja",
  gergelim: "Gergelim",
  mostarda: "Mostarda",
  aipo: "Aipo",
  sulfitos: "Sulfitos",
  tremoco: "Tremoço",
  mel: "Mel",
};

export interface Recipe {
  id: string;
  title: string;
  ageBand: AgeBand;
  mealType: RecipeMealType;
  prepTimeMinutes: number;
  difficulty: "facil" | "medio";
  ingredients: string[];
  steps: string[];
  allergens: Allergen[];
  /** Regiões de origem — pode pertencer a mais de uma. Ausente = receita nacional. */
  regiao?: Region[];
  /** Status de revisão para receitas novas. Receitas sem esse campo são consideradas aprovadas. */
  revisao?: "pendente" | "aprovado";
}

export const RECIPES: Recipe[] = [
  // ---------- 6-7 meses ----------
  {
    id: "banana-aveia-purê",
    title: "Papinha de banana com aveia",
    ageBand: "6-7",
    mealType: "cafe",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1/2 banana madura", "1 colher de sopa de aveia em flocos finos", "2 colheres de sopa de água"],
    steps: [
      "Amasse a banana bem com um garfo até virar um purê sem pedaços.",
      "Misture a aveia com a água morna e deixe hidratar por 2 minutos.",
      "Combine tudo até formar uma papinha homogênea e sirva morna.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "mamao-maca-pure",
    title: "Purê de mamão com maçã",
    ageBand: "6-7",
    mealType: "cafe",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["1 fatia de mamão papaia", "1/2 maçã descascada"],
    steps: [
      "Cozinhe a maçã em pedaços no vapor por 8 minutos, até ficar bem macia.",
      "Amasse o mamão cru com um garfo.",
      "Amasse a maçã cozida e misture com o mamão até virar um purê liso.",
    ],
    allergens: [],
  },
  {
    id: "pera-cozida-papinha",
    title: "Papinha de pera cozida",
    ageBand: "6-7",
    mealType: "cafe",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["1 pera madura descascada"],
    steps: [
      "Corte a pera em cubos pequenos.",
      "Cozinhe no vapor por 8 a 10 minutos até ficar bem macia.",
      "Amasse com um garfo até virar purê, sem pedaços.",
    ],
    allergens: [],
  },
  {
    id: "abobora-frango-pure",
    title: "Purê de abóbora com frango desfiado",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["100g de abóbora cabotiá", "50g de peito de frango cozido", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a abóbora em cubos no vapor até ficar bem macia (cerca de 15 minutos).",
      "Cozinhe o frango em água até ficar bem cozido e desfie bem fino.",
      "Amasse a abóbora com um garfo, misture o frango desfiado e finalize com o azeite.",
    ],
    allergens: [],
  },
  {
    id: "batata-doce-carne-papinha",
    title: "Papinha de batata-doce com carne moída",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["1 batata-doce pequena", "50g de carne moída magra", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a batata-doce até ficar bem macia e amasse com um garfo.",
      "Refogue a carne moída em água até cozinhar bem, sem sal.",
      "Misture a carne à batata-doce amassada e finalize com o azeite.",
    ],
    allergens: [],
  },
  {
    id: "cenoura-lentilha-pure",
    title: "Purê de cenoura com lentilha",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["1 cenoura média", "2 colheres de sopa de lentilha cozida", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a cenoura em cubos no vapor até ficar bem macia.",
      "Amasse a lentilha já cozida com um garfo.",
      "Misture a cenoura amassada com a lentilha e finalize com o azeite.",
    ],
    allergens: [],
  },
  {
    id: "manga-amassada-lanche",
    title: "Papinha de manga amassada",
    ageBand: "6-7",
    mealType: "lanche",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1/2 manga madura"],
    steps: [
      "Descasque a manga e retire toda a polpa.",
      "Amasse bem com um garfo até não sobrar nenhum pedaço.",
      "Sirva em temperatura ambiente.",
    ],
    allergens: [],
  },
  {
    id: "maca-canela-pure",
    title: "Purê de maçã com canela",
    ageBand: "6-7",
    mealType: "lanche",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["1 maçã descascada", "1 pitada de canela em pó"],
    steps: [
      "Corte a maçã em cubos e cozinhe no vapor até ficar bem macia.",
      "Amasse até virar purê.",
      "Misture uma pitada bem pequena de canela antes de servir.",
    ],
    allergens: [],
  },
  {
    id: "banana-aveia-fina-lanche",
    title: "Banana amassada com aveia fina",
    ageBand: "6-7",
    mealType: "lanche",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1/2 banana madura", "1 colher de chá de aveia em flocos finos"],
    steps: [
      "Amasse a banana até formar um purê liso.",
      "Polvilhe a aveia por cima e misture bem.",
      "Sirva imediatamente para manter a textura macia.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "abobrinha-frango-pure",
    title: "Purê de abobrinha com frango",
    ageBand: "6-7",
    mealType: "ceia",
    prepTimeMinutes: 20,
    difficulty: "medio",
    ingredients: ["1 abobrinha pequena", "50g de peito de frango cozido e desfiado", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a abobrinha em cubos no vapor até ficar bem macia.",
      "Amasse a abobrinha com um garfo.",
      "Misture o frango desfiado e finalize com o azeite.",
    ],
    allergens: [],
  },
  {
    id: "batata-legumes-papinha",
    title: "Papinha de batata com legumes",
    ageBand: "6-7",
    mealType: "ceia",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["1 batata pequena", "1/4 de cenoura", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a batata e a cenoura juntas no vapor até ficarem bem macias.",
      "Amasse tudo junto com um garfo até formar um purê homogêneo.",
      "Finalize com o azeite antes de servir.",
    ],
    allergens: [],
  },
  {
    id: "chuchu-carne-pure",
    title: "Purê de chuchu com carne",
    ageBand: "6-7",
    mealType: "ceia",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["1 chuchu pequeno", "50g de carne moída magra", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe o chuchu em cubos no vapor até ficar bem macio.",
      "Cozinhe a carne moída em água até ficar bem cozida.",
      "Amasse o chuchu, misture a carne e finalize com o azeite.",
    ],
    allergens: [],
  },

  // ---------- 8-9 meses ----------
  {
    id: "mingau-aveia-banana",
    title: "Mingau de aveia com banana amassada",
    ageBand: "8-9",
    mealType: "cafe",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["2 colheres de sopa de aveia em flocos finos", "100ml de leite materno ou fórmula", "1/2 banana amassada"],
    steps: [
      "Aqueça o leite em fogo baixo (sem ferver) e adicione a aveia, mexendo bem.",
      "Cozinhe por 3 minutos, mexendo, até engrossar levemente.",
      "Misture a banana amassada por cima e sirva morno.",
    ],
    allergens: ["gluten", "leite"],
  },
  {
    id: "manga-iogurte-grosso",
    title: "Papinha grossa de manga com iogurte natural",
    ageBand: "8-9",
    mealType: "cafe",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1/2 manga madura", "2 colheres de sopa de iogurte natural integral"],
    steps: [
      "Amasse a manga grosseiramente, deixando pequenos pedacinhos macios.",
      "Misture com o iogurte natural.",
      "Sirva em temperatura ambiente.",
    ],
    allergens: ["leite"],
  },
  {
    id: "pera-aveia-grossa",
    title: "Purê grosso de pera com aveia",
    ageBand: "8-9",
    mealType: "cafe",
    prepTimeMinutes: 12,
    difficulty: "facil",
    ingredients: ["1 pera madura", "1 colher de sopa de aveia em flocos finos"],
    steps: [
      "Corte a pera em cubos pequenos e cozinhe no vapor por 8 minutos.",
      "Amasse grosseiramente, deixando pequenos pedaços macios.",
      "Misture a aveia e sirva morno.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "arroz-feijao-frango-amassado",
    title: "Arroz amassado com feijão e frango desfiado",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 15,
    difficulty: "facil",
    ingredients: ["2 colheres de sopa de arroz cozido", "2 colheres de sopa de feijão cozido", "30g de frango cozido desfiado"],
    steps: [
      "Amasse o arroz e o feijão juntos com um garfo, formando uma textura grossa.",
      "Desfie o frango bem fino e misture.",
      "Ajuste a consistência com um pouco de água do cozimento do feijão, se necessário.",
    ],
    allergens: [],
  },
  {
    id: "abobora-carne-arroz-grosso",
    title: "Purê grosso de abóbora com carne moída e arroz",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["100g de abóbora cabotiá", "50g de carne moída magra", "2 colheres de sopa de arroz cozido"],
    steps: [
      "Cozinhe a abóbora no vapor até ficar macia e amasse grosseiramente.",
      "Cozinhe a carne moída bem, sem sal.",
      "Misture a abóbora, a carne e o arroz amassado, mantendo pequenos pedaços.",
    ],
    allergens: [],
  },
  {
    id: "legumes-peixe-amassado",
    title: "Legumes cozidos amassados com peixe",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["1/2 cenoura", "1/2 abobrinha", "50g de filé de peixe branco sem espinhas"],
    steps: [
      "Cozinhe a cenoura e a abobrinha no vapor até ficarem macias.",
      "Cozinhe o peixe no vapor por 8 a 10 minutos e desfie, checando cuidadosamente por espinhas.",
      "Amasse os legumes grosseiramente e misture com o peixe desfiado.",
    ],
    allergens: ["peixe"],
  },
  {
    id: "iogurte-banana-lanche",
    title: "Iogurte natural com banana amassada",
    ageBand: "8-9",
    mealType: "lanche",
    prepTimeMinutes: 3,
    difficulty: "facil",
    ingredients: ["3 colheres de sopa de iogurte natural integral", "1/2 banana"],
    steps: [
      "Amasse a banana grosseiramente com um garfo.",
      "Misture com o iogurte natural.",
      "Sirva gelado ou em temperatura ambiente.",
    ],
    allergens: ["leite"],
  },
  {
    id: "queijo-cottage-maca",
    title: "Queijo cottage com maçã cozida amassada",
    ageBand: "8-9",
    mealType: "lanche",
    prepTimeMinutes: 12,
    difficulty: "facil",
    ingredients: ["2 colheres de sopa de queijo cottage", "1/2 maçã descascada"],
    steps: [
      "Cozinhe a maçã em cubos no vapor até ficar macia.",
      "Amasse grosseiramente a maçã cozida.",
      "Misture com o queijo cottage e sirva.",
    ],
    allergens: ["leite"],
  },
  {
    id: "torrada-banana-lanche",
    title: "Torrada macia com purê de banana",
    ageBand: "8-9",
    mealType: "lanche",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1 fatia de pão integral sem casca", "1/2 banana amassada"],
    steps: [
      "Toste levemente o pão apenas para amolecer, sem deixar crocante.",
      "Corte em tiras finas e macias.",
      "Espalhe o purê de banana por cima antes de servir.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "sopa-legumes-frango-cremosa",
    title: "Sopa cremosa de legumes com frango",
    ageBand: "8-9",
    mealType: "ceia",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["1/2 cenoura", "1/2 batata", "30g de frango cozido desfiado"],
    steps: [
      "Cozinhe a cenoura e a batata em água até ficarem bem macias.",
      "Amasse os legumes com um pouco da água do cozimento, formando um creme.",
      "Misture o frango desfiado e sirva morno.",
    ],
    allergens: [],
  },
  {
    id: "batata-doce-ovo-mexido",
    title: "Purê de batata-doce com ovo mexido bem cozido",
    ageBand: "8-9",
    mealType: "ceia",
    prepTimeMinutes: 20,
    difficulty: "medio",
    ingredients: ["1 batata-doce pequena", "1 ovo"],
    steps: [
      "Cozinhe a batata-doce até ficar macia e amasse grosseiramente.",
      "Bata o ovo e mexa em fogo baixo até ficar completamente cozido, sem partes cremosas.",
      "Misture o ovo mexido picado ao purê de batata-doce.",
    ],
    allergens: ["ovo"],
  },
  {
    id: "arroz-feijao-abobrinha-amassados",
    title: "Arroz e feijão amassados com abobrinha",
    ageBand: "8-9",
    mealType: "ceia",
    prepTimeMinutes: 20,
    difficulty: "facil",
    ingredients: ["2 colheres de sopa de arroz cozido", "2 colheres de sopa de feijão cozido", "1/2 abobrinha cozida"],
    steps: [
      "Amasse o arroz e o feijão juntos.",
      "Amasse a abobrinha cozida separadamente.",
      "Misture tudo, ajustando a consistência com água do cozimento se necessário.",
    ],
    allergens: [],
  },

  // ---------- 10-12 meses ----------
  {
    id: "panqueca-banana-aveia-tiras",
    title: "Panqueca de banana e aveia em tiras",
    ageBand: "10-12",
    mealType: "cafe",
    prepTimeMinutes: 15,
    difficulty: "medio",
    ingredients: ["1 banana madura", "1 ovo", "3 colheres de sopa de aveia em flocos"],
    steps: [
      "Amasse a banana e misture com o ovo batido e a aveia até formar uma massa.",
      "Cozinhe pequenas porções em frigideira antiaderente, em fogo baixo, virando quando dourar.",
      "Deixe esfriar um pouco e corte em tiras macias, do tamanho de um dedo.",
    ],
    allergens: ["ovo", "gluten"],
  },
  {
    id: "omelete-fatiado-legumes",
    title: "Omelete fatiado com legumes picadinhos",
    ageBand: "10-12",
    mealType: "cafe",
    prepTimeMinutes: 12,
    difficulty: "facil",
    ingredients: ["1 ovo", "2 colheres de sopa de legumes picados bem miudinhos (cenoura, abobrinha)", "1 colher de chá de azeite"],
    steps: [
      "Refogue os legumes picados no azeite até ficarem macios.",
      "Bata o ovo, misture os legumes e despeje na frigideira, cozinhando em fogo baixo dos dois lados.",
      "Deixe esfriar e corte em tiras ou pedaços pequenos e macios.",
    ],
    allergens: ["ovo"],
  },
  {
    id: "pao-abacate-cubos",
    title: "Cubos de pão integral com pasta de abacate",
    ageBand: "10-12",
    mealType: "cafe",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1 fatia de pão integral", "1/4 de abacate maduro"],
    steps: [
      "Amasse o abacate até formar uma pasta lisa.",
      "Espalhe a pasta sobre a fatia de pão.",
      "Corte em cubos pequenos e macios, do tamanho seguro para pegar com a mão.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "arroz-feijao-frango-pedacos",
    title: "Arroz, feijão e frango desfiado em pedaços pequenos",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 20,
    difficulty: "facil",
    ingredients: ["3 colheres de sopa de arroz cozido", "3 colheres de sopa de feijão cozido", "40g de peito de frango cozido"],
    steps: [
      "Desfie o frango em pedaços pequenos e macios.",
      "Sirva o arroz e o feijão sem amassar, em porções pequenas.",
      "Misture levemente com o frango, mantendo a textura em pedaços.",
    ],
    allergens: [],
  },
  {
    id: "macarrao-parafuso-molho-carne",
    title: "Macarrão parafuso com molho de tomate caseiro e carne moída",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["1 punhado de macarrão parafuso pequeno", "50g de carne moída magra", "2 tomates maduros sem pele e sem semente"],
    steps: [
      "Cozinhe o macarrão até ficar bem macio e corte os parafusos maiores ao meio.",
      "Refogue a carne moída e junte os tomates picados, cozinhando até formar um molho.",
      "Misture o molho ao macarrão e sirva em pedaços pequenos.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "peixe-mandioquinha-brocolis",
    title: "Peixe desfiado com purê de mandioquinha e brócolis picado",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["50g de filé de peixe branco sem espinhas", "1 mandioquinha pequena", "2 buquês de brócolis"],
    steps: [
      "Cozinhe a mandioquinha até ficar macia e amasse em purê.",
      "Cozinhe o peixe no vapor e desfie, checando bem por espinhas.",
      "Cozinhe o brócolis até ficar macio e pique bem pequeno. Sirva tudo junto.",
    ],
    allergens: ["peixe"],
  },
  {
    id: "palitos-queijo-pera",
    title: "Palitos de queijo com pera em cubos",
    ageBand: "10-12",
    mealType: "lanche",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1 fatia de queijo minas frescal", "1/2 pera madura"],
    steps: [
      "Corte o queijo em palitos macios, fáceis de segurar.",
      "Corte a pera em cubos pequenos e macios (ou cozinhe levemente se estiver mais firme).",
      "Sirva os dois juntos em um pratinho.",
    ],
    allergens: ["leite"],
  },
  {
    id: "iogurte-granola-morango",
    title: "Iogurte com granola fina e morango picado",
    ageBand: "10-12",
    mealType: "lanche",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["3 colheres de sopa de iogurte natural integral", "1 colher de chá de granola sem açúcar, bem triturada", "2 morangos picados"],
    steps: [
      "Pique os morangos em pedaços bem pequenos.",
      "Misture o iogurte com a granola triturada.",
      "Adicione os morangos picados por cima.",
    ],
    allergens: ["leite", "gluten"],
  },
  {
    id: "bolinho-banana-assado",
    title: "Bolinho de banana assado (sem açúcar)",
    ageBand: "10-12",
    mealType: "lanche",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["2 bananas maduras", "1 ovo", "1 xícara de aveia em flocos finos", "1 colher de chá de canela"],
    steps: [
      "Amasse as bananas e misture com o ovo batido, a aveia e a canela.",
      "Despeje em forminhas de cupcake untadas.",
      "Asse em forno preaquecido a 180°C por cerca de 20 minutos, até dourar levemente.",
    ],
    allergens: ["ovo", "gluten"],
  },
  {
    id: "sopa-legumes-frango-pedacinhos",
    title: "Sopa de legumes com pedacinhos de frango",
    ageBand: "10-12",
    mealType: "ceia",
    prepTimeMinutes: 25,
    difficulty: "facil",
    ingredients: ["1/2 cenoura", "1/2 batata", "1/2 abobrinha", "40g de frango cozido em pedaços pequenos"],
    steps: [
      "Cozinhe os legumes em água até ficarem macios, mantendo pedaços pequenos.",
      "Adicione o frango picado em pedaços pequenos.",
      "Sirva morno, com um pouco do caldo do cozimento.",
    ],
    allergens: [],
  },
  {
    id: "omelete-espinafre-picado",
    title: "Omelete com espinafre picado",
    ageBand: "10-12",
    mealType: "ceia",
    prepTimeMinutes: 12,
    difficulty: "facil",
    ingredients: ["1 ovo", "1 punhado de espinafre picado bem fino", "1 colher de chá de azeite"],
    steps: [
      "Refogue o espinafre picado no azeite até murchar.",
      "Bata o ovo, misture o espinafre e despeje na frigideira, cozinhando em fogo baixo dos dois lados.",
      "Corte em tiras ou pedaços pequenos antes de servir.",
    ],
    allergens: ["ovo"],
  },
  {
    id: "pure-batata-peixe-desfiado",
    title: "Purê de batata com peixe desfiado",
    ageBand: "10-12",
    mealType: "ceia",
    prepTimeMinutes: 20,
    difficulty: "medio",
    ingredients: ["1 batata média", "50g de filé de peixe branco sem espinhas", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a batata até ficar macia e amasse levemente, mantendo alguns pedacinhos.",
      "Cozinhe o peixe no vapor e desfie bem, checando cuidadosamente por espinhas.",
      "Misture o peixe ao purê e finalize com o azeite.",
    ],
    allergens: ["peixe"],
  },

  // ---------- 13-24 meses ----------
  {
    id: "panqueca-americana-banana-mel",
    title: "Panqueca americana com fatias de banana e um fio de mel",
    ageBand: "13-24",
    mealType: "cafe",
    prepTimeMinutes: 15,
    difficulty: "medio",
    ingredients: ["1 xícara de farinha de trigo", "1 ovo", "1 xícara de leite", "1 banana fatiada", "1 fio de mel"],
    steps: [
      "Misture a farinha, o ovo e o leite até formar uma massa lisa, sem grumos.",
      "Cozinhe pequenas porções em frigideira antiaderente até dourar dos dois lados.",
      "Sirva com fatias de banana e um fio bem pequeno de mel por cima (permitido a partir de 1 ano).",
    ],
    allergens: ["gluten", "ovo", "leite", "mel"],
  },
  {
    id: "sanduiche-peru-queijo",
    title: "Sanduíche natural de peito de peru com queijo",
    ageBand: "13-24",
    mealType: "cafe",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["2 fatias de pão integral", "1 fatia de peito de peru sem conservantes", "1 fatia de queijo"],
    steps: [
      "Monte o sanduíche com o peito de peru e o queijo entre as fatias de pão.",
      "Corte em pedaços pequenos, fáceis de segurar e morder.",
      "Sirva em temperatura ambiente.",
    ],
    allergens: ["gluten", "leite"],
  },
  {
    id: "vitamina-frutas-aveia",
    title: "Vitamina de frutas com aveia",
    ageBand: "13-24",
    mealType: "cafe",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1 banana", "1 copo de leite", "1 colher de sopa de aveia em flocos"],
    steps: [
      "Bata todos os ingredientes no liquidificador até ficar homogêneo.",
      "Sirva em copo apropriado para a idade, sem canudo fino.",
      "Ofereça logo após o preparo.",
    ],
    allergens: ["leite", "gluten"],
  },
  {
    id: "feijoada-leve-caseira",
    title: "Feijoada leve (sem embutidos) com arroz e couve picada",
    ageBand: "13-24",
    mealType: "almoco",
    prepTimeMinutes: 40,
    difficulty: "medio",
    ingredients: ["1 xícara de feijão preto cozido", "50g de carne suína magra cozida", "1 punhado de couve picada bem fina", "arroz cozido"],
    steps: [
      "Cozinhe o feijão com a carne magra até ficarem bem macios, sem usar embutidos.",
      "Refogue a couve picada bem fina por alguns minutos.",
      "Sirva o feijão com arroz e a couve, em porções pequenas e pedaços macios.",
    ],
    allergens: [],
  },
  {
    id: "estrogonofe-frango-caseiro",
    title: "Estrogonofe de frango caseiro com arroz e batata palha assada",
    ageBand: "13-24",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["100g de peito de frango em cubos pequenos", "2 colheres de sopa de creme de leite", "1 tomate picado", "arroz cozido"],
    steps: [
      "Refogue o frango em cubos pequenos até dourar.",
      "Adicione o tomate picado e o creme de leite, cozinhando até formar um molho cremoso.",
      "Sirva com arroz. Se usar batata palha, prefira a versão assada e ofereça em pequena quantidade.",
    ],
    allergens: ["leite"],
  },
  {
    id: "lasanha-carne-caseira-pedacos",
    title: "Lasanha de carne caseira em pedaços pequenos",
    ageBand: "13-24",
    mealType: "almoco",
    prepTimeMinutes: 45,
    difficulty: "medio",
    ingredients: ["massa de lasanha", "100g de carne moída magra", "molho de tomate caseiro", "queijo ralado"],
    steps: [
      "Prepare o molho refogando a carne moída com o molho de tomate caseiro.",
      "Monte a lasanha intercalando massa, molho e queijo em uma travessa pequena.",
      "Asse até o queijo derreter e dourar levemente. Deixe esfriar e corte em pedaços pequenos.",
    ],
    allergens: ["gluten", "leite"],
  },
  {
    id: "muffin-cenoura-caseiro",
    title: "Muffin de cenoura caseiro",
    ageBand: "13-24",
    mealType: "lanche",
    prepTimeMinutes: 35,
    difficulty: "medio",
    ingredients: ["1 xícara de cenoura ralada", "1 xícara de farinha de trigo", "1 ovo", "1/2 xícara de leite", "1 colher de sopa de óleo"],
    steps: [
      "Misture todos os ingredientes até formar uma massa homogênea.",
      "Distribua em forminhas de cupcake untadas.",
      "Asse a 180°C por cerca de 20 minutos, até dourar.",
    ],
    allergens: ["gluten", "ovo", "leite"],
  },
  {
    id: "mix-frutas-iogurte",
    title: "Mix de frutas picadas com iogurte",
    ageBand: "13-24",
    mealType: "lanche",
    prepTimeMinutes: 8,
    difficulty: "facil",
    ingredients: ["1/2 maçã", "1/2 banana", "3 morangos", "3 colheres de sopa de iogurte natural"],
    steps: [
      "Pique todas as frutas em pedaços pequenos e seguros para a idade.",
      "Misture as frutas em uma tigela.",
      "Adicione o iogurte por cima e sirva.",
    ],
    allergens: ["leite"],
  },
  {
    id: "torrada-homus-pepino",
    title: "Torrada com homus e pepino",
    ageBand: "13-24",
    mealType: "lanche",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["1 fatia de pão integral torrada", "2 colheres de sopa de homus", "algumas fatias finas de pepino"],
    steps: [
      "Espalhe o homus sobre a torrada.",
      "Distribua as fatias finas de pepino por cima.",
      "Corte em pedaços pequenos antes de servir.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "sopa-macarrao-frango-familia",
    title: "Sopa de legumes com macarrão e frango",
    ageBand: "13-24",
    mealType: "ceia",
    prepTimeMinutes: 30,
    difficulty: "facil",
    ingredients: ["1 cenoura", "1 batata", "1 punhado de macarrão pequeno", "60g de frango cozido em pedaços"],
    steps: [
      "Cozinhe os legumes em água até ficarem macios.",
      "Adicione o macarrão e cozinhe até ficar al dente e macio.",
      "Junte o frango em pedaços pequenos e sirva morno.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "omelete-completo-legumes-queijo",
    title: "Omelete completo com legumes e queijo",
    ageBand: "13-24",
    mealType: "ceia",
    prepTimeMinutes: 12,
    difficulty: "facil",
    ingredients: ["2 ovos", "legumes picados a gosto (cenoura, abobrinha, tomate)", "1 fatia de queijo picada"],
    steps: [
      "Refogue os legumes picados até ficarem macios.",
      "Bata os ovos, misture os legumes e o queijo, e despeje na frigideira.",
      "Cozinhe em fogo baixo dos dois lados até dourar levemente. Corte em pedaços.",
    ],
    allergens: ["ovo", "leite"],
  },
  {
    id: "pure-batata-carne-vagem",
    title: "Purê de batata com carne moída e vagem picada",
    ageBand: "13-24",
    mealType: "ceia",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["2 batatas médias", "70g de carne moída magra", "1 punhado de vagem picada"],
    steps: [
      "Cozinhe as batatas até ficarem macias e amasse em purê.",
      "Refogue a carne moída com a vagem picada até cozinhar bem.",
      "Sirva o purê com a carne e a vagem por cima, em pedaços pequenos.",
    ],
    allergens: [],
  },

  // ---------- Lote 2 — mais opções por faixa ----------
  {
    id: "pure-couve-flor-frango",
    title: "Purê de couve-flor com frango",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["100g de couve-flor", "50g de peito de frango cozido e desfiado", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a couve-flor no vapor até ficar bem macia.",
      "Amasse a couve-flor e misture o frango desfiado bem fino.",
      "Finalize com o azeite antes de servir.",
    ],
    allergens: [],
  },
  {
    id: "papinha-abacate-puro",
    title: "Papinha de abacate puro",
    ageBand: "6-7",
    mealType: "lanche",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["1/2 abacate maduro"],
    steps: [
      "Retire a polpa do abacate maduro.",
      "Amasse bem com um garfo até formar um purê liso.",
      "Sirva na hora, pois o abacate escurece rápido.",
    ],
    allergens: [],
  },
  {
    id: "pure-ervilha-hortela",
    title: "Purê de ervilha com hortelã",
    ageBand: "6-7",
    mealType: "ceia",
    prepTimeMinutes: 15,
    difficulty: "facil",
    ingredients: ["100g de ervilha fresca ou congelada", "1 folha de hortelã", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a ervilha em água até ficar bem macia.",
      "Bata ou amasse até virar um purê bem liso, sem casquinhas.",
      "Pique a hortelã bem fina e misture, finalizando com o azeite.",
    ],
    allergens: [],
  },
  {
    id: "papinha-manga-aveia",
    title: "Papinha de manga com aveia",
    ageBand: "6-7",
    mealType: "cafe",
    prepTimeMinutes: 8,
    difficulty: "facil",
    ingredients: ["1/2 manga madura", "1 colher de sopa de aveia em flocos finos"],
    steps: [
      "Amasse a manga até formar um purê liso.",
      "Misture a aveia e deixe hidratar por 2 minutos.",
      "Sirva morno ou em temperatura ambiente.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "pure-abobora-lentilha-cominho",
    title: "Purê de abóbora com lentilha e cominho",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["100g de abóbora cabotiá", "2 colheres de sopa de lentilha cozida", "1 pitada de cominho"],
    steps: [
      "Cozinhe a abóbora no vapor até ficar bem macia.",
      "Amasse a abóbora com a lentilha já cozida.",
      "Adicione uma pitada bem pequena de cominho para dar sabor.",
    ],
    allergens: [],
  },
  {
    id: "brocolis-queijo-grosso",
    title: "Purê grosso de brócolis com queijo",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 15,
    difficulty: "facil",
    ingredients: ["100g de brócolis", "1 colher de sopa de queijo cottage"],
    steps: [
      "Cozinhe o brócolis no vapor até ficar macio.",
      "Amasse grosseiramente, deixando pequenos pedaços.",
      "Misture o queijo cottage por cima antes de servir.",
    ],
    allergens: ["leite"],
  },
  {
    id: "papinha-peixe-batata",
    title: "Papinha de peixe com batata",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["50g de filé de peixe branco", "1 batata pequena", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a batata até ficar macia e amasse grosseiramente.",
      "Cozinhe o peixe no vapor e desfie bem, checando por espinhas.",
      "Misture o peixe à batata e finalize com o azeite.",
    ],
    allergens: ["peixe"],
  },
  {
    id: "iogurte-pera-cozida",
    title: "Iogurte com pera cozida amassada",
    ageBand: "8-9",
    mealType: "lanche",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["1 pera cozida", "3 colheres de sopa de iogurte natural integral"],
    steps: [
      "Cozinhe a pera no vapor até ficar bem macia.",
      "Amasse grosseiramente e misture com o iogurte.",
      "Sirva em temperatura ambiente.",
    ],
    allergens: ["leite"],
  },
  {
    id: "arroz-lentilha-abobrinha",
    title: "Arroz e lentilha amassados com abobrinha",
    ageBand: "8-9",
    mealType: "ceia",
    prepTimeMinutes: 20,
    difficulty: "facil",
    ingredients: ["2 colheres de sopa de arroz cozido", "2 colheres de sopa de lentilha cozida", "1/2 abobrinha cozida"],
    steps: [
      "Amasse o arroz e a lentilha juntos.",
      "Amasse a abobrinha separadamente.",
      "Misture tudo, ajustando a consistência com um pouco de água do cozimento.",
    ],
    allergens: [],
  },
  {
    id: "milho-frango-grosso",
    title: "Purê grosso de milho verde com frango",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 20,
    difficulty: "facil",
    ingredients: ["100g de milho verde cozido", "40g de frango cozido desfiado"],
    steps: [
      "Cozinhe o milho até ficar bem macio.",
      "Amasse grosseiramente com um garfo.",
      "Misture o frango desfiado antes de servir.",
    ],
    allergens: [],
  },
  {
    id: "tiras-frango-mandioquinha",
    title: "Tiras de frango grelhado com purê de mandioquinha",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["80g de peito de frango", "1 mandioquinha média", "1 colher de chá de azeite"],
    steps: [
      "Grelhe o frango até dourar bem dos dois lados e corte em tiras finas.",
      "Cozinhe a mandioquinha até ficar macia e amasse em purê.",
      "Sirva as tiras de frango sobre o purê, com um fio de azeite.",
    ],
    allergens: [],
  },
  {
    id: "bolinho-brocolis-assado",
    title: "Bolinho de brócolis assado",
    ageBand: "10-12",
    mealType: "lanche",
    prepTimeMinutes: 25,
    difficulty: "medio",
    ingredients: ["100g de brócolis cozido picado", "1 ovo", "2 colheres de sopa de farinha de aveia"],
    steps: [
      "Pique o brócolis cozido bem miudinho.",
      "Misture com o ovo batido e a farinha de aveia até formar uma massa.",
      "Molde bolinhos pequenos e asse a 180°C por 15 minutos, até dourar.",
    ],
    allergens: ["ovo", "gluten"],
  },
  {
    id: "salada-frutas-iogurte",
    title: "Salada de frutas picadas com iogurte",
    ageBand: "10-12",
    mealType: "lanche",
    prepTimeMinutes: 8,
    difficulty: "facil",
    ingredients: ["1/2 maçã cozida", "1/2 banana", "3 morangos", "iogurte natural"],
    steps: [
      "Corte todas as frutas em pedaços pequenos e seguros para a idade.",
      "Misture em uma tigela.",
      "Adicione o iogurte por cima antes de servir.",
    ],
    allergens: ["leite"],
  },
  {
    id: "wrap-queijo-cenoura",
    title: "Wrap macio de queijo e cenoura ralada",
    ageBand: "10-12",
    mealType: "cafe",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["1 tortilha macia pequena", "1 fatia de queijo", "cenoura ralada fina"],
    steps: [
      "Aqueça levemente a tortilha para ficar bem macia.",
      "Distribua o queijo e a cenoura ralada por cima.",
      "Enrole e corte em rodelas pequenas e seguras.",
    ],
    allergens: ["gluten", "leite"],
  },
  {
    id: "peixe-forno-legumes-cubos",
    title: "Peixe ao forno com legumes em cubos",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["80g de filé de peixe branco", "cenoura em cubos", "abobrinha em cubos", "1 colher de chá de azeite"],
    steps: [
      "Tempere o peixe com azeite e ervas frescas.",
      "Disponha com os legumes em cubos em uma assadeira.",
      "Asse a 180°C por 20 minutos, até tudo ficar bem macio.",
    ],
    allergens: ["peixe"],
  },
  {
    id: "macarrao-bolonhesa-caseira",
    title: "Macarrão à bolonhesa caseira",
    ageBand: "13-24",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["macarrão parafuso", "100g de carne moída magra", "molho de tomate caseiro"],
    steps: [
      "Cozinhe o macarrão até ficar bem macio.",
      "Refogue a carne moída e junte o molho de tomate caseiro.",
      "Misture tudo e sirva em pedaços pequenos.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "frittata-legumes-fatiada",
    title: "Frittata de legumes fatiada",
    ageBand: "13-24",
    mealType: "cafe",
    prepTimeMinutes: 20,
    difficulty: "medio",
    ingredients: ["2 ovos", "legumes picados a gosto", "1 colher de chá de azeite"],
    steps: [
      "Bata os ovos e misture os legumes picados.",
      "Despeje em uma frigideira untada e cozinhe em fogo baixo até firmar.",
      "Corte em fatias macias antes de servir.",
    ],
    allergens: ["ovo"],
  },
  {
    id: "risoto-simples-abobora",
    title: "Risoto simples de abóbora",
    ageBand: "13-24",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["arroz arbóreo", "100g de abóbora em cubos", "caldo de legumes caseiro"],
    steps: [
      "Refogue a abóbora em cubos até começar a amaciar.",
      "Adicione o arroz e vá acrescentando o caldo aos poucos, mexendo sempre.",
      "Cozinhe até o arroz ficar cremoso e a abóbora bem macia.",
    ],
    allergens: [],
  },
  {
    id: "wrap-frango-salada",
    title: "Wrap de frango com salada picada",
    ageBand: "13-24",
    mealType: "ceia",
    prepTimeMinutes: 15,
    difficulty: "facil",
    ingredients: ["1 tortilha integral", "frango desfiado", "alface e tomate picados"],
    steps: [
      "Aqueça levemente a tortilha.",
      "Distribua o frango desfiado e a salada picada por cima.",
      "Enrole bem e corte em pedaços pequenos.",
    ],
    allergens: ["gluten"],
  },
  {
    id: "bolo-banana-caseiro",
    title: "Bolo de banana caseiro (sem açúcar refinado)",
    ageBand: "13-24",
    mealType: "lanche",
    prepTimeMinutes: 40,
    difficulty: "medio",
    ingredients: ["3 bananas maduras", "2 ovos", "1 xícara de farinha de aveia", "1 colher de chá de canela"],
    steps: [
      "Amasse as bananas e misture com os ovos batidos.",
      "Adicione a farinha de aveia e a canela, misturando até formar uma massa homogênea.",
      "Asse em forma untada a 180°C por cerca de 30 minutos.",
    ],
    allergens: ["ovo", "gluten"],
  },

  // ─── Receitas Regionais ─── (todas com revisao: "pendente")

  // Norte (4)
  {
    id: "pure-macaxeira-frango-norte",
    title: "Purê de macaxeira com frango desfiado",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["100g de macaxeira (mandioca/aipim)", "50g de peito de frango", "1 colher de chá de azeite"],
    steps: [
      "Descasque a macaxeira, retire o fio central e corte em pedaços.",
      "Cozinhe a macaxeira em água até ficar bem macia (cerca de 25 minutos).",
      "Cozinhe o frango até ficar bem cozido e desfie bem fino.",
      "Amasse a macaxeira com garfo, misture o frango desfiado e finalize com azeite.",
    ],
    allergens: [],
    regiao: ["norte", "nordeste"],
    revisao: "pendente",
  },
  {
    id: "papinha-tambaqui-mandioca",
    title: "Papinha de tambaqui com mandioca",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 35,
    difficulty: "medio",
    ingredients: ["80g de filé de tambaqui", "100g de mandioca", "1 folha de louro", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe a mandioca descascada até ficar bem macia.",
      "Cozinhe o tambaqui em água com louro até ficar completamente cozido.",
      "Desfie o peixe com as mãos, verificando CUIDADOSAMENTE cada porção para retirar todas as espinhas.",
      "Amasse a mandioca, misture o peixe desfiado (sem espinhas) e finalize com azeite.",
    ],
    allergens: ["peixe"],
    regiao: ["norte"],
    revisao: "pendente",
  },
  {
    id: "creme-cupuacu-banana",
    title: "Creme de cupuaçu com banana",
    ageBand: "8-9",
    mealType: "lanche",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["50g de polpa de cupuaçu (pura, sem açúcar)", "1 banana madura", "2 colheres de sopa de água"],
    steps: [
      "Bata a polpa de cupuaçu com a água no liquidificador.",
      "Amasse a banana com garfo.",
      "Misture o creme de cupuaçu com a banana amassada até ficar homogêneo.",
    ],
    allergens: [],
    regiao: ["norte"],
    revisao: "pendente",
  },
  {
    id: "pirao-pirarucu-legumes",
    title: "Pirão de pirarucu com legumes",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 40,
    difficulty: "medio",
    ingredients: ["80g de pirarucu", "1 cenoura pequena", "1 batata pequena", "2 colheres de sopa de farinha de mandioca", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe o pirarucu em água até ficar bem cozido. Reserve o caldo.",
      "Desfie o peixe com as mãos, checando minuciosamente cada porção para espinhas.",
      "Cozinhe a cenoura e a batata até ficarem bem macias.",
      "Dissolva a farinha de mandioca no caldo do peixe e cozinhe mexendo até engrossar.",
      "Pique os legumes em pedacinhos pequenos e misture com o peixe e o pirão.",
      "Finalize com azeite.",
    ],
    allergens: ["peixe"],
    regiao: ["norte"],
    revisao: "pendente",
  },

  // Nordeste (4)
  {
    id: "feijao-corda-abobora",
    title: "Feijão-de-corda com abóbora amassada",
    ageBand: "6-7",
    mealType: "almoco",
    prepTimeMinutes: 45,
    difficulty: "medio",
    ingredients: ["50g de feijão-de-corda (deixar de molho 8h)", "100g de abóbora (jerimum)", "1 colher de chá de azeite"],
    steps: [
      "Deixe o feijão-de-corda de molho por 8 horas, trocando a água.",
      "Cozinhe na pressão por 20 minutos até ficar bem mole.",
      "Cozinhe a abóbora no vapor até ficar macia.",
      "Amasse o feijão com caldo e a abóbora juntos até virar um purê grosso.",
      "Finalize com azeite.",
    ],
    allergens: [],
    regiao: ["nordeste"],
    revisao: "pendente",
  },
  {
    id: "pure-jerimum-carne",
    title: "Purê de jerimum com carne moída",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 30,
    difficulty: "medio",
    ingredients: ["150g de jerimum (abóbora)", "50g de carne moída magra (patinho)", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe o jerimum no vapor até ficar bem macio.",
      "Cozinhe a carne moída em água até ficar completamente cozida, escorrendo a gordura.",
      "Amasse o jerimum e misture a carne moída, amassando levemente para desfiar.",
      "Finalize com azeite.",
    ],
    allergens: [],
    regiao: ["nordeste"],
    revisao: "pendente",
  },
  {
    id: "suco-caju-mamao",
    title: "Suco de caju com mamão",
    ageBand: "8-9",
    mealType: "lanche",
    prepTimeMinutes: 10,
    difficulty: "facil",
    ingredients: ["1 caju maduro (apenas a fruta, SEM a castanha)", "1 fatia de mamão", "50ml de água"],
    steps: [
      "Lave o caju e retire a castanha (se estiver presa). Use APENAS o pedúnculo (fruta).",
      "Esprema o caju para extrair o suco e coe bem para remover fibras.",
      "Bata o mamão com o suco de caju e a água.",
      "Sirva na hora — não adoçar.",
    ],
    allergens: [],
    regiao: ["nordeste"],
    revisao: "pendente",
  },
  {
    id: "cuscuz-nordestino-ovo",
    title: "Cuscuz nordestino molinho com ovo",
    ageBand: "10-12",
    mealType: "cafe",
    prepTimeMinutes: 20,
    difficulty: "facil",
    ingredients: ["3 colheres de sopa de flocão de milho", "1 ovo", "água", "1 colher de chá de azeite"],
    steps: [
      "Hidrate o flocão de milho com água (proporção 1:1) e deixe descansar 10 minutos.",
      "Cozinhe no vapor (cuscuzeira ou peneira sobre panela) por 5-8 minutos.",
      "Cozinhe o ovo até ficar bem cozido (gema firme) e pique em pedacinhos.",
      "Amasse o cuscuz com garfo para ficar bem molinho, misture o ovo picado e finalize com azeite.",
    ],
    allergens: ["ovo"],
    regiao: ["nordeste"],
    revisao: "pendente",
  },

  // Centro-Oeste (3)
  {
    id: "arroz-pequi-desfiado",
    title: "Arroz com pequi (polpa raspada)",
    ageBand: "13-24",
    mealType: "almoco",
    prepTimeMinutes: 50,
    difficulty: "medio",
    ingredients: ["2 pequis", "1/2 xícara de arroz", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe os pequis em água por 30-40 minutos.",
      "COM UMA COLHER, raspe cuidadosamente toda a polpa de cada caroço. NUNCA morda ou quebre o caroço (espinhos internos perigosos).",
      "Verifique visualmente se não há fragmentos de caroço na polpa raspada.",
      "Cozinhe o arroz normalmente.",
      "Misture a polpa de pequi raspada ao arroz cozido e finalize com azeite.",
    ],
    allergens: [],
    regiao: ["centro_oeste"],
    revisao: "pendente",
  },
  {
    id: "guariroba-refogada-frango",
    title: "Guariroba refogada com frango",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 45,
    difficulty: "medio",
    ingredients: ["80g de guariroba (palmito-amargo)", "50g de peito de frango", "1 colher de chá de azeite", "1 dente de alho"],
    steps: [
      "Cozinhe a guariroba em água por 30 minutos, trocando a água uma vez para reduzir o amargor.",
      "Cozinhe o frango até ficar bem cozido e desfie.",
      "Pique a guariroba cozida bem miúda.",
      "Refogue o alho no azeite, adicione a guariroba picada e o frango desfiado.",
      "Cozinhe por mais 5 minutos mexendo.",
    ],
    allergens: [],
    regiao: ["centro_oeste"],
    revisao: "pendente",
  },
  {
    id: "empanado-guariroba-queijo",
    title: "Bolinho de guariroba com queijo",
    ageBand: "13-24",
    mealType: "lanche",
    prepTimeMinutes: 40,
    difficulty: "medio",
    ingredients: ["100g de guariroba cozida", "30g de queijo minas frescal", "1 colher de sopa de farinha de trigo", "1 ovo"],
    steps: [
      "Cozinhe a guariroba por 30 minutos até ficar bem macia. Pique bem miúda.",
      "Misture com o queijo ralado, a farinha e o ovo batido.",
      "Modele bolinhos pequenos (tamanho de uma colher de sopa).",
      "Asse em forno a 180°C por 15-20 minutos até dourar (não frite — asse).",
    ],
    allergens: ["leite", "gluten", "ovo"],
    regiao: ["centro_oeste"],
    revisao: "pendente",
  },

  // Sul (2)
  {
    id: "pure-pinhao-batata",
    title: "Purê de pinhão com batata",
    ageBand: "10-12",
    mealType: "almoco",
    prepTimeMinutes: 50,
    difficulty: "medio",
    ingredients: ["6 pinhões", "1 batata média", "1 colher de chá de azeite"],
    steps: [
      "Faça um corte na casca de cada pinhão.",
      "Cozinhe na panela de pressão por 40 minutos.",
      "Retire a casca e a película marrom interna de cada pinhão.",
      "Cozinhe a batata até ficar macia.",
      "Amasse o pinhão e a batata juntos com garfo até virar purê. Finalize com azeite.",
    ],
    allergens: [],
    regiao: ["sul"],
    revisao: "pendente",
  },
  {
    id: "sopa-pinhao-legumes",
    title: "Sopa de pinhão com legumes",
    ageBand: "13-24",
    mealType: "ceia",
    prepTimeMinutes: 60,
    difficulty: "medio",
    ingredients: ["8 pinhões", "1 cenoura pequena", "1 batata pequena", "1 abobrinha pequena", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe os pinhões na pressão por 40 minutos. Descasque e pique em pedaços pequenos.",
      "Pique todos os legumes em cubos pequenos.",
      "Cozinhe os legumes em água até ficarem macios.",
      "Adicione os pinhões picados à sopa.",
      "Amasse levemente parte dos legumes para engrossar o caldo. Finalize com azeite.",
    ],
    allergens: [],
    regiao: ["sul"],
    revisao: "pendente",
  },

  // Multi-região (2)
  {
    id: "acai-puro-banana",
    title: "Açaí puro com banana (sem açúcar)",
    ageBand: "13-24",
    mealType: "lanche",
    prepTimeMinutes: 5,
    difficulty: "facil",
    ingredients: ["100g de polpa de açaí pura (sem açúcar)", "1 banana madura"],
    steps: [
      "Use polpa de açaí 100% pura — verifique no rótulo que NÃO contém açúcar, xarope ou guaraná.",
      "Bata a polpa semi-congelada com um pouco de água até ficar cremosa.",
      "Amasse a banana e misture com o açaí.",
      "Sirva imediatamente — não adoçar.",
    ],
    allergens: [],
    regiao: ["norte"],
    revisao: "pendente",
  },
  {
    id: "caldo-tucunare-batata-cenoura",
    title: "Caldo de tucunaré com batata e cenoura",
    ageBand: "8-9",
    mealType: "almoco",
    prepTimeMinutes: 35,
    difficulty: "medio",
    ingredients: ["80g de tucunaré", "1 batata pequena", "1 cenoura pequena", "1 colher de chá de azeite"],
    steps: [
      "Cozinhe o tucunaré em água até ficar completamente cozido.",
      "Desfie com as mãos, verificando CUIDADOSAMENTE cada porção para retirar TODAS as espinhas.",
      "Cozinhe a batata e a cenoura em cubos até ficarem bem macias.",
      "Amasse os legumes com um pouco do caldo de cozimento do peixe.",
      "Misture o peixe desfiado (sem espinhas) com os legumes amassados. Finalize com azeite.",
    ],
    allergens: ["peixe"],
    regiao: ["norte"],
    revisao: "pendente",
  },
];

export const TOTAL_RECIPES = RECIPES.length;

const NOT_BLW_KEYWORDS = /purê|papinha|amassad|sopa|cremos|vitamina|mingau|iogurte/i;

/** Uma receita é considerada própria para BLW quando o resultado é um pedaço que se
 * segura com a mão, em vez de um preparo amassado/líquido servido de colher. */
export function isBlwFriendly(recipe: Recipe): boolean {
  if (recipe.ageBand === "6-7") return false;
  const text = `${recipe.title} ${recipe.steps.join(" ")}`;
  return !NOT_BLW_KEYWORDS.test(text);
}

export function searchRecipes(params: {
  query?: string;
  ageBand?: AgeBand;
  mealType?: RecipeMealType;
  excludeAllergens?: Allergen[];
  blwOnly?: boolean;
  region?: Region | null;
}): Recipe[] {
  const { query, ageBand, mealType, excludeAllergens, blwOnly, region } = params;
  const q = query?.trim().toLowerCase() ?? "";

  const filtered = RECIPES.filter((recipe) => {
    // Receitas pendentes de revisão não aparecem para usuárias
    if (recipe.revisao === "pendente") return false;
    if (ageBand && recipe.ageBand !== ageBand) return false;
    if (mealType && recipe.mealType !== mealType) return false;
    if (blwOnly && !isBlwFriendly(recipe)) return false;
    if (excludeAllergens?.length && recipe.allergens.some((a) => excludeAllergens.includes(a))) {
      return false;
    }
    if (q) {
      const haystack = [recipe.title, ...recipe.ingredients].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (!region) return filtered;

  // Priorizar receitas da região, sem excluir as nacionais
  return filtered.sort((a, b) => {
    const aScore = a.regiao?.includes(region) ? 1 : 0;
    const bScore = b.regiao?.includes(region) ? 1 : 0;
    return bScore - aScore;
  });
}

/** Retorna receitas pendentes de revisão (para o painel admin). */
export function getPendingRecipes(): Recipe[] {
  return RECIPES.filter((r) => r.revisao === "pendente");
}
