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

export interface Announcement {
  id: string;
  emoji: string;
  title: string;
  text: string;
}

export const OFFICIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "guia-definitivo",
    emoji: "📖",
    title: "Novo: Guia Definitivo da Introdução Alimentar",
    text: "Passo a passo dos primeiros 7 dias, progressão por idade e segurança alimentar, tudo em um só lugar.",
  },
  {
    id: "receitas",
    emoji: "🍽️",
    title: "Dica: 48 receitas por faixa etária",
    text: "Busque por ingrediente, filtre por refeição e favorite as receitas do seu bebê em Receitas.",
  },
  {
    id: "audiobooks",
    emoji: "🎧",
    title: "Novo: Audiobooks Janela Imunológica e Engasgo ou GAG",
    text: "Conteúdo completo para ler (áudio chegando em breve) sobre os temas que mais geram dúvida.",
  },
  {
    id: "faq",
    emoji: "❓",
    title: "FAQ da comunidade atualizado",
    text: "Reunimos as 20 perguntas mais frequentes das mães aqui na comunidade — confira antes de perguntar, sua dúvida pode já estar respondida.",
  },
  {
    id: "bonus",
    emoji: "🎁",
    title: "Bônus: Guia BLW e Checklist de Alergênicos",
    text: "Cortes seguros para Baby-Led Weaning e um checklist dos 14 alérgenos oficiais, com filtro automático nas receitas.",
  },
];

export type CommunityBadge = "ativa" | "helper" | "expert" | "influencer";

export const COMMUNITY_BADGE_INFO: Record<CommunityBadge, { emoji: string; label: string }> = {
  ativa: { emoji: "🎯", label: "Ativa" },
  helper: { emoji: "🤝", label: "Helper" },
  expert: { emoji: "⭐", label: "Expert" },
  influencer: { emoji: "👑", label: "Influencer" },
};

export function badgeForStats(postCount: number, replyCount: number): CommunityBadge | null {
  const total = postCount + replyCount;
  if (replyCount >= 20) return "influencer";
  if (replyCount >= 10) return "expert";
  if (replyCount >= 5) return "helper";
  if (total >= 3) return "ativa";
  return null;
}

export type PostCategory = "pergunta" | "dica" | "geral";

export const POST_CATEGORY_INFO: Record<PostCategory, { emoji: string; label: string }> = {
  pergunta: { emoji: "❓", label: "Pergunta" },
  dica: { emoji: "💡", label: "Dica" },
  geral: { emoji: "📝", label: "Geral" },
};

/** Categoria é guardada como um prefixo de emoji no título — evita precisar de
 * migração de schema para uma coluna nova. */
export function categoryFromTitle(title: string): PostCategory {
  if (title.startsWith("❓")) return "pergunta";
  if (title.startsWith("💡")) return "dica";
  return "geral";
}

export function titleWithCategory(title: string, category: PostCategory): string {
  if (category === "geral") return title;
  return `${POST_CATEGORY_INFO[category].emoji} ${title}`;
}

export function titleWithoutCategoryPrefix(title: string): string {
  return title.replace(/^[❓💡]\s*/, "");
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
