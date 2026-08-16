"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Pin, Plus, Shield, X, HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeDate, type CommunityFaq, type CommunityPost } from "@/lib/community";

type SortMode = "recentes" | "respondidos";

export function ClubFeed() {
  const supabase = useMemo(() => createClient(), []);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [faqs, setFaqs] = useState<CommunityFaq[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sort, setSort] = useState<SortMode>("recentes");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [postsRes, faqsRes, profileRes] = await Promise.all([
        supabase
          .from("community_posts")
          .select("*")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false }),
        supabase.from("community_faqs").select("*").order("position", { ascending: true }),
        user
          ? supabase.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (cancelled) return;
      setPosts(postsRes.data ?? []);
      setFaqs(faqsRes.data ?? []);
      setIsAdmin(Boolean(profileRes.data?.is_admin));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const sortedPosts = useMemo(() => {
    const list = [...posts];
    list.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (sort === "respondidos") return b.reply_count - a.reply_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [posts, sort]);

  async function handleCreate(title: string, body: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("community_posts")
      .insert({ user_id: user.id, title, body })
      .select("*")
      .single();

    if (!error && data) {
      setPosts((prev) => [data, ...prev]);
      setShowForm(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-brown-800">Club das Mães</h1>
        {isAdmin && (
          <Link
            href="/app/club/admin"
            className="flex items-center gap-1 rounded-full bg-terracotta-500/10 px-3 py-1.5 text-sm font-semibold text-terracotta-600"
          >
            <Shield className="h-4 w-4" strokeWidth={2} />
            Admin
          </Link>
        )}
      </div>

      {faqs.length > 0 && (
        <div className="rounded-2xl bg-peach-100 p-4">
          <button
            type="button"
            onClick={() => setFaqOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2 font-heading font-bold text-brown-800">
              <HelpCircle className="h-5 w-5" strokeWidth={2} />
              Perguntas frequentes
            </span>
            <ChevronDown
              className={`h-5 w-5 text-brown-700 transition-transform ${faqOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>
          {faqOpen && (
            <div className="mt-3 flex flex-col gap-3">
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSort("recentes")}
          className={`min-h-11 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
            sort === "recentes" ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
          }`}
        >
          Mais recentes
        </button>
        <button
          type="button"
          onClick={() => setSort("respondidos")}
          className={`min-h-11 flex-1 rounded-2xl text-sm font-semibold transition-colors ${
            sort === "respondidos" ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
          }`}
        >
          Mais respondidos
        </button>
      </div>

      <Button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2">
        <Plus className="h-5 w-5" strokeWidth={2} />
        Novo post
      </Button>

      {loading ? (
        <p className="text-center text-brown-700/60">Carregando...</p>
      ) : sortedPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Sparkles className="h-8 w-8 text-primary-500" strokeWidth={1.75} />
          </div>
          <p className="text-brown-700">
            A comunidade ainda está começando. Seja a primeira a compartilhar!
          </p>
          <Button variant="brand" size="md" onClick={() => setShowForm(true)} className="w-auto px-6">
            Criar primeiro post
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/app/club/${post.id}`}
              className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading font-bold text-brown-800">{post.title}</p>
                {post.is_pinned && (
                  <Pin className="h-4 w-4 shrink-0 text-terracotta-500" strokeWidth={2} />
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-brown-700">{post.body}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-brown-700/60">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                  {post.reply_count} {post.reply_count === 1 ? "resposta" : "respostas"}
                </span>
                <span>{formatRelativeDate(post.created_at)}</span>
              </div>
            </Link>
          ))}
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
  onCreate: (title: string, body: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-brown-900/30" onClick={onClose}>
      <div className="w-full rounded-t-3xl bg-cream p-6 pb-8" onClick={(e) => e.stopPropagation()}>
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
              await onCreate(title.trim(), body.trim());
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
