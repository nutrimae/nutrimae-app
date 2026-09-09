export type LatamRegion = "mexico" | "centroamerica" | "caribe" | "andina" | "rio_de_la_plata" | "chile";

export const LATAM_REGIONS: { key: LatamRegion; label: string; emoji: string }[] = [
  { key: "mexico", label: "México", emoji: "🌵" },
  { key: "centroamerica", label: "Centroamérica", emoji: "🌴" },
  { key: "caribe", label: "Caribe (Colombia, Venezuela...)", emoji: "🥥" },
  { key: "andina", label: "Región Andina (Perú, Ecuador, Bolivia)", emoji: "⛰️" },
  { key: "rio_de_la_plata", label: "Río de la Plata (Argentina, Uruguay, Paraguay)", emoji: "🧉" },
  { key: "chile", label: "Chile", emoji: "🍇" },
];

export const LATAM_REGION_LABEL: Record<LatamRegion, string> = {
  mexico: "México",
  centroamerica: "Centroamérica",
  caribe: "Caribe",
  andina: "Región Andina",
  rio_de_la_plata: "Río de la Plata",
  chile: "Chile",
};
