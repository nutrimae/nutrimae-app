export type Region = "norte" | "nordeste" | "centro_oeste" | "sudeste" | "sul";

export const REGIONS: { key: Region; label: string; emoji: string }[] = [
  { key: "norte", label: "Norte", emoji: "🌿" },
  { key: "nordeste", label: "Nordeste", emoji: "☀️" },
  { key: "centro_oeste", label: "Centro-Oeste", emoji: "🌾" },
  { key: "sudeste", label: "Sudeste", emoji: "🏙️" },
  { key: "sul", label: "Sul", emoji: "🌲" },
];

export const REGION_LABEL: Record<Region, string> = {
  norte: "Norte",
  nordeste: "Nordeste",
  centro_oeste: "Centro-Oeste",
  sudeste: "Sudeste",
  sul: "Sul",
};
