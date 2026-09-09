import type { Locale } from "@/lib/i18n/locale";

export type UtensilCategory = "hora-de-comer" | "preparo" | "armazenamento" | "seguranca";

export const UTENSIL_CATEGORY_LABEL: Record<UtensilCategory, string> = {
  "hora-de-comer": "Na hora de comer",
  preparo: "Preparo",
  armazenamento: "Armazenamento",
  seguranca: "Segurança",
};

export const UTENSIL_CATEGORY_LABEL_ES: Record<UtensilCategory, string> = {
  "hora-de-comer": "A la hora de comer",
  preparo: "Preparación",
  armazenamento: "Almacenamiento",
  seguranca: "Seguridad",
};

export function getUtensilCategoryLabel(locale: Locale = "pt-BR"): Record<UtensilCategory, string> {
  return locale === "es" ? UTENSIL_CATEGORY_LABEL_ES : UTENSIL_CATEGORY_LABEL;
}

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
    imageUrl: "/images/illustrations/utensil-cadeirao.webp",
    category: "hora-de-comer",
    why: "Mantém o bebê sentado ereto e com apoio de 90 graus — postura essencial para a segurança contra engasgo.",
    whatToLookFor: "Cinto de 5 pontos, apoio de pés ajustável (ajuda na estabilidade para mastigar) e bandeja removível para facilitar a limpeza.",
    essential: true,
  },
  {
    id: "babador-silicone",
    name: "Babador de silicone com bolso",
    emoji: "🧑‍🍼",
    imageUrl: "/images/illustrations/utensil-babador-silicone.webp",
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
    imageUrl: "/images/illustrations/utensil-talheres-treino.webp",
    category: "hora-de-comer",
    why: "Cabo curto e grosso, fácil para a mãozinha pequena segurar — ajuda a desenvolver a pinça e a autonomia.",
    whatToLookFor: "Ponta arredondada (sem risco de machucar a boca), material atóxico e livre de BPA.",
    essential: true,
  },
  {
    id: "copo-transicao",
    name: "Copo de transição (350°/treino)",
    emoji: "🥤",
    imageUrl: "/images/illustrations/utensil-copo-transicao.webp",
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
    imageUrl: "/images/illustrations/utensil-forminhas-gelo.webp",
    category: "preparo",
    why: "Cada cubo é uma porção individual pronta para congelar — praticidade para o dia a dia.",
    whatToLookFor: "Silicone flexível (facilita desenformar), com tampa para evitar contaminação no congelador.",
    essential: true,
  },
  {
    id: "potes-vidro-pequenos",
    name: "Potes pequenos de vidro com tampa",
    emoji: "🫙",
    imageUrl: "/images/illustrations/utensil-potes-vidro-pequenos.webp",
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

export const UTENSILS_ES: Utensil[] = [
  {
    id: "cadeirao",
    name: "Silla de comer",
    emoji: "🪑",
    imageUrl: "/images/illustrations/utensil-cadeirao.webp",
    category: "hora-de-comer",
    why: "Mantiene al bebé sentado erguido y con apoyo de 90 grados — postura esencial para la seguridad contra atragantamiento.",
    whatToLookFor: "Cinturón de 5 puntos, apoyapiés ajustable (ayuda a la estabilidad para masticar) y bandeja removible para facilitar la limpieza.",
    essential: true,
  },
  {
    id: "babador-silicone",
    name: "Babero de silicona con bolsillo",
    emoji: "🧑‍🍼",
    imageUrl: "/images/illustrations/utensil-babador-silicone.webp",
    category: "hora-de-comer",
    why: "Atrapa la comida que cae, reduce el desperdicio y facilita mucho la limpieza después de la comida.",
    whatToLookFor: "Silicona suave (no irrita el cuello), cierre ajustable y fácil de lavar en el fregadero.",
    essential: true,
  },
  {
    id: "prato-ventosa",
    name: "Plato con ventosa",
    emoji: "🍽️",
    category: "hora-de-comer",
    why: "Se adhiere a la bandeja y evita que el bebé tire todo el plato al piso — algo común en la etapa de autonomía.",
    whatToLookFor: "Ventosa que realmente se sujeta a superficies lisas, divisiones para separar los alimentos.",
    essential: false,
  },
  {
    id: "talheres-treino",
    name: "Cubiertos de entrenamiento",
    emoji: "🥄",
    imageUrl: "/images/illustrations/utensil-talheres-treino.webp",
    category: "hora-de-comer",
    why: "Mango corto y grueso, fácil de sostener para la manito pequeña — ayuda a desarrollar la pinza y la autonomía.",
    whatToLookFor: "Punta redondeada (sin riesgo de lastimar la boca), material atóxico y libre de BPA.",
    essential: true,
  },
  {
    id: "copo-transicao",
    name: "Vaso de transición (entrenamiento)",
    emoji: "🥤",
    imageUrl: "/images/illustrations/utensil-copo-transicao.webp",
    category: "hora-de-comer",
    why: "Ayuda al bebé a pasar del biberón/pecho al vaso poco a poco, sin depender de la boquilla.",
    whatToLookFor: "Boquilla de silicona suave al inicio, luego un borde libre de boquilla para entrenar a sorber.",
    essential: true,
  },
  {
    id: "toalha-plastica-chao",
    name: "Mantel plástico para debajo de la silla",
    emoji: "🧽",
    category: "hora-de-comer",
    why: "Protege el piso del desorden inevitable del BLW y la autonomía — facilita mucho la rutina de limpieza.",
    whatToLookFor: "Material lavable, tamaño suficiente para cubrir bien alrededor de la silla.",
    essential: false,
  },
  {
    id: "processador-mixer",
    name: "Mini procesadora o licuadora",
    emoji: "🌀",
    category: "preparo",
    why: "Agiliza la preparación de purés en la etapa inicial, sobre todo si vas a congelar porciones.",
    whatToLookFor: "Potencia suficiente para verduras cocidas, fácil de lavar y, si es posible, compacta.",
    essential: false,
  },
  {
    id: "peneira-passador",
    name: "Colador o pasapurés",
    emoji: "🥣",
    category: "preparo",
    why: "Deja los purés bien lisos en las primeras semanas, sin trozos que puedan incomodar al bebé.",
    whatToLookFor: "Malla fina, mango cómodo para sostener durante el proceso.",
    essential: false,
  },
  {
    id: "forminhas-gelo",
    name: "Moldes de silicona (tipo cubitos de hielo)",
    emoji: "🧊",
    imageUrl: "/images/illustrations/utensil-forminhas-gelo.webp",
    category: "preparo",
    why: "Cada cubo es una porción individual lista para congelar — practicidad para el día a día.",
    whatToLookFor: "Silicona flexible (facilita desmoldar), con tapa para evitar contaminación en el congelador.",
    essential: true,
  },
  {
    id: "potes-vidro-pequenos",
    name: "Frascos pequeños de vidrio con tapa",
    emoji: "🫙",
    imageUrl: "/images/illustrations/utensil-potes-vidro-pequenos.webp",
    category: "armazenamento",
    why: "Ideales para guardar porciones listas en el refrigerador o congelador, sin retener olores ni mancharse como el plástico.",
    whatToLookFor: "Vidrio templado apto para congelar (no se agrieta con el cambio de temperatura), tapa bien sellada.",
    essential: true,
  },
  {
    id: "etiquetas-data",
    name: "Etiquetas o cinta para marcar la fecha",
    emoji: "🏷️",
    category: "armazenamento",
    why: "Ayuda a controlar la vigencia de cada porción congelada y evitar desperdicio por olvido.",
    whatToLookFor: "Cinta apta para congelador (no se despega con el frío/humedad), marcador permanente.",
    essential: false,
  },
  {
    id: "organizador-congelador",
    name: "Organizador para el congelador",
    emoji: "📦",
    category: "armazenamento",
    why: "Mantiene las porciones organizadas por fecha y tipo de alimento, facilitando armar el menú de la semana.",
    whatToLookFor: "Tamaño compatible con tu congelador, divisiones ajustables.",
    essential: false,
  },
  {
    id: "termometro-alimentos",
    name: "Termómetro de cocina",
    emoji: "🌡️",
    category: "seguranca",
    why: "Garantiza que carnes, pollo y pescado alcanzaron la temperatura segura de cocción, reduciendo el riesgo de contaminación.",
    whatToLookFor: "Lectura rápida, fácil de higienizar entre usos.",
    essential: false,
  },
  {
    id: "tesoura-cortador",
    name: "Tijera o cortador de alimentos para bebé",
    emoji: "✂️",
    category: "seguranca",
    why: "Facilita cortar rápidamente en restaurantes o paseos, en el formato y tamaño seguro para la edad.",
    whatToLookFor: "Hoja de acero inoxidable, tapa protectora para llevar en el bolso.",
    essential: false,
  },
  {
    id: "kit-primeiros-socorros",
    name: "Kit básico de primeros auxilios",
    emoji: "🩹",
    category: "seguranca",
    why: "Tenerlo a mano facilita actuar rápido ante pequeños incidentes durante las comidas, además de dar tranquilidad a la rutina.",
    whatToLookFor: "Contenido básico (gasas, suero fisiológico, termómetro) guardado en un lugar de fácil acceso en la cocina.",
    essential: false,
  },
];

export function getUtensils(locale: Locale = "pt-BR"): Utensil[] {
  return locale === "es" ? UTENSILS_ES : UTENSILS;
}

export function essentialUtensils(locale: Locale = "pt-BR"): Utensil[] {
  return getUtensils(locale).filter((u) => u.essential);
}
