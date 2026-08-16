const FAVORITES_KEY = "nutrimae:receitas:favoritas";
const RATINGS_KEY = "nutrimae:receitas:avaliacoes";

export function getFavoriteRecipeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteRecipe(id: string): string[] {
  const current = getFavoriteRecipeIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function getRecipeRatings(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RATINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function setRecipeRating(id: string, rating: number): Record<string, number> {
  const current = getRecipeRatings();
  const next = { ...current, [id]: rating };
  window.localStorage.setItem(RATINGS_KEY, JSON.stringify(next));
  return next;
}
