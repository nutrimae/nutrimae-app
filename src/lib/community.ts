export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_hidden: boolean;
  reply_count: number;
  created_at: string;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  is_official: boolean;
  is_hidden: boolean;
  created_at: string;
}

export interface CommunityFaq {
  id: string;
  question: string;
  answer: string;
  position: number;
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD}d`;
  return date.toLocaleDateString("pt-BR");
}
