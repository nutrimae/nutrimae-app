export type Locale = "pt-BR" | "es";

export const LOCALES: { key: Locale; label: string; flag: string }[] = [
  { key: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
  { key: "es", label: "Español (Latinoamérica)", flag: "🌎" },
];

export const DEFAULT_LOCALE: Locale = "pt-BR";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "pt-BR" || value === "es";
}
