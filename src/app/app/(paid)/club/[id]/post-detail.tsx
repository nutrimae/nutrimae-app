"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flag, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  categoryFromTitle,
  formatRelativeDate,
  POST_CATEGORY_INFO,
  titleWithoutCategoryPrefix,
  type CommunityPost,
  type CommunityReply,
} from "@/lib/community";
import { markPostSeen } from "@/lib/community-notifications";

export function PostDetail({ postId }: { postId: string }) {
  const supabase = useMemo(() => createClient(), []);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [asOfficial, setAsOfficial] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sending, setSending] = useState(false);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [postRes, repliesRes, profileRes] = await Promise.all([
        supabase.from("community_posts").select("*").eq("id", postId).single(),
        supabase
          .from("community_replies")
          .select("*")
          .eq("post_id", postId)
          .eq("is_hidden", false)
          .order("created_at", { ascending: true }),
        user
          ? supabase.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (cancelled) return;
      setPost(postRes.data);
      setReplies(repliesRes.data ?? []);
      setIsAdmin(Boolean(profileRes.data?.is_admin));
      setLoading(false);
      if (postRes.data && user && postRes.data.user_id === user.id) {
        markPostSeen(postRes.data.id, postRes.data.reply_count);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [postId, supabase]);

  async function handleReply() {
    if (!replyBody.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setSending(true);
    const { data, error } = await supabase
      .from("community_replies")
      .insert({ post_id: postId, user_id: user.id, body: replyBody.trim() })
      .select("*")
      .single();

    if (!error && data) {
      let saved = data;
      if (isAdmin && asOfficial) {
        await fetch("/api/admin/community", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "mark_official", replyId: data.id, official: true }),
        });
        saved = { ...data, is_official: true };
      }
      setReplies((prev) => [...prev, saved]);
      setReplyBody("");
      setAsOfficial(false);
      setPost((prev) => (prev ? { ...prev, reply_count: prev.reply_count + 1 } : prev));
    }
    setSending(false);
  }

  async function handleReport(targetType: "post" | "reply", targetId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("community_reports").insert({
      target_type: targetType,
      target_id: targetId,
      reporter_user_id: user.id,
    });
    setReported((prev) => new Set(prev).add(targetId));
  }

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Post não encontrado.</p>
        <Link href="/app/club" className="text-sage-600 font-semibold">
          Voltar à Comunidade
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <Link
        href="/app/club"
        className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Voltar à Comunidade
      </Link>

      <div className="rounded-3xl bg-white/80 p-5 shadow-sm shadow-brown-900/5">
        {categoryFromTitle(post.title) !== "geral" && (
          <span className="mb-1 inline-block rounded-full bg-sage-50 px-2 py-0.5 text-xs font-semibold text-sage-700">
            {POST_CATEGORY_INFO[categoryFromTitle(post.title)].emoji}{" "}
            {POST_CATEGORY_INFO[categoryFromTitle(post.title)].label}
          </span>
        )}
        <p className="font-heading text-xl font-bold text-brown-800">
          {titleWithoutCategoryPrefix(post.title)}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-brown-800">{post.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-brown-700/60">{formatRelativeDate(post.created_at)}</span>
          <ReportButton
            reported={reported.has(post.id)}
            onReport={() => handleReport("post", post.id)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={`rounded-2xl p-4 ${
              reply.is_official ? "bg-sage-100" : "bg-white/80 shadow-sm shadow-brown-900/5"
            }`}
          >
            {reply.is_official && (
              <span className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-sage-700">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                Resposta oficial NutriMäe
              </span>
            )}
            <p className="text-brown-800">{reply.body}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-brown-700/60">{formatRelativeDate(reply.created_at)}</span>
              <ReportButton
                reported={reported.has(reply.id)}
                onReport={() => handleReport("reply", reply.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          rows={3}
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder="Escreva sua resposta..."
          className="w-full rounded-2xl border-2 border-sage-100 bg-white p-4 text-lg text-brown-800 outline-none focus:border-sage-400"
        />
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm font-semibold text-sage-700">
            <input
              type="checkbox"
              checked={asOfficial}
              onChange={(e) => setAsOfficial(e.target.checked)}
              className="h-5 w-5 rounded accent-sage-500"
            />
            Marcar como resposta oficial NutriMäe
          </label>
        )}
        <Button onClick={handleReply} disabled={sending || !replyBody.trim()}>
          {sending ? "Enviando..." : "Responder"}
        </Button>
      </div>
    </main>
  );
}

function ReportButton({ reported, onReport }: { reported: boolean; onReport: () => void }) {
  return (
    <button
      type="button"
      onClick={onReport}
      disabled={reported}
      className="flex items-center gap-1 text-xs font-semibold text-brown-700/60 disabled:text-terracotta-500"
    >
      <Flag className="h-3.5 w-3.5" strokeWidth={2} />
      {reported ? "Reportado" : "Reportar"}
    </button>
  );
}
