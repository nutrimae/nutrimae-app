import type { AgeBand } from "@/lib/menu";

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
  | "soja"
  | "mel";

export const ALLERGEN_LABEL: Record<Allergen, string> = {
  ovo: "Ovo",
  leite: "Leite",
  gluten: "Glúten",
  amendoim: "Amendoim",
  castanhas: "Castanhas",
  peixe: "Peixe",
  soja: "Soja",
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
];

export const TOTAL_RECIPES = RECIPES.length;

export function searchRecipes(params: {
  query?: string;
  ageBand?: AgeBand;
  mealType?: RecipeMealType;
  excludeAllergens?: Allergen[];
}): Recipe[] {
  const { query, ageBand, mealType, excludeAllergens } = params;
  const q = query?.trim().toLowerCase() ?? "";

  return RECIPES.filter((recipe) => {
    if (ageBand && recipe.ageBand !== ageBand) return false;
    if (mealType && recipe.mealType !== mealType) return false;
    if (excludeAllergens?.length && recipe.allergens.some((a) => excludeAllergens.includes(a))) {
      return false;
    }
    if (q) {
      const haystack = [recipe.title, ...recipe.ingredients].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
