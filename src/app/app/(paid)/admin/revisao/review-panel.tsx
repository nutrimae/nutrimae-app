"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { getPendingFoods, type FoodItem } from "@/lib/foods";
import { getPendingRecipes, type Recipe } from "@/lib/recipes";
import { REGION_LABEL, type Region } from "@/lib/regions";

type ReviewAction = "aprovado" | "rejeitado";
type ContentType = "food" | "recipe";
type PriorityFilter = "all" | "alta" | "normal";

interface PendingItem {
  contentType: ContentType;
  id: string;
  name: string;
  regiao?: Region[];
  priority: "normal" | "alta";
  warning?: string;
}

export function ReviewPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [saving, setSaving] = useState<string | null>(null);

  // Load already-reviewed items from Supabase
  const [reviewedFromDb, setReviewedFromDb] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("content_reviews")
      .select("content_type, content_id, status")
      .neq("status", "pendente")
      .then(({ data }) => {
        if (data) {
          setReviewedFromDb(new Set(data.map((r) => `${r.content_type}:${r.content_id}`)));
        }
      });
  }, [supabase]);

  const pendingItems: PendingItem[] = useMemo(() => {
    const foods: PendingItem[] = getPendingFoods().map((f) => ({
      contentType: "food" as const,
      id: f.id,
      name: f.name,
      regiao: f.regiao,
      priority: f.prioridadeRevisao ?? "normal",
      warning: f.warning,
    }));

    const recipes: PendingItem[] = getPendingRecipes().map((r) => ({
      contentType: "recipe" as const,
      id: r.id,
      name: r.title,
      regiao: r.regiao,
      priority: "normal",
    }));

    const all = [...foods, ...recipes]
      .filter((item) => !reviewedFromDb.has(`${item.contentType}:${item.id}`))
      .filter((item) => !reviewed.has(`${item.contentType}:${item.id}`))
      .sort((a, b) => {
        // Alta prioridade primeiro
        if (a.priority === "alta" && b.priority !== "alta") return -1;
        if (b.priority === "alta" && a.priority !== "alta") return 1;
        return 0;
      });

    if (priorityFilter === "all") return all;
    return all.filter((item) => item.priority === priorityFilter);
  }, [reviewedFromDb, reviewed, priorityFilter]);

  async function handleReview(item: PendingItem, action: ReviewAction) {
    const key = `${item.contentType}:${item.id}`;
    setSaving(key);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("content_reviews").upsert(
      {
        content_type: item.contentType,
        content_id: item.id,
        status: action,
        priority: item.priority,
        reviewer_id: user?.id,
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: "content_type,content_id" },
    );

    setReviewed((prev) => new Set(prev).add(key));
    setSaving(null);
  }

  const highPriorityCount = pendingItems.filter((i) => i.priority === "alta").length;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Revisão de conteúdo</h1>
        <p className="mt-1 text-sm text-brown-700/70">
          {pendingItems.length} {pendingItems.length === 1 ? "item pendente" : "itens pendentes"} de revisão
        </p>
      </div>

      {highPriorityCount > 0 && (
        <div className="flex gap-3 rounded-2xl bg-terracotta-500/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-terracotta-600" strokeWidth={2} />
          <p className="text-sm font-semibold text-brown-800">
            {highPriorityCount} {highPriorityCount === 1 ? "item" : "itens"} com prioridade ALTA — risco de segurança específico.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {(["all", "alta", "normal"] as PriorityFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setPriorityFilter(f)}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
              priorityFilter === f
                ? "bg-brown-800 text-white"
                : "bg-sage-50 text-brown-700"
            }`}
          >
            {f === "all" ? "Todos" : f === "alta" ? "🔴 Alta" : "Normal"}
          </button>
        ))}
      </div>

      {pendingItems.length === 0 ? (
        <div className="mt-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-sage-400" strokeWidth={1.5} />
          <p className="mt-3 font-heading text-lg font-bold text-brown-800">Tudo revisado!</p>
          <p className="mt-1 text-sm text-brown-700/70">Nenhum item pendente no momento.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pendingItems.map((item) => {
            const key = `${item.contentType}:${item.id}`;
            const isSaving = saving === key;

            return (
              <div
                key={key}
                className={`rounded-2xl p-4 shadow-sm shadow-brown-900/5 ${
                  item.priority === "alta"
                    ? "border-2 border-terracotta-400 bg-white"
                    : "bg-white/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-bold uppercase ${
                        item.contentType === "food"
                          ? "bg-sage-100 text-sage-700"
                          : "bg-primary-100 text-primary-700"
                      }`}>
                        {item.contentType === "food" ? "Alimento" : "Receita"}
                      </span>
                      {item.priority === "alta" && (
                        <span className="rounded-lg bg-terracotta-500 px-2 py-0.5 text-xs font-bold text-white">
                          PRIORIDADE ALTA
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-heading text-lg font-bold text-brown-800">{item.name}</p>
                    {item.regiao && item.regiao.length > 0 && (
                      <p className="mt-0.5 text-sm text-brown-700/70">
                        Região: {item.regiao.map((r) => REGION_LABEL[r]).join(", ")}
                      </p>
                    )}
                    {item.warning && (
                      <div className="mt-2 flex gap-2 rounded-xl bg-terracotta-500/10 p-3">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-terracotta-600" strokeWidth={2} />
                        <p className="text-sm text-brown-800">{item.warning}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => handleReview(item, "aprovado")}
                    disabled={isSaving}
                    className="flex-1 gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" strokeWidth={2} />
                    {isSaving ? "Salvando..." : "Aprovar"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleReview(item, "rejeitado")}
                    disabled={isSaving}
                    className="flex-1 gap-1.5 text-terracotta-600"
                  >
                    <XCircle className="h-4 w-4" strokeWidth={2} />
                    Rejeitar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
