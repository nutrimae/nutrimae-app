import { FOODS } from "@/lib/foods";
import { RECIPES } from "@/lib/recipes";
import type { IngredientCategory } from "@/lib/menu";
import type { DayKey } from "@/lib/menu";

export type LunchboxGroup = "proteina" | "carboidrato" | "fruta" | "vegetal" | "laticinio_extra";

export interface LunchboxGroupConfig {
  key: LunchboxGroup;
  label: string;
  shortLabel: string;
  emoji: string;
  idealPercent: number;
  color: string;
  textColor: string;
  bgColor: string;
  description: string;
  examples: string[];
}

export const LUNCHBOX_GROUPS: LunchboxGroupConfig[] = [
  {
    key: "carboidrato",
    label: "Carboidratos",
    shortLabel: "Carbo",
    emoji: "🥖",
    idealPercent: 30,
    color: "#FFA500",
    textColor: "#7a4e00",
    bgColor: "#FEF3C7",
    description: "Energia sustentada para brincar e aprender.",
    examples: ["Pão integral", "Milho cozido", "Panqueca de banana", "Batata-doce"],
  },
  {
    key: "proteina",
    label: "Proteínas",
    shortLabel: "Proteína",
    emoji: "🥩",
    idealPercent: 25,
    color: "#FF6B6B",
    textColor: "#7a1f1f",
    bgColor: "#FFE4E6",
    description: "Saciedade e desenvolvimento muscular.",
    examples: ["Ovo cozido", "Frango desfiado", "Homus", "Queijo branco"],
  },
  {
    key: "vegetal",
    label: "Vegetais",
    shortLabel: "Vegetal",
    emoji: "🥦",
    idealPercent: 25,
    color: "#10B981",
    textColor: "#064e3b",
    bgColor: "#D1FAE5",
    description: "Vitaminas, minerais e imunidade.",
    examples: ["Tomatinho em 4", "Palitinhos de pepino", "Cenoura cozida macia"],
  },
  {
    key: "fruta",
    label: "Frutas",
    shortLabel: "Fruta",
    emoji: "🍎",
    idealPercent: 15,
    color: "#8B5CF6",
    textColor: "#3b1f6b",
    bgColor: "#EDE9FE",
    description: "Fibras, hidratação e doçura natural.",
    examples: ["Uva em quartos", "Maçã em tirinhas", "Banana", "Melão"],
  },
  {
    key: "laticinio_extra",
    label: "Laticínios & Extras",
    shortLabel: "Extra",
    emoji: "🥛",
    idealPercent: 5,
    color: "#EC4899",
    textColor: "#831843",
    bgColor: "#FCE7F3",
    description: "Cálcio ou gorduras boas (sementes trituradas).",
    examples: ["Iogurte natural", "Sementes de abóbora trituradas"],
  },
];

export interface LunchboxItem {
  id: string;
  name: string;
  group: LunchboxGroup;
  emoji: string;
  category: IngredientCategory;
  allergens?: string[];
  prepNote?: string;
  sourceId?: string;
  sourceType?: "food" | "recipe" | "staple";
}

export const LUNCHBOX_BANK: LunchboxItem[] = [
  // Frutas
  { id: "lb-banana", name: "Banana fatiada", group: "fruta", emoji: "🍌", category: "feira", prepNote: "Gotas de limão ajudam a não escurecer" },
  { id: "lb-uva", name: "Uvas cortadas em 4", group: "fruta", emoji: "🍇", category: "feira", prepNote: "Corte sempre em quartos no sentido longitudinal" },
  { id: "lb-maca", name: "Maçã em lâminas finas", group: "fruta", emoji: "🍎", category: "feira", prepNote: "Fatias finas ou regada com água e limão" },
  { id: "lb-mamao", name: "Mamão em cubinhos", group: "fruta", emoji: "🧡", category: "feira", prepNote: "Em pote bem vedado com garfinho de treino" },
  { id: "lb-manga", name: "Manga em cubos", group: "fruta", emoji: "🥭", category: "feira", prepNote: "Manga firme madura, fácil de pegar" },
  { id: "lb-morango", name: "Morangos fatiados", group: "fruta", emoji: "🍓", category: "feira", prepNote: "Lave bem e seque antes de embalar" },
  { id: "lb-melancia", name: "Melancia em cubos sem semente", group: "fruta", emoji: "🍉", category: "feira", prepNote: "Retire todas as sementes" },

  // Vegetais
  { id: "lb-tomatinho", name: "Tomatinho-cereja em 4", group: "vegetal", emoji: "🍅", category: "feira", prepNote: "Nunca mande inteiro; sempre em 4 partes" },
  { id: "lb-cenoura-palito", name: "Palitinhos de cenoura cozida", group: "vegetal", emoji: "🥕", category: "feira", prepNote: "Cozida até ficar macia ao toque" },
  { id: "lb-pepino", name: "Palitinhos de pepino sem casca", group: "vegetal", emoji: "🥒", category: "feira", prepNote: "Retire o miolo com sementes se estiver aquoso" },
  { id: "lb-brocolis", name: "Floretes de brócolis no vapor", group: "vegetal", emoji: "🥦", category: "feira", prepNote: "Cozido no vapor com um fio de azeite" },
  { id: "lb-abobrinha", name: "Abobrinha grelhada em tiras", group: "vegetal", emoji: "🥒", category: "feira", prepNote: "Grelhada sem óleo em excesso" },

  // Carboidratos
  { id: "lb-pao-integral", name: "Tirinhas de pão integral", group: "carboidrato", emoji: "🍞", category: "mercado", allergens: ["gluten"], prepNote: "Pão 100% integral sem casca dura" },
  { id: "lb-milho", name: "Milho verde cozido debulhado", group: "carboidrato", emoji: "🌽", category: "feira", prepNote: "Debulhe com a faca após cozinhar" },
  { id: "lb-panqueca-banana", name: "Panquequinha de banana", group: "carboidrato", emoji: "🥞", category: "mercado", allergens: ["ovo", "gluten"], prepNote: "Feita na frigideira antiaderente sem açúcar" },
  { id: "lb-batata-doce", name: "Cubos de batata-doce assada", group: "carboidrato", emoji: "🍠", category: "feira", prepNote: "Assada com alecrim e azeite" },
  { id: "lb-biscoito-aveia", name: "Biscoitinho caseiro de aveia", group: "carboidrato", emoji: "🍪", category: "mercado", allergens: ["gluten"], prepNote: "Banana + aveia assados por 15 min" },
  { id: "lb-tapioca", name: "Rolinho de tapioca", group: "carboidrato", emoji: "🫓", category: "mercado", prepNote: "Recheada com queijo branco ou homus" },

  // Proteínas
  { id: "lb-ovo-cozido", name: "Ovo de codorna ou ovo cozido", group: "proteina", emoji: "🥚", category: "mercado", allergens: ["ovo"], prepNote: "Gema 100% firme; corte ao meio" },
  { id: "lb-frango-desfiado", name: "Frango desfiado temperadinho", group: "proteina", emoji: "🍗", category: "mercado", prepNote: "Cozido com ervas e desfiado fininho" },
  { id: "lb-queijo-minas", name: "Cubinhos de queijo minas frescal", group: "proteina", emoji: "🧀", category: "mercado", allergens: ["leite"], prepNote: "Mantenha em pote com bolsa térmica" },
  { id: "lb-homus", name: "Pasta de grão-de-bico (homus)", group: "proteina", emoji: "🥣", category: "mercado", prepNote: "Ótimo para passar no pãozinho ou mergulhar cenoura" },
  { id: "lb-omelete-legumes", name: "Tiras de omelete com legumes", group: "proteina", emoji: "🍳", category: "mercado", allergens: ["ovo"], prepNote: "Bem cozido dos dois lados" },

  // Laticínios e Extras
  { id: "lb-iogurte-natural", name: "Iogurte natural integral", group: "laticinio_extra", emoji: "🥛", category: "mercado", allergens: ["leite"], prepNote: "Sem açúcar; enviar com gelinho térmico" },
  { id: "lb-queijo-cottage", name: "Queijo cottage / ricota fresca", group: "laticinio_extra", emoji: "🥣", category: "mercado", allergens: ["leite"], prepNote: "Leve e fácil de espalhar" },
  { id: "lb-sementes-chia", name: "Mix de sementes trituradas", group: "laticinio_extra", emoji: "✨", category: "mercado", prepNote: "Chia ou linhaça moídas polvilhadas na fruta" },
];

export interface LunchboxCompartments {
  carboidrato?: LunchboxItem;
  proteina?: LunchboxItem;
  vegetal?: LunchboxItem;
  fruta?: LunchboxItem;
  laticinio_extra?: LunchboxItem;
}

export interface LunchboxTemplate {
  id: string;
  name: string;
  compartments: LunchboxCompartments;
  createdAt: string;
}

export type WeeklyLunchboxPlan = Record<DayKey, LunchboxCompartments>;

export const DEFAULT_TEMPLATES: LunchboxTemplate[] = [
  {
    id: "tpl-classico",
    name: "Lancheira Colorida Clássica",
    compartments: {
      carboidrato: LUNCHBOX_BANK.find((i) => i.id === "lb-pao-integral"),
      proteina: LUNCHBOX_BANK.find((i) => i.id === "lb-queijo-minas"),
      vegetal: LUNCHBOX_BANK.find((i) => i.id === "lb-tomatinho"),
      fruta: LUNCHBOX_BANK.find((i) => i.id === "lb-uva"),
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "tpl-energia",
    name: "Lancheira Energia & Panquequinha",
    compartments: {
      carboidrato: LUNCHBOX_BANK.find((i) => i.id === "lb-panqueca-banana"),
      proteina: LUNCHBOX_BANK.find((i) => i.id === "lb-ovo-cozido"),
      vegetal: LUNCHBOX_BANK.find((i) => i.id === "lb-cenoura-palito"),
      fruta: LUNCHBOX_BANK.find((i) => i.id === "lb-morango"),
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "tpl-pratico",
    name: "Lancheira Prática de Frutas e Homus",
    compartments: {
      carboidrato: LUNCHBOX_BANK.find((i) => i.id === "lb-milho"),
      proteina: LUNCHBOX_BANK.find((i) => i.id === "lb-homus"),
      vegetal: LUNCHBOX_BANK.find((i) => i.id === "lb-pepino"),
      fruta: LUNCHBOX_BANK.find((i) => i.id === "lb-maca"),
      laticinio_extra: LUNCHBOX_BANK.find((i) => i.id === "lb-iogurte-natural"),
    },
    createdAt: new Date().toISOString(),
  },
];

export interface LunchboxBalance {
  totalItems: number;
  groupCounts: Record<LunchboxGroup, number>;
  scorePercent: number;
  feedback: string;
  isBalanced: boolean;
  missingGroups: LunchboxGroup[];
}

export function calculateLunchboxBalance(compartments: LunchboxCompartments): LunchboxBalance {
  const groupCounts: Record<LunchboxGroup, number> = {
    carboidrato: compartments.carboidrato ? 1 : 0,
    proteina: compartments.proteina ? 1 : 0,
    vegetal: compartments.vegetal ? 1 : 0,
    fruta: compartments.fruta ? 1 : 0,
    laticinio_extra: compartments.laticinio_extra ? 1 : 0,
  };

  const totalItems = Object.values(groupCounts).reduce((a, b) => a + b, 0);

  const missingGroups: LunchboxGroup[] = [];
  if (!compartments.carboidrato) missingGroups.push("carboidrato");
  if (!compartments.proteina) missingGroups.push("proteina");
  if (!compartments.fruta) missingGroups.push("fruta");
  if (!compartments.vegetal) missingGroups.push("vegetal");

  let scorePercent = 0;
  if (totalItems > 0) {
    const mainGroupsPresent =
      (compartments.carboidrato ? 1 : 0) +
      (compartments.proteina ? 1 : 0) +
      (compartments.fruta ? 1 : 0) +
      (compartments.vegetal ? 1 : 0);
    scorePercent = Math.round((mainGroupsPresent / 4) * 100);
  }

  let feedback = "Adicione itens para montar a marmitinha.";
  let isBalanced = false;

  if (totalItems === 0) {
    feedback = "Arraste ou toque nos alimentos para montar a marmitinha.";
  } else if (totalItems === 1) {
    feedback = "Boa escolha inicial! Adicione outros grupos para equilibrar.";
  } else if (missingGroups.length >= 2) {
    feedback = "Quase lá! Tente incluir ao menos uma fruta e uma proteína.";
  } else if (missingGroups.length === 1) {
    const missingLabel = LUNCHBOX_GROUPS.find((g) => g.key === missingGroups[0])?.label.toLowerCase();
    feedback = `Excelente combinação! Que tal adicionar um item de ${missingLabel}?`;
  } else {
    isBalanced = true;
    feedback = "Perfeita! Marmitinha colorida, nutritiva e muito bem balanceada 🎉";
  }

  return {
    totalItems,
    groupCounts,
    scorePercent,
    feedback,
    isBalanced,
    missingGroups,
  };
}

// Avisos gerais, sem número/técnica específica — consenso amplo o bastante
// (não guardar maionese fora da geladeira, não levar peixe cru, confirmar
// política de alérgeno da escola) pra não precisar do mesmo crivo de revisão
// dos itens abaixo.
export const LUNCHBOX_SAFETY_GUIDELINES = {
  noFridgeFoods: [
    "Maionese caseira ou aberta há dias",
    "Molhos e cremes à base de leite sem refrigeração",
    "Peixe ou frutos do mar em temperatura ambiente",
    "Carnes e ovos com gema mole",
  ],
  allergySchoolNotice:
    "Importante: Algumas creches e escolas possuem políticas estritas de restrição a alérgenos (como amendoim, castanhas e frutos do mar). Sempre confirme com a coordenação pedagógica as diretrizes da sala do bebê.",
};

export interface LunchboxSafetyClaim {
  id: string;
  /** Texto final, só deve chegar na usuária depois de "aprovado". */
  text: string;
  /** Mostrado no lugar do texto acima enquanto "pendente". */
  fallbackText: string;
  revisao: "pendente" | "aprovado";
  prioridadeRevisao: "normal" | "alta";
}

// Números/técnicas específicas de segurança alimentar — mesmo crivo do
// campo "revisao" em foods.ts: gerado sem fonte verificável (nenhuma ficha
// já revisada cita "3 horas" ou "corte em 4 partes"), então fica escondido
// da usuária final até um humano habilitado aprovar pelo painel de revisão.
export const LUNCHBOX_SAFETY_CLAIMS: LunchboxSafetyClaim[] = [
  {
    id: "lb-safety-temperature-hours",
    text: "Até 3 horas em bolsa térmica com gelo em gel reutilizável",
    fallbackText:
      "Tempo máximo seguro fora da geladeira está em revisão — por enquanto, mantenha refrigerado até a hora de sair e leve a lancheira o mais perto possível do horário de consumo.",
    revisao: "pendente",
    prioridadeRevisao: "alta",
  },
  {
    id: "lb-safety-cut-round-foods",
    text: "Cortes seguros: Uvas e tomatinhos devem sempre ser cortados longitudinalmente em 4 partes para evitar qualquer risco de asfixia mecânica.",
    fallbackText:
      "Alimentos redondos (uva, tomate-cereja) precisam de corte especial pra reduzir risco de engasgo — a técnica exata está em revisão; até lá, converse com seu pediatra sobre o corte mais seguro pra idade do seu bebê.",
    revisao: "pendente",
    prioridadeRevisao: "alta",
  },
];

/** Texto pronto pra exibir: o real se já aprovado, senão o fallback seguro. */
export function getLunchboxSafetyClaimText(id: string): string {
  const claim = LUNCHBOX_SAFETY_CLAIMS.find((c) => c.id === id);
  if (!claim) return "";
  return claim.revisao === "aprovado" ? claim.text : claim.fallbackText;
}

/** Pra alimentar o painel de revisão admin (mesmo padrão de getPendingFoods). */
export function getPendingLunchboxSafetyClaims(): LunchboxSafetyClaim[] {
  return LUNCHBOX_SAFETY_CLAIMS.filter((c) => c.revisao === "pendente");
}

// Persistence helpers
const STORAGE_PREFIX_TEMPLATES = "nutrimae:lunchbox-templates:";
const STORAGE_PREFIX_PLAN = "nutrimae:lunchbox-weekly:";

export function getSavedTemplates(babyId: string): LunchboxTemplate[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX_TEMPLATES}${babyId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading lunchbox templates", e);
  }
  return DEFAULT_TEMPLATES;
}

export function saveLunchboxTemplate(babyId: string, template: LunchboxTemplate): LunchboxTemplate[] {
  if (typeof window === "undefined") return [];
  const current = getSavedTemplates(babyId);
  const existsIndex = current.findIndex((t) => t.id === template.id);
  let next: LunchboxTemplate[];
  if (existsIndex >= 0) {
    next = [...current];
    next[existsIndex] = template;
  } else {
    next = [template, ...current];
  }
  try {
    localStorage.setItem(`${STORAGE_PREFIX_TEMPLATES}${babyId}`, JSON.stringify(next));
  } catch (e) {
    console.error("Error saving lunchbox template", e);
  }
  return next;
}

export function deleteLunchboxTemplate(babyId: string, templateId: string): LunchboxTemplate[] {
  if (typeof window === "undefined") return [];
  const current = getSavedTemplates(babyId);
  const next = current.filter((t) => t.id !== templateId);
  try {
    localStorage.setItem(`${STORAGE_PREFIX_TEMPLATES}${babyId}`, JSON.stringify(next));
  } catch (e) {
    console.error("Error deleting lunchbox template", e);
  }
  return next;
}

export function getWeeklyLunchboxPlan(babyId: string): WeeklyLunchboxPlan {
  const emptyPlan: WeeklyLunchboxPlan = {
    seg: { ...DEFAULT_TEMPLATES[0].compartments },
    ter: { ...DEFAULT_TEMPLATES[1].compartments },
    qua: { ...DEFAULT_TEMPLATES[2].compartments },
    qui: { ...DEFAULT_TEMPLATES[0].compartments },
    sex: { ...DEFAULT_TEMPLATES[1].compartments },
    sab: {},
    dom: {},
  };

  if (typeof window === "undefined") return emptyPlan;
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX_PLAN}${babyId}`);
    if (saved) {
      return { ...emptyPlan, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading weekly lunchbox plan", e);
  }
  return emptyPlan;
}

export function saveWeeklyLunchboxPlan(babyId: string, plan: WeeklyLunchboxPlan): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX_PLAN}${babyId}`, JSON.stringify(plan));
  } catch (e) {
    console.error("Error saving weekly lunchbox plan", e);
  }
}

export function getWeeklyLunchboxShoppingItems(
  babyId: string,
): { key: string; name: string; category: IngredientCategory }[] {
  const plan = getWeeklyLunchboxPlan(babyId);
  const seen = new Map<string, { key: string; name: string; category: IngredientCategory }>();

  Object.values(plan).forEach((dayCompartments) => {
    Object.values(dayCompartments).forEach((item) => {
      if (item && item.name) {
        const key = `lb-${item.id}`;
        if (!seen.has(key)) {
          seen.set(key, {
            key,
            name: `${item.name} (Lancheira)`,
            category: item.category || "feira",
          });
        }
      }
    });
  });

  return Array.from(seen.values());
}

