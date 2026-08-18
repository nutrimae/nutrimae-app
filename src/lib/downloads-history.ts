export interface DownloadEntry {
  id: string;
  title: string;
  type: "pdf" | "zip" | "txt" | "mp3";
  sizeBytes: number;
  downloadedAt: string;
}

const HISTORY_KEY = "nutrimae:downloads:historico";
const MAX_ENTRIES = 50;

export function getDownloadHistory(): DownloadEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as DownloadEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordDownload(entry: Omit<DownloadEntry, "downloadedAt">): DownloadEntry[] {
  const current = getDownloadHistory();
  const next = [{ ...entry, downloadedAt: new Date().toISOString() }, ...current].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function clearDownloadHistory(): DownloadEntry[] {
  window.localStorage.removeItem(HISTORY_KEY);
  return [];
}

export function removeDownloadEntry(index: number): DownloadEntry[] {
  const current = getDownloadHistory();
  const next = current.filter((_, i) => i !== index);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function downloadCountFor(id: string): number {
  return getDownloadHistory().filter((e) => e.id === id).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const RATINGS_KEY = "nutrimae:downloads:avaliacoes";

export function getDownloadRatings(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(RATINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function setDownloadRating(id: string, rating: number): Record<string, number> {
  const current = getDownloadRatings();
  const next = { ...current, [id]: rating };
  window.localStorage.setItem(RATINGS_KEY, JSON.stringify(next));
  return next;
}
