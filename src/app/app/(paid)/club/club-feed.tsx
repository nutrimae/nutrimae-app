"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Pin,
  Plus,
  Shield,
  X,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Search,
  Megaphone,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  badgeForStats,
  categoryFromTitle,
  COMMUNITY_BADGE_INFO,
  formatRelativeDate,
  OFFICIAL_ANNOUNCEMENTS,
  POST_CATEGORY_INFO,
  titleWithCategory,
  titleWithoutCategoryPrefix,
  type CommunityFaq,
  type CommunityPost,
  type PostCategory,
} from "@/lib/community";
import { getSeenReplyCounts } from "@/lib/community-notifications";
import { BackButton } from "@/components/back-button";

type FilterMode = "novos" | "trending" | "pergunta" | "dica";

const FILTERS: { key: FilterMode; emoji: string; label: string }[] = [
  { key: "novos", emoji: "🆕", label: "Novos" },
  { key: "trending", emoji: "🔥", label: "Trending" },
  { key: "pergunta", emoji: "❓", label: "Perguntas" },
  { key: "dica", emoji: "💡", label: "Dicas" },
];

const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL;

export function ClubFeed() {
  const supabase = useMemo(() => createClient(), []);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [faqs, setFaqs] = useState<CommunityFaq[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("novos");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [myReplyCount, setMyReplyCount] = useState(0);
  const [seenReplies, setSeenReplies] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [postsRes, faqsRes, profileRes, myRepliesRes] = await Promise.all([
        supabase
          .from("community_posts")
          .select("*")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false }),
        supabase.from("community_faqs").select("*").order("position", { ascending: true }),
        user
          ? supabase.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
        user
          ? supabase
              .from("community_replies")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id)
          : Promise.resolve({ count: 0 }),
      ]);

      if (cancelled) return;
      setPosts(postsRes.data ?? []);
      setFaqs(faqsRes.data ?? []);
      setIsAdmin(Boolean(profileRes.data?.is_admin));
      setUserId(user?.id ?? null);
      setMyReplyCount(myRepliesRes.count ?? 0);
      setSeenReplies(getSeenReplyCounts());
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const myPostCount = useMemo(
    () => (userId ? posts.filter((p) => p.user_id === userId).length : 0),
    [posts, userId],
  );
  const myBadge = badgeForStats(myPostCount, myReplyCount);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = posts.filter((post) => {
      if (q) {
        const haystack = `${post.title} ${post.body}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filter === "pergunta" || filter === "dica") {
        return categoryFromTitle(post.title) === filter;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (filter === "trending") return b.reply_count - a.reply_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [posts, filter, query]);

  async function handleCreate(title: string, body: string, category: PostCategory) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("community_posts")
      .insert({ user_id: user.id, title: titleWithCategory(title, category), body })
      .select("*")
      .single();

    if (!error && data) {
      setPosts((prev) => [data, ...prev]);
      setShowForm(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-800">Comunidade das Mães</h1>
          <p className="mt-0.5 text-sm text-brown-700/70">Bem-vinda à comunidade de mães 💛</p>
        </div>
        {isAdmin && (
          <Link
            href="/app/club/admin"
            className="flex shrink-0 items-center gap-1 rounded-full bg-terracotta-500/10 px-3 py-1.5 text-sm font-semibold text-terracotta-600"
          >
            <Shield className="h-4 w-4" strokeWidth={2} />
            Admin
          </Link>
        )}
      </div>

      {myBadge && (
        <div className="flex items-center gap-3 rounded-2xl bg-primary-100 p-4">
          <span className="text-2xl">{COMMUNITY_BADGE_INFO[myBadge].emoji}</span>
          <div>
            <p className="font-semibold text-brown-800">
              Você é {COMMUNITY_BADGE_INFO[myBadge].label} na comunidade!
            </p>
            <p className="text-xs text-brown-700/70">
              {myPostCount} {myPostCount === 1 ? "post" : "posts"} · {myReplyCount}{" "}
              {myReplyCount === 1 ? "resposta" : "respostas"}
            </p>
          </div>
        </div>
      )}

      {/* Comunicados oficiais — sticky no topo */}
      <div className="sticky top-14 z-30 -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {OFFICIAL_ANNOUNCEMENTS.map((a) => (
          <div
            key={a.id}
            className="flex w-64 shrink-0 gap-2 rounded-2xl bg-white/95 p-3 shadow-md shadow-brown-900/10 backdrop-blur"
          >
            <span className="text-xl">{a.emoji}</span>
            <div>
              <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary-600">
                <Megaphone className="h-3 w-3" strokeWidth={2.5} />
                NutriMäe
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brown-800">{a.title}</p>
              <p className="mt-0.5 text-xs text-brown-700/70">{a.text}</p>
            </div>
          </div>
        ))}
      </div>

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-sage-500 p-4 text-white"
        >
          <MessageSquare className="h-6 w-6 shrink-0" strokeWidth={2} />
          <div>
            <p className="font-semibold">Grupo de WhatsApp da Comunidade</p>
            <p className="text-xs text-white/80">Converse em tempo real com outras mães.</p>
          </div>
        </a>
      )}

      {faqs.length > 0 && (
        <div className="rounded-2xl bg-peach-100 p-4">
          <button
            type="button"
            onClick={() => setFaqOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2 font-heading font-bold text-brown-800">
              <HelpCircle className="h-5 w-5" strokeWidth={2} />
              Perguntas frequentes ({faqs.length})
            </span>
            <ChevronDown
              className={`h-5 w-5 text-brown-700 transition-transform ${faqOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>
          {faqOpen && (
            <div className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto">
              {faqs.map((faq) => (
                <div key={faq.id}>
                  <p className="font-semibold text-brown-800">{faq.question}</p>
                  <p className="mt-0.5 text-sm text-brown-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage-400"
          strokeWidth={2}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por palavra-chave ou #hashtag"
          className="min-h-12 w-full rounded-xl border-2 border-sage-100 bg-white pl-11 pr-4 text-base text-brown-800 outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_var(--color-primary-glow)]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
              filter === f.key ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      <Button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2">
        <Plus className="h-5 w-5" strokeWidth={2} />
        Novo post
      </Button>

      {loading ? (
        <p className="text-center text-brown-700/60">Carregando...</p>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Sparkles className="h-8 w-8 text-primary-500" strokeWidth={1.75} />
          </div>
          <p className="text-brown-700">
            {query || filter !== "novos"
              ? "Nenhum post encontrado com esses filtros."
              : "A comunidade ainda está começando. Seja a primeira a compartilhar!"}
          </p>
          <Button variant="brand" size="md" onClick={() => setShowForm(true)} className="w-auto px-6">
            Criar primeiro post
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredPosts.map((post) => {
            const category = categoryFromTitle(post.title);
            const isMine = post.user_id === userId;
            const hasNew = isMine && post.reply_count > (seenReplies[post.id] ?? 0);
            return (
              <Link
                key={post.id}
                href={`/app/club/${post.id}`}
                className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading font-bold text-brown-800">
                    {titleWithoutCategoryPrefix(post.title)}
                  </p>
                  {post.is_pinned && (
                    <Pin className="h-4 w-4 shrink-0 text-terracotta-500" strokeWidth={2} />
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-brown-700">{post.body}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-brown-700/60">
                  {category !== "geral" && (
                    <Badge variant="soft">
                      {POST_CATEGORY_INFO[category].emoji} {POST_CATEGORY_INFO[category].label}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                    {post.reply_count} {post.reply_count === 1 ? "resposta" : "respostas"}
                  </span>
                  <span>{formatRelativeDate(post.created_at)}</span>
                  {hasNew && (
                    <span className="ml-auto flex items-center gap-1 font-semibold text-terracotta-600">
                      <span className="h-2 w-2 rounded-full bg-terracotta-500" />
                      Nova resposta
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showForm && <NewPostSheet onClose={() => setShowForm(false)} onCreate={handleCreate} />}
    </main>
  );
}

function NewPostSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, body: string, category: PostCategory) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<PostCategory>("geral");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-brown-900/30" onClick={onClose}>
      <div className="w-full animate-fade-in-up rounded-t-3xl bg-cream p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-brown-800">Novo post</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50"
          >
            <X className="h-5 w-5 text-brown-700" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-base font-semibold text-brown-700">Categoria</label>
            <div className="flex gap-2">
              {(Object.keys(POST_CATEGORY_INFO) as PostCategory[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`min-h-11 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
                    category === key ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
                  }`}
                >
                  {POST_CATEGORY_INFO[key].emoji} {POST_CATEGORY_INFO[key].label}
                </button>
              ))}
            </div>
          </div>
          <Input
            id="post-title"
            label="Título"
            placeholder="Sua dúvida em poucas palavras"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div>
            <label htmlFor="post-body" className="mb-2 block text-base font-semibold text-brown-700">
              Detalhes
            </label>
            <textarea
              id="post-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Conte mais sobre a situação..."
              className="w-full rounded-2xl border-2 border-sage-100 bg-white p-4 text-lg text-brown-800 outline-none focus:border-sage-400"
            />
          </div>
          <Button
            onClick={async () => {
              if (!title.trim() || !body.trim()) return;
              setSaving(true);
              await onCreate(title.trim(), body.trim(), category);
              setSaving(false);
            }}
            disabled={saving || !title.trim() || !body.trim()}
          >
            {saving ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
