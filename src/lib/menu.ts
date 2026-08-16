import { ageInMonths } from "@/lib/age";

export type AgeBand = "6-7" | "8-9" | "10-12" | "13-24";

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  "6-7": "6 a 7 meses · papinhas amassadas",
  "8-9": "8 a 9 meses · amassado grosseiro e pedacinhos macios",
  "10-12": "10 a 12 meses · pedaços pequenos e comidinha de mão",
  "13-24": "13 a 24 meses · comida da família, em pedaços",
};

export function ageBandForMonths(months: number): AgeBand {
  if (months < 8) return "6-7";
  if (months < 10) return "8-9";
  if (months < 13) return "10-12";
  return "13-24";
}

export type DayKey = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "seg", label: "Segunda-feira", short: "Seg" },
  { key: "ter", label: "Terça-feira", short: "Ter" },
  { key: "qua", label: "Quarta-feira", short: "Qua" },
  { key: "qui", label: "Quinta-feira", short: "Qui" },
  { key: "sex", label: "Sexta-feira", short: "Sex" },
  { key: "sab", label: "Sábado", short: "Sáb" },
  { key: "dom", label: "Domingo", short: "Dom" },
];

/** Converte Date.getDay() (0=domingo) para o índice da semana começando na segunda. */
export function todayDayIndex(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

export type MealType = "cafe" | "almoco" | "lanche" | "jantar";

export const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
];

export type IngredientCategory = "feira" | "mercado" | "outros";

export interface Ingredient {
  name: string;
  category: IngredientCategory;
}

export interface MealSuggestion {
  id: string;
  title: string;
  description: string;
  prep: string;
  ingredients: Ingredient[];
}

type Pool = Record<AgeBand, Record<MealType, MealSuggestion[]>>;

const MENU_POOL: Pool = {
  "6-7": {
    cafe: [
      {
        id: "6-7-cafe-1",
        title: "Papa de banana com aveia",
        description: "Banana bem madura amassada com aveia fininha.",
        prep: "Amasse meia banana com um garfo até virar purê. Misture uma colher de sopa de aveia em flocos finos e um fiozinho de água ou leite materno/fórmula até dar liga.",
        ingredients: [
          { name: "Banana", category: "feira" },
          { name: "Aveia em flocos finos", category: "mercado" },
        ],
      },
      {
        id: "6-7-cafe-2",
        title: "Papa de maçã cozida",
        description: "Maçã cozida e amassada, textura lisinha.",
        prep: "Cozinhe a maçã descascada e picada no vapor por 8 minutos. Amasse bem com um garfo até ficar homogênea.",
        ingredients: [{ name: "Maçã", category: "feira" }],
      },
      {
        id: "6-7-cafe-3",
        title: "Papa de mamão amassado",
        description: "Mamão bem maduro amassado, sem coar.",
        prep: "Retire as sementes e amasse a polpa do mamão com um garfo até ficar lisa.",
        ingredients: [{ name: "Mamão", category: "feira" }],
      },
    ],
    almoco: [
      {
        id: "6-7-almoco-1",
        title: "Papa de abobrinha com arroz e feijão",
        description: "Purê de legumes com arroz e caldo de feijão bem amassados.",
        prep: "Cozinhe a abobrinha até ficar bem macia. Amasse junto com um pouco de arroz e o caldo grosso do feijão até formar uma papa lisa, sem sal.",
        ingredients: [
          { name: "Abobrinha", category: "feira" },
          { name: "Arroz", category: "mercado" },
          { name: "Feijão", category: "mercado" },
        ],
      },
      {
        id: "6-7-almoco-2",
        title: "Papa de batata-doce com frango desfiado",
        description: "Batata-doce amassada com frango cozido bem desfiado e triturado.",
        prep: "Cozinhe a batata-doce até desmanchar. Cozinhe o frango, desfie bem fino e triture junto com a batata-doce e um pouco da água do cozimento.",
        ingredients: [
          { name: "Batata-doce", category: "feira" },
          { name: "Peito de frango", category: "mercado" },
        ],
      },
      {
        id: "6-7-almoco-3",
        title: "Papa de cenoura e chuchu",
        description: "Legumes cozidos e amassados com um fio de azeite.",
        prep: "Cozinhe a cenoura e o chuchu no vapor até ficarem bem macios. Amasse tudo junto e finalize com um fio de azeite.",
        ingredients: [
          { name: "Cenoura", category: "feira" },
          { name: "Chuchu", category: "feira" },
          { name: "Azeite", category: "outros" },
        ],
      },
    ],
    lanche: [
      {
        id: "6-7-lanche-1",
        title: "Papa de pera",
        description: "Pera cozida e amassada.",
        prep: "Cozinhe a pera descascada no vapor por alguns minutos e amasse até ficar lisa.",
        ingredients: [{ name: "Pera", category: "feira" }],
      },
      {
        id: "6-7-lanche-2",
        title: "Papa de manga",
        description: "Manga bem madura amassada.",
        prep: "Amasse a polpa da manga madura com um garfo até ficar homogênea.",
        ingredients: [{ name: "Manga", category: "feira" }],
      },
      {
        id: "6-7-lanche-3",
        title: "Água de coco natural",
        description: "Oferecida em pequenas quantidades, na xícara de treino.",
        prep: "Ofereça um pouco de água de coco natural em copinho ou xícara de treino, sem adição de açúcar.",
        ingredients: [{ name: "Água de coco", category: "mercado" }],
      },
    ],
    jantar: [
      {
        id: "6-7-jantar-1",
        title: "Papa de mandioquinha com legumes",
        description: "Purê de mandioquinha com legumes bem cozidos.",
        prep: "Cozinhe a mandioquinha e a abobrinha até ficarem bem macias e amasse tudo junto.",
        ingredients: [
          { name: "Mandioquinha", category: "feira" },
          { name: "Abobrinha", category: "feira" },
        ],
      },
      {
        id: "6-7-jantar-2",
        title: "Papa de abóbora com carne moída",
        description: "Abóbora amassada com carne moída bem cozida e triturada.",
        prep: "Cozinhe a abóbora até desmanchar. Cozinhe a carne moída, escorra bem e triture junto com a abóbora.",
        ingredients: [
          { name: "Abóbora", category: "feira" },
          { name: "Carne moída", category: "mercado" },
        ],
      },
      {
        id: "6-7-jantar-3",
        title: "Papa de brócolis com batata",
        description: "Purê leve de brócolis e batata.",
        prep: "Cozinhe o brócolis e a batata no vapor até ficarem macios e amasse bem juntos.",
        ingredients: [
          { name: "Brócolis", category: "feira" },
          { name: "Batata", category: "feira" },
        ],
      },
    ],
  },
  "8-9": {
    cafe: [
      {
        id: "8-9-cafe-1",
        title: "Banana amassada grosseiramente com aveia",
        description: "Textura mais grossa, com pequenos pedaços.",
        prep: "Amasse a banana deixando pequenos pedacinhos. Misture aveia em flocos e sirva com uma colherzinha.",
        ingredients: [
          { name: "Banana", category: "feira" },
          { name: "Aveia em flocos", category: "mercado" },
        ],
      },
      {
        id: "8-9-cafe-2",
        title: "Palitos de pêra macia",
        description: "Pera cozida em palitos para pegar com a mão.",
        prep: "Cozinhe a pera no vapor até ficar macia, corte em palitos grandes o suficiente para a mãozinha do bebê segurar.",
        ingredients: [{ name: "Pera", category: "feira" }],
      },
      {
        id: "8-9-cafe-3",
        title: "Mingau grosso de milho",
        description: "Mingau engrossado, sem coar.",
        prep: "Cozinhe o fubá com leite (materno, fórmula ou vegetal) até engrossar, deixando pequenos grumos.",
        ingredients: [{ name: "Fubá de milho", category: "mercado" }],
      },
    ],
    almoco: [
      {
        id: "8-9-almoco-1",
        title: "Arroz, feijão e frango desfiado grosso",
        description: "Já com pedaços pequenos e textura mais firme.",
        prep: "Sirva arroz e feijão amassados grosseiramente com o garfo, junto com frango desfiado em fios um pouco mais grossos.",
        ingredients: [
          { name: "Arroz", category: "mercado" },
          { name: "Feijão", category: "mercado" },
          { name: "Peito de frango", category: "mercado" },
        ],
      },
      {
        id: "8-9-almoco-2",
        title: "Palitos de batata-doce e brócolis",
        description: "Legumes cozidos em pedaços que o bebê segura sozinho.",
        prep: "Cozinhe a batata-doce e o brócolis no vapor até ficarem macios, cortados em palitos e floretes fáceis de segurar.",
        ingredients: [
          { name: "Batata-doce", category: "feira" },
          { name: "Brócolis", category: "feira" },
        ],
      },
      {
        id: "8-9-almoco-3",
        title: "Purê grosso de abóbora com carne moída",
        description: "Textura menos lisa, com pedacinhos de carne.",
        prep: "Cozinhe a abóbora e amasse deixando pedacinhos. Misture a carne moída bem cozida, sem triturar totalmente.",
        ingredients: [
          { name: "Abóbora", category: "feira" },
          { name: "Carne moída", category: "mercado" },
        ],
      },
    ],
    lanche: [
      {
        id: "8-9-lanche-1",
        title: "Cubos macios de manga",
        description: "Manga madura em cubos pequenos.",
        prep: "Corte a manga madura em cubinhos pequenos e macios, fáceis de amassar com a gengiva.",
        ingredients: [{ name: "Manga", category: "feira" }],
      },
      {
        id: "8-9-lanche-2",
        title: "Iogurte natural com banana amassada",
        description: "Iogurte integral sem açúcar com banana.",
        prep: "Misture o iogurte natural integral com banana bem amassada.",
        ingredients: [
          { name: "Iogurte natural integral", category: "mercado" },
          { name: "Banana", category: "feira" },
        ],
      },
      {
        id: "8-9-lanche-3",
        title: "Palitos de melão",
        description: "Melão em palitos macios.",
        prep: "Corte o melão maduro em palitos ou cubos grandes, fáceis de segurar.",
        ingredients: [{ name: "Melão", category: "feira" }],
      },
    ],
    jantar: [
      {
        id: "8-9-jantar-1",
        title: "Sopa engrossada de legumes com frango",
        description: "Sopa menos líquida, com pedacinhos visíveis.",
        prep: "Cozinhe os legumes e o frango, amasse parcialmente deixando pedaços pequenos e uma consistência mais grossa.",
        ingredients: [
          { name: "Cenoura", category: "feira" },
          { name: "Chuchu", category: "feira" },
          { name: "Peito de frango", category: "mercado" },
        ],
      },
      {
        id: "8-9-jantar-2",
        title: "Purê grosso de mandioquinha com ovo mexido",
        description: "Mandioquinha amassada com ovo mexido macio.",
        prep: "Cozinhe e amasse a mandioquinha deixando pedacinhos. Misture o ovo mexido bem cozido e desmanchado.",
        ingredients: [
          { name: "Mandioquinha", category: "feira" },
          { name: "Ovo", category: "mercado" },
        ],
      },
      {
        id: "8-9-jantar-3",
        title: "Palitos de abobrinha grelhada",
        description: "Abobrinha em palitos macios com arroz amassado.",
        prep: "Grelhe ou cozinhe a abobrinha em tiras até ficar macia. Sirva com arroz levemente amassado.",
        ingredients: [
          { name: "Abobrinha", category: "feira" },
          { name: "Arroz", category: "mercado" },
        ],
      },
    ],
  },
  "10-12": {
    cafe: [
      {
        id: "10-12-cafe-1",
        title: "Pão macio com banana em rodelas",
        description: "Pequenos pedaços de pão com fruta.",
        prep: "Corte o pão macio (sem casca dura) em tiras e sirva com rodelas de banana.",
        ingredients: [
          { name: "Pão de forma integral", category: "mercado" },
          { name: "Banana", category: "feira" },
        ],
      },
      {
        id: "10-12-cafe-2",
        title: "Omelete fatiado com legumes picados",
        description: "Ovo em tiras com pedacinhos de legumes.",
        prep: "Faça um omelete simples com legumes bem picadinhos e corte em tiras compridas.",
        ingredients: [
          { name: "Ovo", category: "mercado" },
          { name: "Cenoura", category: "feira" },
        ],
      },
      {
        id: "10-12-cafe-3",
        title: "Cuscuz com manga picada",
        description: "Cuscuz em pedaços com fruta picada.",
        prep: "Sirva pequenos pedaços de cuscuz de milho junto com cubos de manga madura.",
        ingredients: [
          { name: "Flocão de milho", category: "mercado" },
          { name: "Manga", category: "feira" },
        ],
      },
    ],
    almoco: [
      {
        id: "10-12-almoco-1",
        title: "Arroz, feijão, carne em pedacinhos e legumes",
        description: "Prato completo, tudo em pedaços pequenos.",
        prep: "Sirva arroz, feijão, carne bem cozida picadinha e legumes cozidos em pedaços pequenos.",
        ingredients: [
          { name: "Arroz", category: "mercado" },
          { name: "Feijão", category: "mercado" },
          { name: "Carne bovina", category: "mercado" },
          { name: "Vagem", category: "feira" },
        ],
      },
      {
        id: "10-12-almoco-2",
        title: "Nhoque macio de batata com molho de tomate",
        description: "Massinha macia com molho caseiro simples.",
        prep: "Sirva pequenos pedaços de nhoque de batata caseiro com molho de tomate leve, sem sal em excesso.",
        ingredients: [
          { name: "Batata", category: "feira" },
          { name: "Tomate", category: "feira" },
        ],
      },
      {
        id: "10-12-almoco-3",
        title: "Peixe desfiado com purê grosso de abóbora",
        description: "Peixe sem espinhas em pedaços com purê.",
        prep: "Cozinhe o peixe, confira bem que não há espinhas e desfie em pedaços. Sirva com purê grosso de abóbora.",
        ingredients: [
          { name: "Filé de peixe", category: "mercado" },
          { name: "Abóbora", category: "feira" },
        ],
      },
    ],
    lanche: [
      {
        id: "10-12-lanche-1",
        title: "Cubos de queijo branco macio com uva sem casca",
        description: "Queijo e fruta em pedaços pequenos.",
        prep: "Corte queijo branco macio e uvas sem casca (e sem sementes) em pedaços bem pequenos.",
        ingredients: [
          { name: "Queijo branco", category: "mercado" },
          { name: "Uva", category: "feira" },
        ],
      },
      {
        id: "10-12-lanche-2",
        title: "Vitamina de banana com aveia",
        description: "Vitamina levinha, servida no copinho.",
        prep: "Bata a banana com leite (materno, fórmula ou vegetal) e uma colher de aveia. Sirva no copo de treino.",
        ingredients: [
          { name: "Banana", category: "feira" },
          { name: "Aveia em flocos", category: "mercado" },
        ],
      },
      {
        id: "10-12-lanche-3",
        title: "Biscoito caseiro de banana e aveia",
        description: "Mini biscoitinhos macios.",
        prep: "Amasse banana, misture com aveia e leve ao forno em pequenas porções até dourar levemente.",
        ingredients: [
          { name: "Banana", category: "feira" },
          { name: "Aveia em flocos", category: "mercado" },
        ],
      },
    ],
    jantar: [
      {
        id: "10-12-jantar-1",
        title: "Purê grosso de mandioquinha com frango picado",
        description: "Purê com pedacinhos de frango.",
        prep: "Amasse a mandioquinha deixando pedaços e misture frango cozido bem picadinho.",
        ingredients: [
          { name: "Mandioquinha", category: "feira" },
          { name: "Peito de frango", category: "mercado" },
        ],
      },
      {
        id: "10-12-jantar-2",
        title: "Sopa grossa de legumes com carne moída",
        description: "Sopa encorpada, com pedaços visíveis.",
        prep: "Cozinhe os legumes e a carne moída, mantendo uma boa parte em pedaços pequenos.",
        ingredients: [
          { name: "Chuchu", category: "feira" },
          { name: "Cenoura", category: "feira" },
          { name: "Carne moída", category: "mercado" },
        ],
      },
      {
        id: "10-12-jantar-3",
        title: "Panquequinha de legumes",
        description: "Panqueca macia cortada em tiras.",
        prep: "Prepare uma panqueca simples com legumes ralados e ovo, corte em tiras finas.",
        ingredients: [
          { name: "Ovo", category: "mercado" },
          { name: "Abobrinha", category: "feira" },
        ],
      },
    ],
  },
  "13-24": {
    cafe: [
      {
        id: "13-24-cafe-1",
        title: "Pão integral com queijo e fruta picada",
        description: "Café da manhã da família, em porção pequena.",
        prep: "Sirva pão integral com queijo, acompanhado de fruta picada em pedaços que a criança já mastiga bem.",
        ingredients: [
          { name: "Pão integral", category: "mercado" },
          { name: "Queijo branco", category: "mercado" },
          { name: "Mamão", category: "feira" },
        ],
      },
      {
        id: "13-24-cafe-2",
        title: "Panqueca de banana",
        description: "Panqueca fatiada, sem açúcar.",
        prep: "Prepare uma panqueca simples de banana e aveia, corte em pedaços pequenos.",
        ingredients: [
          { name: "Banana", category: "feira" },
          { name: "Aveia em flocos", category: "mercado" },
        ],
      },
      {
        id: "13-24-cafe-3",
        title: "Tapioca com queijo",
        description: "Tapioca em pedaços com queijo derretido.",
        prep: "Prepare uma tapioca simples com queijo e corte em pedaços fáceis de pegar.",
        ingredients: [
          { name: "Goma de tapioca", category: "mercado" },
          { name: "Queijo branco", category: "mercado" },
        ],
      },
    ],
    almoco: [
      {
        id: "13-24-almoco-1",
        title: "Feijoada leve da família (adaptada)",
        description: "Versão com pouco sal e sem temperos fortes.",
        prep: "Separe uma porção da refeição da família antes de temperar pesado, com arroz, feijão, carne e legumes em pedaços pequenos.",
        ingredients: [
          { name: "Arroz", category: "mercado" },
          { name: "Feijão", category: "mercado" },
          { name: "Carne suína", category: "mercado" },
          { name: "Couve", category: "feira" },
        ],
      },
      {
        id: "13-24-almoco-2",
        title: "Macarrão ao sugo com carne moída",
        description: "Massa em pedaços pequenos com molho caseiro.",
        prep: "Sirva macarrão bem cozido, cortado em pedaços, com molho de tomate caseiro e carne moída.",
        ingredients: [
          { name: "Macarrão", category: "mercado" },
          { name: "Tomate", category: "feira" },
          { name: "Carne moída", category: "mercado" },
        ],
      },
      {
        id: "13-24-almoco-3",
        title: "Peixe grelhado com arroz e legumes",
        description: "Prato completo de peixe sem espinhas.",
        prep: "Grelhe o peixe (conferindo espinhas), sirva com arroz e legumes cozidos em pedaços.",
        ingredients: [
          { name: "Filé de peixe", category: "mercado" },
          { name: "Arroz", category: "mercado" },
          { name: "Vagem", category: "feira" },
        ],
      },
    ],
    lanche: [
      {
        id: "13-24-lanche-1",
        title: "Frutas picadas variadas",
        description: "Mix de frutas da estação em pedaços.",
        prep: "Corte frutas variadas (maçã, banana, mamão) em pedaços pequenos e sirva juntas.",
        ingredients: [
          { name: "Maçã", category: "feira" },
          { name: "Banana", category: "feira" },
          { name: "Mamão", category: "feira" },
        ],
      },
      {
        id: "13-24-lanche-2",
        title: "Iogurte com granola macia",
        description: "Iogurte natural com um pouco de granola sem açúcar.",
        prep: "Misture iogurte natural integral com uma colher de granola sem açúcar e sem pedaços duros.",
        ingredients: [
          { name: "Iogurte natural integral", category: "mercado" },
          { name: "Granola", category: "mercado" },
        ],
      },
      {
        id: "13-24-lanche-3",
        title: "Bolo caseiro de cenoura (pouco açúcar)",
        description: "Fatia pequena de bolo caseiro simples.",
        prep: "Sirva uma fatia pequena de bolo de cenoura caseiro, com pouco açúcar e sem cobertura.",
        ingredients: [
          { name: "Cenoura", category: "feira" },
          { name: "Farinha de trigo", category: "mercado" },
        ],
      },
    ],
    jantar: [
      {
        id: "13-24-jantar-1",
        title: "Sopa de legumes com frango da família",
        description: "Sopa encorpada, porção reservada antes do sal extra.",
        prep: "Separe uma porção da sopa da família antes de temperar pesado, com pedaços macios de frango e legumes.",
        ingredients: [
          { name: "Peito de frango", category: "mercado" },
          { name: "Batata", category: "feira" },
          { name: "Cenoura", category: "feira" },
        ],
      },
      {
        id: "13-24-jantar-2",
        title: "Purê de mandioquinha com ovo e legumes",
        description: "Prato macio e nutritivo, em pedaços.",
        prep: "Sirva purê de mandioquinha com ovo mexido e legumes cozidos em pedaços pequenos.",
        ingredients: [
          { name: "Mandioquinha", category: "feira" },
          { name: "Ovo", category: "mercado" },
        ],
      },
      {
        id: "13-24-jantar-3",
        title: "Risoto simples de legumes",
        description: "Arroz cremoso com legumes picados.",
        prep: "Prepare um risoto simples de legumes, com pouco sal, e sirva em porção pequena.",
        ingredients: [
          { name: "Arroz arbóreo", category: "mercado" },
          { name: "Abobrinha", category: "feira" },
        ],
      },
    ],
  },
};

// --- Restrição alimentar (Sessão 5) -----------------------------------

export type AllergenTag = "leite" | "ovo" | "gluten";

export type DietFilter = "padrao" | "sem_leite" | "sem_ovo" | "sem_gluten";

export const DIET_FILTER_LABEL: Record<DietFilter, string> = {
  padrao: "Padrão",
  sem_leite: "Sem leite",
  sem_ovo: "Sem ovo",
  sem_gluten: "Sem glúten",
};

const DIET_FILTER_TO_ALLERGEN: Record<DietFilter, AllergenTag | null> = {
  padrao: null,
  sem_leite: "leite",
  sem_ovo: "ovo",
  sem_gluten: "gluten",
};

export function allergenForDietFilter(filter: DietFilter): AllergenTag | null {
  return DIET_FILTER_TO_ALLERGEN[filter];
}

const ALLERGEN_KEYWORDS: Record<AllergenTag, string[]> = {
  leite: ["queijo", "iogurte", "leite"],
  ovo: ["ovo"],
  gluten: ["pão", "macarrão", "farinha de trigo", "cuscuz", "aveia"],
};

/** Deriva alergênicos a partir dos nomes dos ingredientes (heurística simples). */
export function inferAllergens(ingredients: Ingredient[]): AllergenTag[] {
  const found = new Set<AllergenTag>();
  for (const ingredient of ingredients) {
    const name = ingredient.name.toLowerCase();
    for (const [tag, keywords] of Object.entries(ALLERGEN_KEYWORDS) as [AllergenTag, string[]][]) {
      if (keywords.some((keyword) => name.includes(keyword))) found.add(tag);
    }
  }
  return [...found];
}

// --- Seleção de sugestão -------------------------------------------------

export interface SuggestionOptions {
  /** Índice explícito no pool — usado pelo botão "Trocar sugestão". */
  overrideIndex?: number;
  /** Alimentos (slugs) já provados pelo bebê — prioriza os ainda não experimentados. */
  triedFoodKeys?: Set<string>;
  /** Alergênico a evitar (Cardápio de Restrição). */
  avoidAllergen?: AllergenTag | null;
}

export function getSuggestion(
  ageBand: AgeBand,
  mealType: MealType,
  dayIndex: number,
  options: SuggestionOptions = {},
): MealSuggestion {
  const pool = MENU_POOL[ageBand][mealType];
  const { overrideIndex, triedFoodKeys, avoidAllergen } = options;

  if (overrideIndex !== undefined) {
    return pool[((overrideIndex % pool.length) + pool.length) % pool.length];
  }

  if (!triedFoodKeys && !avoidAllergen) {
    return pool[dayIndex % pool.length];
  }

  // Combina novidade (Diário do Bebê) e restrição alimentar num único score:
  // penaliza pesado quem contém o alergênico a evitar, soma 1 ponto por
  // ingrediente ainda não experimentado. Empate desfeito pelo ciclo do dia.
  let bestIndex = dayIndex % pool.length;
  let bestScore = -Infinity;

  pool.forEach((suggestion, index) => {
    let score = 0;
    if (avoidAllergen && inferAllergens(suggestion.ingredients).includes(avoidAllergen)) {
      score -= 1000;
    }
    if (triedFoodKeys) {
      for (const ingredient of suggestion.ingredients) {
        if (!triedFoodKeys.has(slugifyIngredient(ingredient.name))) score += 1;
      }
    }
    // Pequeno bônus para o índice "natural" do dia, só para desempatar.
    if (index === dayIndex % pool.length) score += 0.1;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return pool[bestIndex];
}

export function poolSize(ageBand: AgeBand, mealType: MealType): number {
  return MENU_POOL[ageBand][mealType].length;
}

export interface WeeklyMenuCell {
  day: DayKey;
  dayIndex: number;
  mealType: MealType;
  suggestion: MealSuggestion;
}

export function getWeeklyMenu(
  ageBand: AgeBand,
  options: Omit<SuggestionOptions, "overrideIndex"> = {},
): WeeklyMenuCell[][] {
  return DAYS.map((day, dayIndex) =>
    MEAL_TYPES.map(({ key: mealType }) => ({
      day: day.key,
      dayIndex,
      mealType,
      suggestion: getSuggestion(ageBand, mealType, dayIndex, options),
    })),
  );
}

/** Escolhe a refeição mais próxima do horário atual, para a sugestão "de hoje". */
export function mealTypeForNow(date: Date = new Date()): MealType {
  const hour = date.getHours();
  if (hour < 10) return "cafe";
  if (hour < 15) return "almoco";
  if (hour < 18) return "lanche";
  return "jantar";
}

export function getTodaySuggestion(
  ageBand: AgeBand,
  date: Date = new Date(),
  options: Omit<SuggestionOptions, "overrideIndex"> = {},
): { mealType: MealType; mealLabel: string; suggestion: MealSuggestion } {
  const mealType = mealTypeForNow(date);
  const dayIndex = todayDayIndex(date);
  const mealLabel = MEAL_TYPES.find((m) => m.key === mealType)!.label;
  return { mealType, mealLabel, suggestion: getSuggestion(ageBand, mealType, dayIndex, options) };
}

export interface ShoppingListItem {
  key: string;
  name: string;
  category: IngredientCategory;
}

export interface ShoppingListGroup {
  category: IngredientCategory;
  label: string;
  items: ShoppingListItem[];
}

export function slugifyIngredient(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  feira: "Feira",
  mercado: "Supermercado",
  outros: "Outros",
};

export function buildShoppingList(
  ageBand: AgeBand,
  options: Omit<SuggestionOptions, "overrideIndex"> = {},
): ShoppingListGroup[] {
  const seen = new Map<string, ShoppingListItem>();

  for (const week of getWeeklyMenu(ageBand, options)) {
    for (const cell of week) {
      for (const ingredient of cell.suggestion.ingredients) {
        const key = slugifyIngredient(ingredient.name);
        if (!seen.has(key)) {
          seen.set(key, { key, name: ingredient.name, category: ingredient.category });
        }
      }
    }
  }

  const groups: Record<IngredientCategory, ShoppingListItem[]> = {
    feira: [],
    mercado: [],
    outros: [],
  };

  for (const item of seen.values()) {
    groups[item.category].push(item);
  }

  (Object.keys(groups) as IngredientCategory[]).forEach((category) => {
    groups[category].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  });

  return (["feira", "mercado", "outros"] as IngredientCategory[])
    .filter((category) => groups[category].length > 0)
    .map((category) => ({ category, label: CATEGORY_LABEL[category], items: groups[category] }));
}

export { ageInMonths };
