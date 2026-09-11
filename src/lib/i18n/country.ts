import type { LatamRegion } from "@/lib/latam-regions";

export type Country = "cl" | "mx" | "co" | "pe" | "ec";

export const COUNTRIES: { key: Country; label: string; flag: string }[] = [
  { key: "cl", label: "Chile", flag: "🇨🇱" },
  { key: "mx", label: "México", flag: "🇲🇽" },
  { key: "co", label: "Colombia", flag: "🇨🇴" },
  { key: "pe", label: "Perú", flag: "🇵🇪" },
  { key: "ec", label: "Ecuador", flag: "🇪🇨" },
];

export const DEFAULT_COUNTRY: Country = "cl";

export function isCountry(value: unknown): value is Country {
  return value === "cl" || value === "mx" || value === "co" || value === "pe" || value === "ec";
}

/**
 * País é mais concreto pra usuária escolher do que a LatamRegion macro (ninguém
 * pensa em "sou da Região Andina" — pensa "sou do Peru"), mas a priorização de
 * receitas/alimentos em foods.ts/recipes.ts/menu.ts já é feita por LatamRegion.
 * Em vez de pedir as duas coisas no onboarding, inferimos a região a partir do
 * país escolhido e gravamos as duas — a usuária responde uma pergunta só.
 */
export const COUNTRY_TO_LATAM_REGION: Record<Country, LatamRegion> = {
  cl: "chile",
  mx: "mexico",
  co: "caribe",
  pe: "andina",
  ec: "andina",
};
