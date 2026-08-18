export type AgeKey = "vai-comecar" | "6-meses" | "7-9-meses" | "10-12-meses";

export interface AgeOption {
  key: AgeKey;
  label: string;
  /** Idade aproximada em meses usada para pré-preencher o onboarding do app. */
  onboardingMonths: number;
  ctaLabel: string;
  food: {
    name: string;
    emoji: string;
    ageRange: string;
    cut: string;
    how: string;
  };
}

export const AGE_OPTIONS: AgeOption[] = [
  {
    key: "vai-comecar",
    label: "Ainda vou começar",
    onboardingMonths: 5,
    ctaLabel: "Ver o plano para quando eu começar",
    food: {
      name: "Banana",
      emoji: "🍌",
      ageRange: "a partir dos 6 meses",
      cut: "Bastão largo, do tamanho do punho fechado do bebê",
      how: "Na mão, sem casca, com uma pontinha cortada para dar apoio",
    },
  },
  {
    key: "6-meses",
    label: "6 meses",
    onboardingMonths: 6,
    ctaLabel: "Ver o plano dos 6 meses",
    food: {
      name: "Morango",
      emoji: "🍓",
      ageRange: "a partir dos 6 meses",
      cut: "Inteiro, com a rama removida",
      how: "Na mão do bebê, sentado e supervisionado",
    },
  },
  {
    key: "7-9-meses",
    label: "7 a 9 meses",
    onboardingMonths: 8,
    ctaLabel: "Ver o plano dos 7 aos 9 meses",
    food: {
      name: "Frango desfiado",
      emoji: "🍗",
      ageRange: "7 a 9 meses",
      cut: "Desfiado ou em tiras finas e macias",
      how: "Junto com o prato, fácil de pegar com as mãos",
    },
  },
  {
    key: "10-12-meses",
    label: "10 a 12+ meses",
    onboardingMonths: 11,
    ctaLabel: "Ver o plano dos 10 aos 12+ meses",
    food: {
      name: "Bolinho de legumes",
      emoji: "🥕",
      ageRange: "10 a 12+ meses",
      cut: "Pedaços pequenos e macios",
      how: "Incentive o bebê a pegar sozinho, com ou sem talher",
    },
  },
];

export const DEFAULT_AGE_KEY: AgeKey = "6-meses";

export function getAgeOption(key: AgeKey): AgeOption {
  return AGE_OPTIONS.find((option) => option.key === key) ?? AGE_OPTIONS[1];
}

export interface DemoFood {
  key: string;
  name: string;
  emoji: string;
  ageRange: string;
  cut: string;
  how: string;
}

/** Alimentos reais e funcionais no campo de busca da demonstração. */
export const SEARCHABLE_FOODS: DemoFood[] = [
  {
    key: "banana",
    name: "Banana",
    emoji: "🍌",
    ageRange: "a partir dos 6 meses",
    cut: "Bastão largo, do tamanho do punho fechado do bebê",
    how: "Na mão, sem casca, com uma pontinha cortada para dar apoio",
  },
  {
    key: "abacate",
    name: "Abacate",
    emoji: "🥑",
    ageRange: "a partir dos 6 meses",
    cut: "Fatias grossas com casca, para facilitar a preensão",
    how: "Na mão, ou amassado em uma colher pré-carregada",
  },
  {
    key: "morango",
    name: "Morango",
    emoji: "🍓",
    ageRange: "a partir dos 6 meses",
    cut: "Inteiro, com a rama removida",
    how: "Na mão do bebê, sentado e supervisionado",
  },
];

/** Só para o efeito visual de "cadeado" — não são alvo de busca. */
export const LOCKED_FOODS: { key: string; name: string; emoji: string }[] = [
  { key: "laranja", name: "Laranja", emoji: "🍊" },
  { key: "cenoura", name: "Cenoura", emoji: "🥕" },
  { key: "batata-doce", name: "Batata-doce", emoji: "🍠" },
  { key: "arroz", name: "Arroz e feijão", emoji: "🍚" },
  { key: "pera", name: "Pera", emoji: "🍐" },
];
