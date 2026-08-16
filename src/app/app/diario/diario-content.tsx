"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import {
  DIARY_FOODS,
  FOOD_CATEGORY_LABEL,
  TOTAL_DIARY_FOODS,
  REACTION_EMOJI,
  REACTION_LABEL,
  MILESTONES,
  type Reaction,
  type FoodCategory,
  type DiaryFood,
} from "@/lib/food-diary";

interface LogEntry {
  reaction: Reaction;
  tried_at: string;
  photo_url: string | null;
}

const CATEGORY_ORDER: FoodCategory[] = ["frutas", "legumes", "proteinas", "cereais"];

export function DiarioContent() {
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  const [log, setLog] = useState<Record<string, LogEntry>>({});
  const [milestones, setMilestones] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<DiaryFood | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    if (!activeBaby) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [logRes, milestonesRes] = await Promise.all([
        supabase
          .from("food_log")
          .select("food_key, reaction, tried_at, photo_url")
          .eq("baby_id", activeBaby!.id),
        supabase
          .from("food_milestones")
          .select("milestone_key, achieved_at")
          .eq("baby_id", activeBaby!.id),
      ]);

      if (cancelled) return;

      const logMap: Record<string, LogEntry> = {};
      for (const row of logRes.data ?? []) {
        logMap[row.food_key] = {
          reaction: row.reaction,
          tried_at: row.tried_at,
          photo_url: row.photo_url,
        };
      }
      setLog(logMap);

      const milestoneMap: Record<string, string> = {};
      for (const row of milestonesRes.data ?? []) {
        milestoneMap[row.milestone_key] = row.achieved_at;
      }
      setMilestones(milestoneMap);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeBaby, supabase]);

  async function markMilestone(key: string) {
    if (!activeBaby) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("food_milestones").insert({
      baby_id: activeBaby.id,
      user_id: user.id,
      milestone_key: key,
      achieved_at: today,
    });
    if (!error) {
      setMilestones((prev) => ({ ...prev, [key]: today }));
    }
  }

  async function saveLogEntry(food: DiaryFood, reaction: Reaction, photoFile: File | null) {
    if (!activeBaby) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let photoUrl: string | null = log[food.key]?.photo_url ?? null;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${activeBaby.id}-${food.key}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("food-log-photos")
        .upload(path, photoFile, { upsert: true });
      if (!uploadError) {
        photoUrl = path;
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("food_log").upsert(
      {
        baby_id: activeBaby.id,
        user_id: user.id,
        food_key: food.key,
        reaction,
        photo_url: photoUrl,
        tried_at: today,
      },
      { onConflict: "baby_id,food_key" },
    );

    if (!error) {
      const isNew = !log[food.key];
      setLog((prev) => ({ ...prev, [food.key]: { reaction, tried_at: today, photo_url: photoUrl } }));
      setRegistering(null);
      if (isNew) {
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 350);
        showToast(
          `✓ Registrado! ${activeBaby.name.split(" ")[0]} explorou mais um sabor`,
        );
      }
    }
  }

  const triedCount = Object.keys(log).length;

  const achievedMilestones = MILESTONES.filter((m) => milestones[m.key]).sort(
    (a, b) => (milestones[a.key] > milestones[b.key] ? 1 : -1),
  );
  const pendingMilestones = MILESTONES.filter((m) => !milestones[m.key]);

  if (!activeBaby) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando o diário...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Diário de {activeBaby.name}
        </h1>
        <p className="mt-1 text-brown-700">
          {triedCount === 0 ? (
            `Nenhum alimento registrado ainda. Vamos descobrir quais sabores ${activeBaby.name.split(" ")[0]} adora?`
          ) : (
            <>
              <span
                className={`inline-block font-bold text-primary-600 ${justUpdated ? "animate-pop" : ""}`}
              >
                {triedCount}
              </span>{" "}
              de {TOTAL_DIARY_FOODS} sabores provados
            </>
          )}
        </p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-sage-100">
          <div
            className="h-full rounded-full bg-sage-500 transition-all"
            style={{ width: `${(triedCount / TOTAL_DIARY_FOODS) * 100}%` }}
          />
        </div>
      </div>

      {CATEGORY_ORDER.map((category) => (
        <div key={category}>
          <h2 className="mb-2 font-heading text-lg font-bold text-brown-800">
            {FOOD_CATEGORY_LABEL[category]}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {DIARY_FOODS.filter((f) => f.category === category).map((food) => {
              const entry = log[food.key];
              return (
                <button
                  key={food.key}
                  type="button"
                  onClick={() => setRegistering(food)}
                  disabled={loading}
                  className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center transition-colors ${
                    entry ? "bg-sage-100" : "bg-white/80 shadow-sm shadow-brown-900/5"
                  }`}
                >
                  <span className="text-2xl">{entry ? REACTION_EMOJI[entry.reaction] : food.emoji}</span>
                  <span className="text-sm font-semibold text-brown-800">{food.name}</span>
                  {!entry && <span className="text-xs text-sage-600">Registrar</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-brown-800">
          <Sparkles className="h-5 w-5 text-terracotta-600" strokeWidth={2} />
          Marcos alimentares
        </h2>

        {achievedMilestones.length > 0 && (
          <ol className="mb-4 flex flex-col gap-3 border-l-2 border-sage-200 pl-4">
            {achievedMilestones.map((m) => (
              <li key={m.key}>
                <p className="font-heading font-bold text-brown-800">{m.title}</p>
                <p className="text-sm text-brown-700/70">
                  {new Date(milestones[m.key] + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-col gap-2">
          {pendingMilestones.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => markMilestone(m.key)}
              className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-sage-200 px-4 text-left"
            >
              <div>
                <p className="font-semibold text-brown-800">{m.title}</p>
                <p className="text-xs text-brown-700/60">{m.description}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-sage-600">Marcar</span>
            </button>
          ))}
        </div>
      </div>

      {registering && (
        <RegisterFoodSheet
          food={registering}
          existing={log[registering.key]}
          onClose={() => setRegistering(null)}
          onSave={saveLogEntry}
        />
      )}
    </main>
  );
}

function RegisterFoodSheet({
  food,
  existing,
  onClose,
  onSave,
}: {
  food: DiaryFood;
  existing?: LogEntry;
  onClose: () => void;
  onSave: (food: DiaryFood, reaction: Reaction, photoFile: File | null) => Promise<void>;
}) {
  const [reaction, setReaction] = useState<Reaction>(existing?.reaction ?? "gostou");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-brown-900/30" onClick={onClose}>
      <div
        className="w-full animate-fade-in-up rounded-t-3xl bg-cream p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-brown-800">
            {food.emoji} {food.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50"
          >
            <X className="h-5 w-5 text-brown-700" strokeWidth={2} />
          </button>
        </div>

        <p className="mb-2 text-sm font-semibold text-brown-700">Como foi a reação?</p>
        <div className="mb-4 flex gap-2">
          {(Object.keys(REACTION_LABEL) as Reaction[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReaction(r)}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-sm font-semibold transition-colors ${
                reaction === r ? "bg-sage-500 text-white" : "bg-sage-50 text-brown-700"
              }`}
            >
              <span className="text-xl">{REACTION_EMOJI[r]}</span>
              {REACTION_LABEL[r]}
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm font-semibold text-brown-700">Foto (opcional)</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          className="mb-4 block w-full text-sm text-brown-700"
        />

        <Button
          onClick={async () => {
            setSaving(true);
            await onSave(food, reaction, photoFile);
            setSaving(false);
          }}
          disabled={saving}
          className="flex items-center justify-center gap-2"
        >
          <Check className="h-5 w-5" strokeWidth={2} />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
