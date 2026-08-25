import type { AgeBand } from "@/lib/menu";
import type { Region } from "@/lib/regions";

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[];
  emoji: string;
  cuts: Record<AgeBand, string>;
  warning?: string;
  /** Regiões onde este alimento é tradicional (ausente ou vazio = nacional). */
  regiao?: Region[];
  /** Status de revisão para novos alimentos regionais. Alimentos sem esse campo são considerados aprovados. */
  revisao?: "pendente" | "aprovado";
  /** Prioridade de revisão — "alta" para alimentos com risco de segurança específico. */
  prioridadeRevisao?: "normal" | "alta";
  /** Idade mínima em meses (quando diferente do padrão de 6m). */
  minAgeMonths?: number;
  /** Adequado para marmitas/lancheiras de creche/escola (não vaza, aguenta algumas horas, sem necessidade de talher complexo). */
  adequado_lancheira?: boolean;
  /** Alergênicos de declaração para cuidados escolares. */
  alergenico_declarado?: string[];
  /** URL do vídeo explicativo ou da comunidade */
  video_url?: string;
  /** Tipo de vídeo: animação ilustrada 2D ou vídeo real da comunidade */
  video_tipo?: "motion_graphic" | "comunidade" | null;
  /** Status de moderação do vídeo */
  video_status?: "nenhum" | "pendente_moderacao" | "aprovado" | "rejeitado";
  /** ID da usuária autora (para vídeos da comunidade) */
  video_autor_user_id?: string | null;
  /** Idade do bebê no momento do vídeo */
  video_baby_age_months?: number;
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    adequado_lancheira: true,
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
    alergenico_declarado: ["peixe"],
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
    adequado_lancheira: true,
    alergenico_declarado: ["ovo"],
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
    adequado_lancheira: true,
    alergenico_declarado: ["leite"],
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
    adequado_lancheira: true,
    alergenico_declarado: ["gluten"],
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
  // ─── Alimentos Regionais ─── (todos com revisao: "pendente")

  // Norte
  {
    id: "acai",
    name: "Açaí",
    aliases: [],
    emoji: "🟣",
    cuts: {
      "6-7": "Não recomendado abaixo de 12 meses.",
      "8-9": "Não recomendado abaixo de 12 meses.",
      "10-12": "Não recomendado abaixo de 12 meses.",
      "13-24": "Puro, sem açúcar, bem batido e liso. Pode misturar com banana amassada.",
    },
    warning: "Açaí pode causar reação alérgica em alguns bebês. Introduza em pequena quantidade, observe por 3 dias. NUNCA ofereça com açúcar, xarope de guaraná ou leite condensado.",
    regiao: ["norte"],
    revisao: "pendente",
    prioridadeRevisao: "alta",
    minAgeMonths: 12,
  },
  {
    id: "tucuma",
    name: "Tucumã",
    aliases: [],
    emoji: "🟠",
    cuts: {
      "6-7": "Não recomendado abaixo de 12 meses — textura muito fibrosa.",
      "8-9": "Não recomendado abaixo de 12 meses — textura muito fibrosa.",
      "10-12": "Não recomendado abaixo de 12 meses — textura muito fibrosa.",
      "13-24": "Polpa retirada do caroço, bem amassada ou batida em purê. Nunca oferecer com o caroço.",
    },
    warning: "Tucumã tem textura muito fibrosa e caroço duro. Retirar toda a polpa do caroço e amassar bem antes de oferecer.",
    regiao: ["norte"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 12,
  },
  {
    id: "cupuacu",
    name: "Cupuaçu",
    aliases: [],
    emoji: "🤎",
    cuts: {
      "6-7": "Polpa pura bem batida e coada, sem sementes. Sabor ácido — misturar com banana para suavizar.",
      "8-9": "Polpa batida, pode ser mais grossa. Misturar com frutas doces.",
      "10-12": "Polpa em pedacinhos macios ou batida.",
      "13-24": "Polpa em pedaços pequenos ou misturada em preparações.",
    },
    regiao: ["norte"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 8,
  },
  {
    id: "tambaqui",
    name: "Tambaqui",
    aliases: ["peixe-de-rio"],
    emoji: "🐟",
    cuts: {
      "6-7": "Cozido, desfiado em fios bem finos, verificando manualmente cada porção para retirar espinhas.",
      "8-9": "Cozido e desfiado, em pedacinhos macios. Checar espinhas antes de servir.",
      "10-12": "Cozido, em lascas pequenas. Sempre verificar espinhas.",
      "13-24": "Cozido ou assado, em pedaços pequenos. Continuar checando espinhas.",
    },
    warning: "Peixe de rio tem muitas espinhas finas. SEMPRE verifique manualmente cada porção antes de oferecer ao bebê — passe os dedos pelo peixe desfiado para sentir espinhas escondidas.",
    regiao: ["norte"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },
  {
    id: "pirarucu",
    name: "Pirarucu",
    aliases: ["bacalhau-da-amazônia"],
    emoji: "🐟",
    cuts: {
      "6-7": "Cozido e desfiado bem fino, checando espinhas manualmente antes de servir.",
      "8-9": "Cozido e desfiado, em pedacinhos macios. Checar espinhas.",
      "10-12": "Cozido, em lascas pequenas. Sempre verificar espinhas.",
      "13-24": "Cozido ou assado, em pedaços pequenos. Continuar checando espinhas.",
    },
    warning: "Peixe de rio — SEMPRE cheque manualmente cada porção para espinhas antes de servir.",
    regiao: ["norte"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },
  {
    id: "tucunare",
    name: "Tucunaré",
    aliases: [],
    emoji: "🐟",
    cuts: {
      "6-7": "Cozido e desfiado bem fino, checando espinhas manualmente.",
      "8-9": "Cozido e desfiado em pedacinhos. Checar espinhas.",
      "10-12": "Cozido, em lascas pequenas. Verificar espinhas.",
      "13-24": "Cozido ou grelhado, em pedaços pequenos. Checar espinhas.",
    },
    warning: "Peixe de rio — SEMPRE cheque manualmente cada porção para espinhas antes de servir.",
    regiao: ["norte"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },

  // Nordeste
  {
    id: "umbu",
    name: "Umbu",
    aliases: ["imbu"],
    emoji: "🟢",
    cuts: {
      "6-7": "Não recomendado abaixo de 8 meses — sabor ácido e textura irregular.",
      "8-9": "Maduro, polpa amassada. Preferir bem maduro para reduzir a acidez.",
      "10-12": "Polpa amassada ou em pedacinhos macios, bem maduro.",
      "13-24": "Polpa em pedaços pequenos. Retirar caroço e casca.",
    },
    regiao: ["nordeste"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 8,
  },
  {
    id: "caju-fruta",
    name: "Caju (fruta)",
    aliases: ["pseudofruto-do-caju"],
    emoji: "🟡",
    cuts: {
      "6-7": "Não recomendado abaixo de 8 meses — fibras longas podem ser difíceis.",
      "8-9": "Maduro, suco espremido na hora (sem adição de açúcar). Coar bem para tirar fibras.",
      "10-12": "Suco coado ou polpa cozida e amassada.",
      "13-24": "Polpa madura em pedacinhos ou suco natural.",
    },
    warning: "Apenas a FRUTA (pedúnculo). A castanha de caju é alérgeno de declaração obrigatória — não confundir.",
    regiao: ["nordeste"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 8,
  },
  {
    id: "feijao-de-corda",
    name: "Feijão-de-corda",
    aliases: ["feijão-fradinho", "feijão-macássa", "feijão-caupi"],
    emoji: "🫘",
    cuts: {
      "6-7": "Cozido até ficar bem mole, amassado com garfo até virar purê. Usar o caldo grosso.",
      "8-9": "Cozido e levemente amassado, com caldo.",
      "10-12": "Cozido, grãos inteiros bem macios.",
      "13-24": "Cozido normalmente, como feijão da família.",
    },
    regiao: ["nordeste"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },

  // Centro-Oeste
  {
    id: "pequi",
    name: "Pequi",
    aliases: [],
    emoji: "💛",
    cuts: {
      "6-7": "NÃO oferecer — risco de segurança alto, caroço com espinhos internos.",
      "8-9": "NÃO oferecer — risco de segurança alto, caroço com espinhos internos.",
      "10-12": "NÃO oferecer — risco de segurança alto, caroço com espinhos internos.",
      "13-24": "SOMENTE a polpa raspada com colher ao redor do caroço. NUNCA morder, roer ou quebrar o caroço — tem espinhos internos que perfuram boca e garganta.",
    },
    warning: "⚠️ RISCO ALTO DE SEGURANÇA: O caroço do pequi contém milhares de espinhos finíssimos por dentro. NUNCA morder, roer ou quebrar o caroço. A polpa deve ser raspada cuidadosamente com colher, sem encostar nos espinhos. Oferecer apenas para crianças acima de 13 meses, com supervisão constante e preparo exclusivamente por adulto.",
    regiao: ["centro_oeste"],
    revisao: "pendente",
    prioridadeRevisao: "alta",
    minAgeMonths: 13,
  },
  {
    id: "guariroba",
    name: "Guariroba",
    aliases: ["palmito-amargo", "gueroba"],
    emoji: "🌴",
    cuts: {
      "6-7": "Não recomendado abaixo de 10 meses — sabor amargo e textura firme.",
      "8-9": "Não recomendado abaixo de 10 meses — sabor amargo e textura firme.",
      "10-12": "Cozida por bastante tempo até ficar bem macia, picada bem miúda. O amargor é natural.",
      "13-24": "Cozida e picada em pedaços pequenos. Pode ser refogada com temperos suaves.",
    },
    regiao: ["centro_oeste"],
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 10,
  },

  // Sul
  // Nota: Erva-mate NÃO é alimento para bebê — não incluir como ficha.
  {
    id: "pinhao",
    name: "Pinhão",
    aliases: [],
    emoji: "🌰",
    cuts: {
      "6-7": "Não recomendado abaixo de 10 meses — risco de engasgo pela textura firme.",
      "8-9": "Não recomendado abaixo de 10 meses — risco de engasgo pela textura firme.",
      "10-12": "Bem cozido (pressão por 40 min), amassado com garfo ou picado bem miúdo.",
      "13-24": "Bem cozido, picado em pedaços pequenos. Nunca oferecer cru ou mal cozido.",
    },
    warning: "Pinhão mal cozido ou em pedaços grandes é risco de engasgo. Sempre cozinhar muito bem (panela de pressão por 40 minutos) e picar em pedaços bem pequenos.",
    regiao: ["sul"],
    revisao: "pendente",
    prioridadeRevisao: "alta",
    minAgeMonths: 10,
  },
];

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function searchFoods(query: string, userRegion?: Region | null): FoodItem[] {
  const q = normalize(query);
  if (!q) return [];

  const matches = FOODS.filter((food) => {
    // Alimentos pendentes de revisão não aparecem na busca pública
    if (food.revisao === "pendente") return false;
    if (normalize(food.name).includes(q)) return true;
    return food.aliases.some((alias) => normalize(alias.replace(/-/g, " ")).includes(q));
  });

  if (!userRegion) return matches;

  // Priorizar alimentos da região da usuária quando houver ambiguidade
  return matches.sort((a, b) => {
    const aRegional = a.regiao?.includes(userRegion) ? 1 : 0;
    const bRegional = b.regiao?.includes(userRegion) ? 1 : 0;
    return bRegional - aRegional;
  });
}

/** Retorna todos os alimentos, incluindo pendentes (para o painel de revisão admin). */
export function getAllFoods(): FoodItem[] {
  return FOODS;
}

/** Retorna alimentos pendentes de revisão (para o painel admin). */
export function getPendingFoods(): FoodItem[] {
  return FOODS.filter((food) => food.revisao === "pendente");
}
