import type { AgeBand } from "@/lib/menu";

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[];
  emoji: string;
  cuts: Record<AgeBand, string>;
  warning?: string;
}

export const FOODS: FoodItem[] = [
  {
    id: "banana",
    name: "Banana",
    aliases: [],
    emoji: "🍌",
    cuts: {
      "6-7": "Amassada bem madura, ou em bastão grosso do tamanho da mão (BLW).",
      "8-9": "Em pedaços pequenos e macios, ou meio amassada.",
      "10-12": "Cortada em rodelas ou cubos pequenos.",
      "13-24": "Cortada em pedaços pequenos, como o resto da família.",
    },
  },
  {
    id: "maca",
    name: "Maçã",
    aliases: [],
    emoji: "🍎",
    cuts: {
      "6-7": "Cozida no vapor até ficar bem macia e amassada. Nunca crua e inteira.",
      "8-9": "Cozida e em pedaços pequenos e macios.",
      "10-12": "Ralada ou cozida em pedaços pequenos.",
      "13-24": "Crua, ralada ou em fatias bem finas. Evite pedaços grandes e duros.",
    },
    warning: "Maçã crua em pedaços grandes é risco de engasgo em qualquer idade nesta fase — rale ou cozinhe.",
  },
  {
    id: "pera",
    name: "Pera",
    aliases: [],
    emoji: "🍐",
    cuts: {
      "6-7": "Cozida no vapor e amassada, ou em palitos macios cozidos.",
      "8-9": "Cozida, em pedaços pequenos e macios.",
      "10-12": "Madura, em pedaços pequenos, crua ou cozida.",
      "13-24": "Madura, em pedaços pequenos.",
    },
  },
  {
    id: "mamao",
    name: "Mamão",
    aliases: [],
    emoji: "🧡",
    cuts: {
      "6-7": "Bem maduro, amassado ou em bastões grandes e macios.",
      "8-9": "Em pedaços pequenos e macios.",
      "10-12": "Em cubos pequenos.",
      "13-24": "Em cubos pequenos.",
    },
  },
  {
    id: "manga",
    name: "Manga",
    aliases: [],
    emoji: "🥭",
    cuts: {
      "6-7": "Bem madura, amassada ou em bastões macios.",
      "8-9": "Em pedaços pequenos e macios.",
      "10-12": "Em cubos pequenos.",
      "13-24": "Em cubos pequenos.",
    },
  },
  {
    id: "uva",
    name: "Uva",
    aliases: [],
    emoji: "🍇",
    cuts: {
      "6-7": "Não recomendada inteira. Se oferecer, cozida e bem amassada.",
      "8-9": "Cortada em quartos, sem casca e sem semente. Nunca inteira.",
      "10-12": "Cortada em quartos, sem casca e sem semente. Nunca inteira.",
      "13-24": "Cortada ao menos ao meio (idealmente em quartos), sem casca. Nunca inteira.",
    },
    warning: "Uva inteira é uma das principais causas de engasgo grave em crianças pequenas — corte sempre, em qualquer idade.",
  },
  {
    id: "morango",
    name: "Morango",
    aliases: [],
    emoji: "🍓",
    cuts: {
      "6-7": "Amassado ou em fatias grossas e macias.",
      "8-9": "Cortado em pedaços pequenos.",
      "10-12": "Cortado em pedaços pequenos ou fatias.",
      "13-24": "Cortado ao meio ou em fatias.",
    },
  },
  {
    id: "tomate",
    name: "Tomate",
    aliases: ["tomate-cereja"],
    emoji: "🍅",
    cuts: {
      "6-7": "Sem pele e sementes, cozido e amassado.",
      "8-9": "Sem pele, em pedaços pequenos e macios.",
      "10-12": "Em pedaços pequenos, sem pele se possível.",
      "13-24": "Em pedaços. Se for tomate-cereja, corte sempre ao meio ou em quartos.",
    },
    warning: "Tomate-cereja ou uva inteiros são risco de engasgo — corte sempre em quartos.",
  },
  {
    id: "cenoura",
    name: "Cenoura",
    aliases: [],
    emoji: "🥕",
    cuts: {
      "6-7": "Cozida até ficar bem macia, amassada ou em bastão mole.",
      "8-9": "Cozida, em pedaços pequenos e macios.",
      "10-12": "Cozida, em rodelas ou pedaços pequenos.",
      "13-24": "Cozida, em pedaços. Evite crua e crocante nesta fase.",
    },
    warning: "Cenoura crua e dura é risco de engasgo — sempre cozinhe até ficar macia.",
  },
  {
    id: "batata-doce",
    name: "Batata-doce",
    aliases: [],
    emoji: "🍠",
    cuts: {
      "6-7": "Cozida e amassada, ou em bastão macio.",
      "8-9": "Cozida, em pedaços pequenos e macios.",
      "10-12": "Cozida, em cubos pequenos.",
      "13-24": "Cozida, em pedaços ou cubos.",
    },
  },
  {
    id: "batata",
    name: "Batata",
    aliases: [],
    emoji: "🥔",
    cuts: {
      "6-7": "Cozida e amassada, ou em bastão macio.",
      "8-9": "Cozida, em pedaços pequenos e macios.",
      "10-12": "Cozida, em cubos pequenos.",
      "13-24": "Cozida, em pedaços ou cubos.",
    },
  },
  {
    id: "abobrinha",
    name: "Abobrinha",
    aliases: [],
    emoji: "🥒",
    cuts: {
      "6-7": "Cozida e amassada, ou em bastão bem macio.",
      "8-9": "Cozida, em pedaços pequenos e macios.",
      "10-12": "Cozida, em pedaços pequenos.",
      "13-24": "Cozida, em pedaços.",
    },
  },
  {
    id: "brocolis",
    name: "Brócolis",
    aliases: [],
    emoji: "🥦",
    cuts: {
      "6-7": "Cozido até ficar bem macio, em floretes grandes (BLW) ou amassado.",
      "8-9": "Cozido, em floretes pequenos e macios.",
      "10-12": "Cozido, em pedaços pequenos.",
      "13-24": "Cozido, em pedaços pequenos.",
    },
  },
  {
    id: "frango",
    name: "Frango",
    aliases: ["peito-de-frango"],
    emoji: "🍗",
    cuts: {
      "6-7": "Bem cozido e desfiado bem fino, triturado na papa.",
      "8-9": "Desfiado em fios um pouco mais grossos.",
      "10-12": "Picado em pedaços pequenos e macios.",
      "13-24": "Em pedaços pequenos, sempre bem cozido.",
    },
    warning: "Verifique sempre que não há ossos ou cartilagens antes de servir.",
  },
  {
    id: "carne-moida",
    name: "Carne moída",
    aliases: [],
    emoji: "🍖",
    cuts: {
      "6-7": "Bem cozida e triturada junto com o purê.",
      "8-9": "Bem cozida, em pedacinhos soltos.",
      "10-12": "Bem cozida, em pedaços pequenos.",
      "13-24": "Bem cozida, em pedaços.",
    },
  },
  {
    id: "peixe",
    name: "Peixe",
    aliases: [],
    emoji: "🐟",
    cuts: {
      "6-7": "Cozido e desfiado bem fino, sem espinhas.",
      "8-9": "Desfiado, sem espinhas, em pedaços macios.",
      "10-12": "Em pedaços pequenos, sem espinhas.",
      "13-24": "Em pedaços, sem espinhas.",
    },
    warning: "Confira com cuidado se não há nenhuma espinha antes de servir, em qualquer idade.",
  },
  {
    id: "ovo",
    name: "Ovo",
    aliases: [],
    emoji: "🥚",
    cuts: {
      "6-7": "Bem cozido (gema e clara firmes), amassado ou em tiras de omelete.",
      "8-9": "Bem cozido, em pedaços pequenos.",
      "10-12": "Bem cozido, em pedaços.",
      "13-24": "Bem cozido, em pedaços.",
    },
    warning: "Sempre sirva totalmente cozido, nunca cru ou mole, para evitar risco de contaminação.",
  },
  {
    id: "queijo",
    name: "Queijo",
    aliases: [],
    emoji: "🧀",
    cuts: {
      "6-7": "Queijo branco macio (tipo minas frescal), em pequena quantidade.",
      "8-9": "Queijo branco macio, em pedaços pequenos.",
      "10-12": "Em cubos pequenos e macios.",
      "13-24": "Em cubos ou fatias finas.",
    },
    warning: "Evite queijos duros ou em cubos grandes, que podem ser risco de engasgo.",
  },
  {
    id: "pao",
    name: "Pão",
    aliases: [],
    emoji: "🍞",
    cuts: {
      "6-7": "Pão macio sem casca dura, em tiras compridas (BLW).",
      "8-9": "Pão macio, em pedaços pequenos.",
      "10-12": "Em pedaços pequenos.",
      "13-24": "Em pedaços.",
    },
  },
  {
    id: "amendoim",
    name: "Amendoim",
    aliases: ["pasta-de-amendoim"],
    emoji: "🥜",
    cuts: {
      "6-7": "Nunca inteiro. Apenas pasta de amendoim lisa, bem diluída em água ou fruta.",
      "8-9": "Apenas pasta de amendoim lisa, em pequena quantidade, observando reação.",
      "10-12": "Pasta de amendoim lisa espalhada fina. Nunca em grãos inteiros.",
      "13-24": "Pasta de amendoim lisa. Amendoim inteiro só é seguro depois dos 4-5 anos.",
    },
    warning: "Amendoim inteiro ou picado grosso é risco grave de engasgo até os 4-5 anos, além de ser um alérgeno comum: introduza com atenção e observe reações por alguns dias.",
  },
  {
    id: "pipoca",
    name: "Pipoca",
    aliases: [],
    emoji: "🍿",
    cuts: {
      "6-7": "Não recomendada nesta fase.",
      "8-9": "Não recomendada nesta fase.",
      "10-12": "Não recomendada nesta fase.",
      "13-24": "Evite até os 4 anos.",
    },
    warning: "Pipoca é um dos maiores riscos de engasgo em crianças pequenas — evite até pelo menos os 4 anos.",
  },
  {
    id: "salsicha",
    name: "Salsicha",
    aliases: ["linguica"],
    emoji: "🌭",
    cuts: {
      "6-7": "Não recomendada nesta fase (ultraprocessado, alto sódio).",
      "8-9": "Evite; prefira proteínas frescas.",
      "10-12": "Se oferecer ocasionalmente, corte no sentido do comprimento, nunca em rodelas.",
      "13-24": "Ocasionalmente, corte no sentido do comprimento, nunca em rodelas.",
    },
    warning: "Salsicha em rodelas é um risco clássico de engasgo — se oferecer, corte sempre ao comprido e em tiras finas.",
  },
  {
    id: "mel",
    name: "Mel",
    aliases: [],
    emoji: "🍯",
    cuts: {
      "6-7": "Não ofereça.",
      "8-9": "Não ofereça.",
      "10-12": "Não ofereça.",
      "13-24": "Só depois de 1 ano completo.",
    },
    warning: "Mel não deve ser oferecido antes de 1 ano de idade: risco de botulismo infantil.",
  },
  {
    id: "arroz",
    name: "Arroz",
    aliases: [],
    emoji: "🍚",
    cuts: {
      "6-7": "Bem cozido e amassado, com bastante água.",
      "8-9": "Bem cozido, soltinho.",
      "10-12": "Cozido, soltinho.",
      "13-24": "Cozido, como o resto da família.",
    },
  },
  {
    id: "feijao",
    name: "Feijão",
    aliases: [],
    emoji: "🫘",
    cuts: {
      "6-7": "Bem cozido, amassado, sem casca se possível.",
      "8-9": "Bem cozido, levemente amassado.",
      "10-12": "Bem cozido, inteiro (grãos macios).",
      "13-24": "Bem cozido, como o resto da família.",
    },
  },
];

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function searchFoods(query: string): FoodItem[] {
  const q = normalize(query);
  if (!q) return [];

  return FOODS.filter((food) => {
    if (normalize(food.name).includes(q)) return true;
    return food.aliases.some((alias) => normalize(alias.replace(/-/g, " ")).includes(q));
  });
}
