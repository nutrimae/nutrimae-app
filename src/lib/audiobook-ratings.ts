interface AudiobookRating {
  stars: number;
  comment: string;
}

const RATINGS_KEY = "nutrimae:audiobooks:avaliacoes";

export function getAudiobookRatings(): Record<string, AudiobookRating> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RATINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AudiobookRating>) : {};
  } catch {
    return {};
  }
}

export function setAudiobookRating(id: string, rating: AudiobookRating): Record<string, AudiobookRating> {
  const current = getAudiobookRatings();
  const next = { ...current, [id]: rating };
  window.localStorage.setItem(RATINGS_KEY, JSON.stringify(next));
  return next;
}
