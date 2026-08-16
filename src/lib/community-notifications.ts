const SEEN_KEY = "nutrimae:community:respostas-vistas";

export function getSeenReplyCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function markPostSeen(postId: string, replyCount: number) {
  const current = getSeenReplyCounts();
  current[postId] = replyCount;
  window.localStorage.setItem(SEEN_KEY, JSON.stringify(current));
}

export function hasNewReplies(postId: string, replyCount: number): boolean {
  const seen = getSeenReplyCounts()[postId] ?? 0;
  return replyCount > seen;
}
