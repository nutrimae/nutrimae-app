const FAVORITES_KEY = "nutrimae:pratinhos:favoritos";
const RATINGS_KEY = "nutrimae:pratinhos:avaliacoes";
const CHOSEN_KEY = "nutrimae:pratinhos:escolhidos";

export function getFavoritePratinhoIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavoritePratinho(id: string): string[] {
  const current = getFavoritePratinhoIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function getPratinhoRatings(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RATINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function setPratinhoRating(id: string, rating: number): Record<string, number> {
  const current = getPratinhoRatings();
  const next = { ...current, [id]: rating };
  window.localStorage.setItem(RATINGS_KEY, JSON.stringify(next));
  return next;
}

export function getChosenPratinhoIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHOSEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addPratinhoToCardapio(id: string): string[] {
  const current = getChosenPratinhoIds();
  if (current.includes(id)) return current;
  const next = [...current, id];
  window.localStorage.setItem(CHOSEN_KEY, JSON.stringify(next));
  return next;
}

export function removePratinhoFromCardapio(id: string): string[] {
  const next = getChosenPratinhoIds().filter((x) => x !== id);
  window.localStorage.setItem(CHOSEN_KEY, JSON.stringify(next));
  return next;
}
