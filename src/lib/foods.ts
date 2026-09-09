import type { AgeBand } from "@/lib/menu";
import type { Region } from "@/lib/regions";
import type { LatamRegion } from "@/lib/latam-regions";
import type { Locale } from "@/lib/i18n/locale";

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[];
  emoji: string;
  cuts: Record<AgeBand, string>;
  warning?: string;
  /** Regiões onde este alimento é tradicional (ausente ou vazio = nacional). */
  regiao?: (Region | LatamRegion)[];
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

/**
 * Versão em espanhol latino-americano do guia de cortes seguros. Estrutura
 * idêntica ao array FOODS (mesmos ids, mesmo shape) — nomes, cortes, avisos
 * e aliases traduzidos/adaptados para o espanhol falado na América Latina
 * (ex.: "papa" e não "patata", "maní" e não "cacahuete" como termo
 * principal, "banana" e não "plátano"). O campo `regiao` (regiões
 * brasileiras) não faz sentido aqui e foi omitido.
 */
export const FOODS_ES: FoodItem[] = [
  {
    id: "banana",
    name: "Banana",
    aliases: ["guineo"],
    emoji: "🍌",
    cuts: {
      "6-7": "Bien madura, triturada, o en bastón grueso del tamaño de la mano (BLW).",
      "8-9": "En trozos pequeños y blandos, o parcialmente triturada.",
      "10-12": "Cortada en rodajas o cubos pequeños.",
      "13-24": "Cortada en trozos pequeños, como el resto de la familia.",
    },
    adequado_lancheira: true,
  },
  {
    id: "maca",
    name: "Manzana",
    aliases: [],
    emoji: "🍎",
    cuts: {
      "6-7": "Cocida al vapor hasta quedar bien blanda y triturada. Nunca cruda y entera.",
      "8-9": "Cocida y en trozos pequeños y blandos.",
      "10-12": "Rallada o cocida en trozos pequeños.",
      "13-24": "Cruda, rallada o en rodajas bien finas. Evita trozos grandes y duros.",
    },
    warning: "La manzana cruda en trozos grandes es riesgo de atragantamiento a cualquier edad en esta etapa — rállala o cocínala.",
    adequado_lancheira: true,
  },
  {
    id: "pera",
    name: "Pera",
    aliases: [],
    emoji: "🍐",
    cuts: {
      "6-7": "Cocida al vapor y triturada, o en bastones blandos cocidos.",
      "8-9": "Cocida, en trozos pequeños y blandos.",
      "10-12": "Madura, en trozos pequeños, cruda o cocida.",
      "13-24": "Madura, en trozos pequeños.",
    },
    adequado_lancheira: true,
  },
  {
    id: "mamao",
    name: "Papaya",
    aliases: ["lechosa", "fruta bomba"],
    emoji: "🧡",
    cuts: {
      "6-7": "Bien madura, triturada o en bastones grandes y blandos.",
      "8-9": "En trozos pequeños y blandos.",
      "10-12": "En cubos pequeños.",
      "13-24": "En cubos pequeños.",
    },
    adequado_lancheira: true,
  },
  {
    id: "manga",
    name: "Mango",
    aliases: [],
    emoji: "🥭",
    cuts: {
      "6-7": "Bien maduro, triturado o en bastones blandos.",
      "8-9": "En trozos pequeños y blandos.",
      "10-12": "En cubos pequeños.",
      "13-24": "En cubos pequeños.",
    },
    adequado_lancheira: true,
  },
  {
    id: "uva",
    name: "Uva",
    aliases: [],
    emoji: "🍇",
    cuts: {
      "6-7": "No se recomienda entera. Si se ofrece, cocida y bien triturada.",
      "8-9": "Cortada en cuartos, sin cáscara ni semillas. Nunca entera.",
      "10-12": "Cortada en cuartos, sin cáscara ni semillas. Nunca entera.",
      "13-24": "Cortada al menos por la mitad (idealmente en cuartos), sin cáscara. Nunca entera.",
    },
    warning: "La uva entera es una de las principales causas de atragantamiento grave en niños pequeños — córtala siempre, a cualquier edad.",
    adequado_lancheira: true,
  },
  {
    id: "morango",
    name: "Fresa",
    aliases: ["frutilla"],
    emoji: "🍓",
    cuts: {
      "6-7": "Triturada o en rodajas gruesas y blandas.",
      "8-9": "Cortada en trozos pequeños.",
      "10-12": "Cortada en trozos pequeños o rodajas.",
      "13-24": "Cortada por la mitad o en rodajas.",
    },
    adequado_lancheira: true,
  },
  {
    id: "tomate",
    name: "Tomate",
    aliases: ["tomate-cherry"],
    emoji: "🍅",
    cuts: {
      "6-7": "Sin piel ni semillas, cocido y triturado.",
      "8-9": "Sin piel, en trozos pequeños y blandos.",
      "10-12": "En trozos pequeños, sin piel si es posible.",
      "13-24": "En trozos. Si es tomate cherry, córtalo siempre por la mitad o en cuartos.",
    },
    warning: "El tomate cherry o la uva enteros son riesgo de atragantamiento — córtalos siempre en cuartos.",
    adequado_lancheira: true,
  },
  {
    id: "cenoura",
    name: "Zanahoria",
    aliases: [],
    emoji: "🥕",
    cuts: {
      "6-7": "Cocida hasta quedar bien blanda, triturada o en bastón blando.",
      "8-9": "Cocida, en trozos pequeños y blandos.",
      "10-12": "Cocida, en rodajas o trozos pequeños.",
      "13-24": "Cocida, en trozos. Evita cruda y crocante en esta etapa.",
    },
    warning: "La zanahoria cruda y dura es riesgo de atragantamiento — cocínala siempre hasta que quede blanda.",
    adequado_lancheira: true,
  },
  {
    id: "batata-doce",
    name: "Camote",
    aliases: ["boniato", "batata", "papa dulce"],
    emoji: "🍠",
    cuts: {
      "6-7": "Cocido y triturado, o en bastón blando.",
      "8-9": "Cocido, en trozos pequeños y blandos.",
      "10-12": "Cocido, en cubos pequeños.",
      "13-24": "Cocido, en trozos o cubos.",
    },
    adequado_lancheira: true,
  },
  {
    id: "batata",
    name: "Papa",
    aliases: ["patata"],
    emoji: "🥔",
    cuts: {
      "6-7": "Cocida y triturada, o en bastón blando.",
      "8-9": "Cocida, en trozos pequeños y blandos.",
      "10-12": "Cocida, en cubos pequeños.",
      "13-24": "Cocida, en trozos o cubos.",
    },
    adequado_lancheira: true,
  },
  {
    id: "abobrinha",
    name: "Calabacín",
    aliases: ["zapallito", "calabacita", "zucchini"],
    emoji: "🥒",
    cuts: {
      "6-7": "Cocido y triturado, o en bastón bien blando.",
      "8-9": "Cocido, en trozos pequeños y blandos.",
      "10-12": "Cocido, en trozos pequeños.",
      "13-24": "Cocido, en trozos.",
    },
    adequado_lancheira: true,
  },
  {
    id: "brocolis",
    name: "Brócoli",
    aliases: [],
    emoji: "🥦",
    cuts: {
      "6-7": "Cocido hasta quedar bien blando, en ramitos grandes (BLW) o triturado.",
      "8-9": "Cocido, en ramitos pequeños y blandos.",
      "10-12": "Cocido, en trozos pequeños.",
      "13-24": "Cocido, en trozos pequeños.",
    },
    adequado_lancheira: true,
  },
  {
    id: "frango",
    name: "Pollo",
    aliases: ["pechuga de pollo"],
    emoji: "🍗",
    cuts: {
      "6-7": "Bien cocido y deshilachado bien fino, triturado en el puré.",
      "8-9": "Deshilachado en hebras un poco más gruesas.",
      "10-12": "Picado en trozos pequeños y blandos.",
      "13-24": "En trozos pequeños, siempre bien cocido.",
    },
    warning: "Verifica siempre que no haya huesos ni cartílagos antes de servir.",
    adequado_lancheira: true,
  },
  {
    id: "carne-moida",
    name: "Carne molida",
    aliases: ["carne picada"],
    emoji: "🍖",
    cuts: {
      "6-7": "Bien cocida y triturada junto con el puré.",
      "8-9": "Bien cocida, en trocitos sueltos.",
      "10-12": "Bien cocida, en trozos pequeños.",
      "13-24": "Bien cocida, en trozos.",
    },
  },
  {
    id: "peixe",
    name: "Pescado",
    aliases: [],
    emoji: "🐟",
    cuts: {
      "6-7": "Cocido y deshilachado bien fino, sin espinas.",
      "8-9": "Deshilachado, sin espinas, en trozos blandos.",
      "10-12": "En trozos pequeños, sin espinas.",
      "13-24": "En trozos, sin espinas.",
    },
    warning: "Revisa con cuidado que no quede ninguna espina antes de servir, a cualquier edad.",
    alergenico_declarado: ["pescado"],
  },
  {
    id: "ovo",
    name: "Huevo",
    aliases: [],
    emoji: "🥚",
    cuts: {
      "6-7": "Bien cocido (yema y clara firmes), triturado o en tiras de tortilla de huevo.",
      "8-9": "Bien cocido, en trozos pequeños.",
      "10-12": "Bien cocido, en trozos.",
      "13-24": "Bien cocido, en trozos.",
    },
    warning: "Sírvelo siempre totalmente cocido, nunca crudo o blando, para evitar riesgo de contaminación.",
    adequado_lancheira: true,
    alergenico_declarado: ["huevo"],
  },
  {
    id: "queijo",
    name: "Queso",
    aliases: ["queso fresco"],
    emoji: "🧀",
    cuts: {
      "6-7": "Queso blanco blando (tipo queso fresco), en pequeña cantidad.",
      "8-9": "Queso blanco blando, en trozos pequeños.",
      "10-12": "En cubos pequeños y blandos.",
      "13-24": "En cubos o rodajas finas.",
    },
    warning: "Evita quesos duros o en cubos grandes, que pueden ser riesgo de atragantamiento.",
    adequado_lancheira: true,
    alergenico_declarado: ["leche"],
  },
  {
    id: "pao",
    name: "Pan",
    aliases: [],
    emoji: "🍞",
    cuts: {
      "6-7": "Pan blando sin corteza dura, en tiras largas (BLW).",
      "8-9": "Pan blando, en trozos pequeños.",
      "10-12": "En trozos pequeños.",
      "13-24": "En trozos.",
    },
    adequado_lancheira: true,
    alergenico_declarado: ["gluten"],
  },
  {
    id: "amendoim",
    name: "Maní",
    aliases: ["cacahuate", "cacahuete", "mantequilla de maní"],
    emoji: "🥜",
    cuts: {
      "6-7": "Nunca entero. Solo mantequilla de maní lisa, bien diluida en agua o fruta.",
      "8-9": "Solo mantequilla de maní lisa, en pequeña cantidad, observando reacción.",
      "10-12": "Mantequilla de maní lisa untada en capa fina. Nunca en granos enteros.",
      "13-24": "Mantequilla de maní lisa. El maní entero solo es seguro después de los 4-5 años.",
    },
    warning: "El maní entero o picado grueso es un riesgo grave de atragantamiento hasta los 4-5 años, además de ser un alérgeno común: introdúcelo con cuidado y observa reacciones durante algunos días.",
  },
  {
    id: "pipoca",
    name: "Palomitas de maíz",
    aliases: ["pochoclo", "cabritas", "canchita"],
    emoji: "🍿",
    cuts: {
      "6-7": "No se recomienda en esta etapa.",
      "8-9": "No se recomienda en esta etapa.",
      "10-12": "No se recomienda en esta etapa.",
      "13-24": "Evítalas hasta los 4 años.",
    },
    warning: "Las palomitas de maíz son uno de los mayores riesgos de atragantamiento en niños pequeños — evítalas hasta al menos los 4 años.",
  },
  {
    id: "salsicha",
    name: "Salchicha",
    aliases: ["longaniza"],
    emoji: "🌭",
    cuts: {
      "6-7": "No se recomienda en esta etapa (ultraprocesado, alto en sodio).",
      "8-9": "Evítala; prefiere proteínas frescas.",
      "10-12": "Si se ofrece ocasionalmente, córtala a lo largo, nunca en rodajas.",
      "13-24": "Ocasionalmente, córtala a lo largo, nunca en rodajas.",
    },
    warning: "La salchicha en rodajas es un riesgo clásico de atragantamiento — si la ofreces, córtala siempre a lo largo y en tiras finas.",
  },
  {
    id: "mel",
    name: "Miel",
    aliases: [],
    emoji: "🍯",
    cuts: {
      "6-7": "No la ofrezcas.",
      "8-9": "No la ofrezcas.",
      "10-12": "No la ofrezcas.",
      "13-24": "Solo después de cumplir 1 año.",
    },
    warning: "La miel no debe ofrecerse antes del año de edad: riesgo de botulismo infantil.",
  },
  {
    id: "arroz",
    name: "Arroz",
    aliases: [],
    emoji: "🍚",
    cuts: {
      "6-7": "Bien cocido y triturado, con bastante agua.",
      "8-9": "Bien cocido, suelto.",
      "10-12": "Cocido, suelto.",
      "13-24": "Cocido, como el resto de la familia.",
    },
  },
  {
    id: "feijao",
    name: "Frijoles",
    aliases: ["porotos", "judías", "habichuelas"],
    emoji: "🫘",
    cuts: {
      "6-7": "Bien cocidos, triturados, sin cáscara si es posible.",
      "8-9": "Bien cocidos, levemente triturados.",
      "10-12": "Bien cocidos, enteros (granos blandos).",
      "13-24": "Bien cocidos, como el resto de la familia.",
    },
  },
  // ─── Alimentos regionales (mantidos com ids e status de revisão originais) ───

  {
    id: "acai",
    name: "Açaí",
    aliases: ["asai"],
    emoji: "🟣",
    cuts: {
      "6-7": "No se recomienda por debajo de los 12 meses.",
      "8-9": "No se recomienda por debajo de los 12 meses.",
      "10-12": "No se recomienda por debajo de los 12 meses.",
      "13-24": "Puro, sin azúcar, bien batido y liso. Se puede mezclar con banana triturada.",
    },
    warning: "El açaí puede causar reacción alérgica en algunos bebés. Introdúcelo en poca cantidad y observa por 3 días. NUNCA lo ofrezcas con azúcar, jarabe de guaraná o leche condensada.",
    revisao: "pendente",
    prioridadeRevisao: "alta",
    minAgeMonths: 12,
  },
  {
    id: "tucuma",
    name: "Tucumá",
    aliases: [],
    emoji: "🟠",
    cuts: {
      "6-7": "No se recomienda por debajo de los 12 meses — textura muy fibrosa.",
      "8-9": "No se recomienda por debajo de los 12 meses — textura muy fibrosa.",
      "10-12": "No se recomienda por debajo de los 12 meses — textura muy fibrosa.",
      "13-24": "Pulpa retirada de la semilla, bien triturada o batida en puré. Nunca ofrecerlo con la semilla.",
    },
    warning: "El tucumá tiene una textura muy fibrosa y una semilla dura. Retira toda la pulpa de la semilla y tritúrala bien antes de ofrecerla.",
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 12,
  },
  {
    id: "cupuacu",
    name: "Copoazú",
    aliases: ["cupuaçu"],
    emoji: "🤎",
    cuts: {
      "6-7": "Pulpa pura bien batida y colada, sin semillas. Sabor ácido — mezclar con banana para suavizar.",
      "8-9": "Pulpa batida, puede ser más espesa. Mezclar con frutas dulces.",
      "10-12": "Pulpa en trocitos blandos o batida.",
      "13-24": "Pulpa en trozos pequeños o mezclada en preparaciones.",
    },
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 8,
  },
  {
    id: "tambaqui",
    name: "Tambaquí",
    aliases: ["pez de río"],
    emoji: "🐟",
    cuts: {
      "6-7": "Cocido, deshilachado en hebras bien finas, revisando manualmente cada porción para retirar espinas.",
      "8-9": "Cocido y deshilachado, en trocitos blandos. Revisar espinas antes de servir.",
      "10-12": "Cocido, en láminas pequeñas. Revisar siempre las espinas.",
      "13-24": "Cocido o asado, en trozos pequeños. Seguir revisando espinas.",
    },
    warning: "El pescado de río tiene muchas espinas finas. SIEMPRE revisa manualmente cada porción antes de ofrecérsela al bebé — pasa los dedos por el pescado deshilachado para sentir espinas escondidas.",
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },
  {
    id: "pirarucu",
    name: "Pirarucú",
    aliases: ["paiche", "bacalao del amazonas"],
    emoji: "🐟",
    cuts: {
      "6-7": "Cocido y deshilachado bien fino, revisando espinas manualmente antes de servir.",
      "8-9": "Cocido y deshilachado, en trocitos blandos. Revisar espinas.",
      "10-12": "Cocido, en láminas pequeñas. Revisar siempre las espinas.",
      "13-24": "Cocido o asado, en trozos pequeños. Seguir revisando espinas.",
    },
    warning: "Pescado de río — SIEMPRE revisa manualmente cada porción por espinas antes de servir.",
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },
  {
    id: "tucunare",
    name: "Tucunaré",
    aliases: ["pavón"],
    emoji: "🐟",
    cuts: {
      "6-7": "Cocido y deshilachado bien fino, revisando espinas manualmente.",
      "8-9": "Cocido y deshilachado en trocitos. Revisar espinas.",
      "10-12": "Cocido, en láminas pequeñas. Revisar espinas.",
      "13-24": "Cocido o a la parrilla, en trozos pequeños. Revisar espinas.",
    },
    warning: "Pescado de río — SIEMPRE revisa manualmente cada porción por espinas antes de servir.",
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },
  {
    id: "umbu",
    name: "Umbú",
    aliases: ["imbu"],
    emoji: "🟢",
    cuts: {
      "6-7": "No se recomienda por debajo de los 8 meses — sabor ácido y textura irregular.",
      "8-9": "Maduro, pulpa triturada. Elegir bien maduro para reducir la acidez.",
      "10-12": "Pulpa triturada o en trocitos blandos, bien maduro.",
      "13-24": "Pulpa en trozos pequeños. Retirar semilla y cáscara.",
    },
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 8,
  },
  {
    id: "caju-fruta",
    name: "Marañón (fruta)",
    aliases: ["caju", "pseudofruto del marañón"],
    emoji: "🟡",
    cuts: {
      "6-7": "No se recomienda por debajo de los 8 meses — las fibras largas pueden ser difíciles.",
      "8-9": "Maduro, jugo exprimido al momento (sin azúcar añadida). Colar bien para quitar las fibras.",
      "10-12": "Jugo colado o pulpa cocida y triturada.",
      "13-24": "Pulpa madura en trocitos o jugo natural.",
    },
    warning: "Solo la FRUTA (el pedúnculo). El anacardo (la nuez) es un alérgeno de declaración obligatoria — no confundir.",
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 8,
  },
  {
    id: "feijao-de-corda",
    name: "Frijol caupí",
    aliases: ["frijol de vaca", "poroto chino"],
    emoji: "🫘",
    cuts: {
      "6-7": "Cocido hasta quedar bien blando, triturado con tenedor hasta hacer puré. Usar el caldo espeso.",
      "8-9": "Cocido y levemente triturado, con caldo.",
      "10-12": "Cocido, granos enteros bien blandos.",
      "13-24": "Cocido normalmente, como el frijol de la familia.",
    },
    revisao: "pendente",
    prioridadeRevisao: "normal",
  },
  {
    id: "pequi",
    name: "Pequi",
    aliases: [],
    emoji: "💛",
    cuts: {
      "6-7": "NO ofrecer — riesgo de seguridad alto, la semilla tiene espinas internas.",
      "8-9": "NO ofrecer — riesgo de seguridad alto, la semilla tiene espinas internas.",
      "10-12": "NO ofrecer — riesgo de seguridad alto, la semilla tiene espinas internas.",
      "13-24": "SOLO la pulpa raspada con cuchara alrededor de la semilla. NUNCA morder, roer o romper la semilla — tiene espinas internas que perforan la boca y la garganta.",
    },
    warning: "⚠️ RIESGO ALTO DE SEGURIDAD: la semilla del pequi contiene miles de espinas finísimas por dentro. NUNCA morder, roer o romper la semilla. La pulpa debe raspar-se con cuidado con una cuchara, sin tocar las espinas. Ofrécelo solo a niños mayores de 13 meses, con supervisión constante y preparación exclusiva de un adulto.",
    revisao: "pendente",
    prioridadeRevisao: "alta",
    minAgeMonths: 13,
  },
  {
    id: "guariroba",
    name: "Guariroba",
    aliases: ["palmito amargo"],
    emoji: "🌴",
    cuts: {
      "6-7": "No se recomienda por debajo de los 10 meses — sabor amargo y textura firme.",
      "8-9": "No se recomienda por debajo de los 10 meses — sabor amargo y textura firme.",
      "10-12": "Cocida por bastante tiempo hasta quedar bien blanda, picada bien fina. El amargor es natural.",
      "13-24": "Cocida y picada en trozos pequeños. Se puede saltear con condimentos suaves.",
    },
    revisao: "pendente",
    prioridadeRevisao: "normal",
    minAgeMonths: 10,
  },
  {
    id: "pinhao",
    name: "Piñón",
    aliases: [],
    emoji: "🌰",
    cuts: {
      "6-7": "No se recomienda por debajo de los 10 meses — riesgo de atragantamiento por la textura firme.",
      "8-9": "No se recomienda por debajo de los 10 meses — riesgo de atragantamiento por la textura firme.",
      "10-12": "Bien cocido (olla a presión por 40 min), triturado con tenedor o picado bien fino.",
      "13-24": "Bien cocido, picado en trozos pequeños. Nunca ofrecerlo crudo o mal cocido.",
    },
    warning: "El piñón mal cocido o en trozos grandes es riesgo de atragantamiento. Cocínalo siempre muy bien (olla a presión por 40 minutos) y pícalo en trozos bien pequeños.",
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

/** Retorna o array de alimentos correspondente ao locale (padrão "es", já que o app agora é hispanofalante por padrão). */
export function getFoods(locale: Locale = "es"): FoodItem[] {
  return locale === "pt-BR" ? FOODS : FOODS_ES;
}

export function searchFoods(
  query: string,
  userRegion?: Region | LatamRegion | null,
  locale: Locale = "es",
): FoodItem[] {
  const q = normalize(query);
  if (!q) return [];

  const matches = getFoods(locale).filter((food) => {
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
