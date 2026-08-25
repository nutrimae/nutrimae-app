"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pin, EyeOff, Eye, Flag, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeDate, type CommunityFaq, type CommunityPost } from "@/lib/community";

interface Report {
  id: string;
  target_type: "post" | "reply";
  target_id: string;
  created_at: string;
}

async function callAdminAction(body: unknown) {
  const res = await fetch("/api/admin/community", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export function AdminPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [faqs, setFaqs] = useState<CommunityFaq[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const [adminRes, faqsRes] = await Promise.all([
      fetch("/api/admin/community").then((r) => r.json()),
      supabase.from("community_faqs").select("*").order("position", { ascending: true }),
    ]);
    setPosts(adminRes.posts ?? []);
    setReports(adminRes.reports ?? []);
    setFaqs(faqsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportCountByTarget = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reports) map.set(r.target_id, (map.get(r.target_id) ?? 0) + 1);
    return map;
  }, [reports]);

  async function togglePin(post: CommunityPost) {
    await callAdminAction({ type: "pin_post", postId: post.id, pinned: !post.is_pinned });
    reload();
  }

  async function toggleHide(post: CommunityPost) {
    await callAdminAction({ type: "hide_post", postId: post.id, hidden: !post.is_hidden });
    reload();
  }

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando painel admin...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <Link
        href="/app/club"
        className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Voltar à Comunidade
      </Link>

      <h1 className="font-heading text-2xl font-bold text-brown-800">Painel admin</h1>

      {reports.length > 0 && (
        <div>
          <h2 className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-terracotta-600">
            <Flag className="h-5 w-5" strokeWidth={2} />
            Denúncias ({reports.length})
          </h2>
          <div className="flex flex-col gap-2">
            {reports.map((r) => (
              <div key={r.id} className="rounded-2xl bg-red-100 p-3 text-sm text-brown-800">
                {r.target_type === "post" ? "Post" : "Resposta"} denunciado ·{" "}
                {formatRelativeDate(r.created_at)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">Posts</h2>
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading font-bold text-brown-800">{post.title}</p>
                {(reportCountByTarget.get(post.id) ?? 0) > 0 && (
                  <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                    {reportCountByTarget.get(post.id)} denúncia(s)
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-brown-700">{post.body}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => togglePin(post)}
                  className={`flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl text-xs font-semibold ${
                    post.is_pinned ? "bg-terracotta-500 text-white" : "bg-sage-50 text-brown-700"
                  }`}
                >
                  <Pin className="h-3.5 w-3.5" strokeWidth={2} />
                  {post.is_pinned ? "Fixado" : "Fixar"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleHide(post)}
                  className={`flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl text-xs font-semibold ${
                    post.is_hidden ? "bg-red-100 text-red-600" : "bg-sage-50 text-brown-700"
                  }`}
                >
                  {post.is_hidden ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={2} /> Oculto
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" strokeWidth={2} /> Ocultar
                    </>
                  )}
                </button>
                <Link
                  href={`/app/club/${post.id}`}
                  className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-sage-50 text-xs font-semibold text-brown-700"
                >
                  Abrir
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FaqEditor faqs={faqs} onChange={reload} />
    </main>
  );
}

function FaqEditor({ faqs, onChange }: { faqs: CommunityFaq[]; onChange: () => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  async function addFaq() {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    await callAdminAction({
      type: "upsert_faq",
      question: question.trim(),
      answer: answer.trim(),
      position: faqs.length,
    });
    setQuestion("");
    setAnswer("");
    setSaving(false);
    onChange();
  }

  async function removeFaq(id: string) {
    await callAdminAction({ type: "delete_faq", id });
    onChange();
  }

  return (
    <div>
      <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">FAQ</h2>
      <div className="mb-3 flex flex-col gap-2">
        {faqs.map((faq) => (
          <div key={faq.id} className="flex items-start justify-between gap-2 rounded-2xl bg-white/80 p-3">
            <div>
              <p className="text-sm font-semibold text-brown-800">{faq.question}</p>
              <p className="text-xs text-brown-700/90">{faq.answer}</p>
            </div>
            <button
              type="button"
              onClick={() => removeFaq(faq.id)}
              className="shrink-0 rounded-full bg-red-100 p-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-sage-50 p-4">
        <Input
          id="faq-question"
          label="Nova pergunta"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Input id="faq-answer" label="Resposta" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <Button onClick={addFaq} disabled={saving} className="flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Adicionar ao FAQ
        </Button>
      </div>
    </div>
  );
}
