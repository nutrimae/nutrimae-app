export type UtensilCategory = "hora-de-comer" | "preparo" | "armazenamento" | "seguranca";

export const UTENSIL_CATEGORY_LABEL: Record<UtensilCategory, string> = {
  "hora-de-comer": "Na hora de comer",
  preparo: "Preparo",
  armazenamento: "Armazenamento",
  seguranca: "Segurança",
};

export interface Utensil {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  category: UtensilCategory;
  why: string;
  whatToLookFor: string;
  essential: boolean;
}

export const UTENSILS: Utensil[] = [
  {
    id: "cadeirao",
    name: "Cadeirão de alimentação",
    emoji: "🪑",
    imageUrl: "/images/illustrations/utensil-cadeirao.png",
    category: "hora-de-comer",
    why: "Mantém o bebê sentado ereto e com apoio de 90 graus — postura essencial para a segurança contra engasgo.",
    whatToLookFor: "Cinto de 5 pontos, apoio de pés ajustável (ajuda na estabilidade para mastigar) e bandeja removível para facilitar a limpeza.",
    essential: true,
  },
  {
    id: "babador-silicone",
    name: "Babador de silicone com bolso",
    emoji: "🧑‍🍼",
    imageUrl: "/images/illustrations/utensil-babador-silicone.png",
    category: "hora-de-comer",
    why: "Captura a comida que cai, reduz desperdício e facilita muito a limpeza depois da refeição.",
    whatToLookFor: "Silicone macio (não irrita o pescoço), fecho ajustável e fácil de lavar na pia.",
    essential: true,
  },
  {
    id: "prato-ventosa",
    name: "Prato com ventosa",
    emoji: "🍽️",
    category: "hora-de-comer",
    why: "Gruda na bandeja e evita que o bebê derrube o prato inteiro no chão — comum na fase de autonomia.",
    whatToLookFor: "Ventosa que realmente prende em superfícies lisas, divisórias para separar os alimentos.",
    essential: false,
  },
  {
    id: "talheres-treino",
    name: "Talheres de treino",
    emoji: "🥄",
    imageUrl: "/images/illustrations/utensil-talheres-treino.png",
    category: "hora-de-comer",
    why: "Cabo curto e grosso, fácil para a mãozinha pequena segurar — ajuda a desenvolver a pinça e a autonomia.",
    whatToLookFor: "Ponta arredondada (sem risco de machucar a boca), material atóxico e livre de BPA.",
    essential: true,
  },
  {
    id: "copo-transicao",
    name: "Copo de transição (350°/treino)",
    emoji: "🥤",
    imageUrl: "/images/illustrations/utensil-copo-transicao.png",
    category: "hora-de-comer",
    why: "Ajuda o bebê a sair da mamadeira/peito para o copo aos poucos, sem depender de bico.",
    whatToLookFor: "Bico de silicone macio no início, depois borda livre de bico para treinar sorver.",
    essential: true,
  },
  {
    id: "toalha-plastica-chao",
    name: "Toalha plástica para debaixo da cadeira",
    emoji: "🧽",
    category: "hora-de-comer",
    why: "Protege o chão da bagunça inevitável do BLW e da autonomia — facilita muito a rotina de limpeza.",
    whatToLookFor: "Material lavável, tamanho suficiente para cobrir bem em volta do cadeirão.",
    essential: false,
  },
  {
    id: "processador-mixer",
    name: "Mixer ou processador de alimentos",
    emoji: "🌀",
    category: "preparo",
    why: "Agiliza o preparo de purês na fase inicial, principalmente se você for congelar porções.",
    whatToLookFor: "Potência suficiente para legumes cozidos, fácil de lavar e, se possível, compacto.",
    essential: false,
  },
  {
    id: "peneira-passador",
    name: "Peneira ou passador de alimentos",
    emoji: "🥣",
    category: "preparo",
    why: "Deixa purês bem lisos nas primeiras semanas, sem pedaços que possam incomodar o bebê.",
    whatToLookFor: "Malha fina, cabo confortável para segurar durante o processo.",
    essential: false,
  },
  {
    id: "forminhas-gelo",
    name: "Forminhas de silicone (tipo gelo)",
    emoji: "🧊",
    imageUrl: "/images/illustrations/utensil-forminhas-gelo.png",
    category: "preparo",
    why: "Cada cubo é uma porção individual pronta para congelar — praticidade para o dia a dia.",
    whatToLookFor: "Silicone flexível (facilita desenformar), com tampa para evitar contaminação no congelador.",
    essential: true,
  },
  {
    id: "potes-vidro-pequenos",
    name: "Potes pequenos de vidro com tampa",
    emoji: "🫙",
    imageUrl: "/images/illustrations/utensil-potes-vidro-pequenos.png",
    category: "armazenamento",
    why: "Ideais para guardar porções prontas na geladeira ou congelador, sem reter cheiro ou manchar como o plástico.",
    whatToLookFor: "Vidro temperado próprio para congelamento (não trinca com a variação de temperatura), tampa bem vedada.",
    essential: true,
  },
  {
    id: "etiquetas-data",
    name: "Etiquetas ou fita para marcar data",
    emoji: "🏷️",
    category: "armazenamento",
    why: "Ajuda a controlar a validade de cada porção congelada e evitar desperdício por esquecimento.",
    whatToLookFor: "Fita própria para congelador (não descola com o frio/umidade), caneta permanente.",
    essential: false,
  },
  {
    id: "organizador-congelador",
    name: "Organizador para congelador",
    emoji: "📦",
    category: "armazenamento",
    why: "Mantém as porções organizadas por data e tipo de alimento, facilitando a rotina de montar o cardápio da semana.",
    whatToLookFor: "Tamanho compatível com o seu freezer, divisórias ajustáveis.",
    essential: false,
  },
  {
    id: "termometro-alimentos",
    name: "Termômetro de alimentos",
    emoji: "🌡️",
    category: "seguranca",
    why: "Garante que carnes, frango e peixe atingiram temperatura segura de cozimento, reduzindo risco de contaminação.",
    whatToLookFor: "Leitura rápida, fácil de higienizar entre usos.",
    essential: false,
  },
  {
    id: "tesoura-cortador",
    name: "Tesoura ou cortador de alimentos para bebê",
    emoji: "✂️",
    category: "seguranca",
    why: "Facilita cortar rapidamente em restaurantes ou passeios, no formato e tamanho seguro para a idade.",
    whatToLookFor: "Lâmina de aço inoxidável, tampa protetora para levar na bolsa.",
    essential: false,
  },
  {
    id: "kit-primeiros-socorros",
    name: "Kit básico de primeiros socorros",
    emoji: "🩹",
    category: "seguranca",
    why: "Ter à mão facilita agir rápido em pequenos incidentes durante as refeições, além de tranquilizar a rotina.",
    whatToLookFor: "Conteúdo básico (gaze, soro fisiológico, termômetro) guardado em local de fácil acesso na cozinha.",
    essential: false,
  },
];

export function essentialUtensils(): Utensil[] {
  return UTENSILS.filter((u) => u.essential);
}
