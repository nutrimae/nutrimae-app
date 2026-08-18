"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MessageCircle, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { useToast } from "@/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { ageInMonths } from "@/lib/age";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { ageBandForMonths, allergenForDietFilter, buildShoppingList, type DietFilter } from "@/lib/menu";

type ExtraCategory = "feira" | "mercado" | "outros";

interface ExtraItem {
  key: string;
  name: string;
  category: ExtraCategory;
}

const CATEGORY_OPTIONS: { key: ExtraCategory; label: string; emoji: string }[] = [
  { key: "feira", label: "Feira", emoji: "🥬" },
  { key: "mercado", label: "Supermercado", emoji: "🛒" },
  { key: "outros", label: "Outros", emoji: "✨" },
];

const QUICK_SUGGESTIONS = ["Fraldas", "Lenços umedecidos", "Guardanapos", "Azeite"];

export default function ListaComprasPage() {
  const { activeBaby } = useActiveBaby();
  const { showToast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [hasRestricao, setHasRestricao] = useState(false);
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<ExtraCategory>("outros");

  const months = activeBaby ? ageInMonths(activeBaby.birth_date) : 0;
  const ageBand = useMemo(() => ageBandForMonths(months), [months]);
  const dietFilter = (activeBaby?.diet_filter as DietFilter) ?? "padrao";
  const avoidAllergen = hasRestricao ? allergenForDietFilter(dietFilter) : null;
  const groups = useMemo(
    () => buildShoppingList(ageBand, { avoidAllergen }),
    [ageBand, avoidAllergen],
  );

  const displayGroups = useMemo(() => {
    const labels: Record<ExtraCategory, string> = { feira: "Feira", mercado: "Supermercado", outros: "Outros" };
    const result = groups.map((group) => ({ ...group, items: [...group.items] }));
    for (const extra of extras) {
      let group = result.find((item) => item.category === extra.category);
      if (!group) {
        group = { category: extra.category, label: labels[extra.category], items: [] };
        result.push(group);
      }
      group.items.push(extra);
    }
    return result;
  }, [extras, groups]);

  const visibleKeys = useMemo(() => new Set(displayGroups.flatMap((group) => group.items.map((item) => item.key))), [displayGroups]);
  const totalItems = visibleKeys.size;
  const checkedCount = [...checked].filter((key) => visibleKeys.has(key)).length;

  useEffect(() => {
    if (!activeBaby) return;
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(`nutrimae:shopping-extras:${activeBaby.id}`);
        setExtras(saved ? JSON.parse(saved) : []);
      } catch {
        setExtras([]);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeBaby]);

  useEffect(() => {
    if (!activeBaby) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const [checksRes, productsRes] = await Promise.all([
        supabase
          .from("shopping_list_checks")
          .select("item_key, checked")
          .eq("baby_id", activeBaby!.id),
        supabase
          .from("user_products")
          .select("status")
          .eq("user_id", user.id)
          .eq("product_id", "restricao_alimentar")
          .maybeSingle(),
      ]);

      if (!cancelled) {
        const initial = new Set<string>(
          (checksRes.data ?? []).filter((row) => row.checked).map((row) => row.item_key as string),
        );
        setChecked(initial);
        setHasRestricao(productsRes.data?.status === "active");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeBaby, supabase]);

  async function toggleItem(key: string) {
    if (!activeBaby) return;

    const isChecked = checked.has(key);
    const next = new Set(checked);
    if (isChecked) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setChecked(next);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("shopping_list_checks").upsert(
      {
        user_id: user.id,
        baby_id: activeBaby.id,
        item_key: key,
        checked: !isChecked,
      },
      { onConflict: "user_id,baby_id,item_key" },
    );
  }

  function addExtraItem() {
    const name = newItemName.trim();
    if (!name) return;
    const extra: ExtraItem = {
      key: `extra-${Date.now()}-${name.toLocaleLowerCase("pt-BR").replace(/\s+/g, "-")}`,
      name,
      category: newItemCategory,
    };
    setExtras((current) => {
      const next = [...current, extra];
      if (activeBaby) window.localStorage.setItem(`nutrimae:shopping-extras:${activeBaby.id}`, JSON.stringify(next));
      return next;
    });
    setNewItemName("");
    setNewItemCategory("outros");
    setShowAddItem(false);
    showToast(`✓ ${name} entrou na lista!`);
  }

  async function removeExtraItem(key: string) {
    setExtras((current) => {
      const next = current.filter((item) => item.key !== key);
      if (activeBaby) window.localStorage.setItem(`nutrimae:shopping-extras:${activeBaby.id}`, JSON.stringify(next));
      return next;
    });
    setChecked((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    if (activeBaby) {
      await supabase.from("shopping_list_checks").delete().eq("baby_id", activeBaby.id).eq("item_key", key);
    }
  }

  function handleShareWhatsApp() {
    if (!activeBaby) return;
    const lines = [`🛒 Lista de compras de ${activeBaby.name}`, ""];
    for (const group of displayGroups) {
      lines.push(`*${group.label}*`);
      for (const item of group.items) {
        lines.push(`${checked.has(item.key) ? "✅" : "▫️"} ${item.name}`);
      }
      lines.push("");
    }
    lines.push("Gerada em NutriMãe 💚");
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  if (!activeBaby) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8 text-center text-brown-700">
        <p>Carregando a lista...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Lista de compras</h1>
        <p className="mt-1 text-sm text-brown-700/70">
          Gerada a partir do cardápio da semana de {activeBaby.name}.
          {!loading && totalItems > 0 && ` ${checkedCount} de ${totalItems} já pegos.`}
        </p>
      </div>

      <button
        type="button"
        onClick={handleShareWhatsApp}
        disabled={loading || totalItems === 0}
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary-500 text-sm font-semibold text-white disabled:opacity-50"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2} />
        Compartilhar por WhatsApp
      </button>

      <button
        type="button"
        onClick={() => setShowAddItem(true)}
        className="group flex min-h-14 items-center justify-between rounded-2xl border-2 border-dashed border-primary-300/60 bg-primary-50/60 px-4 text-left transition-all active:scale-[0.985] active:bg-primary-100"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-[0_5px_14px_var(--color-primary-glow)]">
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span>
            <strong className="block text-sm text-brown-800">Faltou alguma coisinha?</strong>
            <span className="text-xs text-brown-700/55">Adicione à lista em poucos segundos</span>
          </span>
        </span>
        <Sparkles className="h-5 w-5 text-primary-400" />
      </button>

      {displayGroups.map((group) => (
        <div key={group.category}>
          <h2 className="mb-2 font-heading text-base font-bold text-sage-700">
            {group.label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => {
              const isChecked = checked.has(item.key);
              return (
                <div key={item.key} className="flex min-h-14 items-center rounded-2xl bg-white/80 pr-2 shadow-sm shadow-brown-900/5">
                <button type="button" onClick={() => toggleItem(item.key)} disabled={loading} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 text-left disabled:opacity-60">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isChecked
                        ? "border-sage-500 bg-sage-500"
                        : "border-sage-200 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                  </span>
                  <span
                    className={`text-lg transition-[color,opacity] duration-200 ${
                      isChecked ? "text-brown-700/40 line-through" : "text-brown-800"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
                {item.key.startsWith("extra-") && (
                  <button type="button" onClick={() => removeExtraItem(item.key)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brown-700/35 active:bg-red-50 active:text-red-500" aria-label={`Remover ${item.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <MedicalDisclaimerFooter />

      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-end bg-brown-900/35 backdrop-blur-[2px]" onClick={() => setShowAddItem(false)}>
          <section className="w-full animate-fade-in-up rounded-t-[28px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-strong" onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="extra-item-title">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="extra-item-title" className="text-xl font-bold text-brown-800">O que ficou faltando?</h2>
                <p className="mt-1 text-sm text-brown-700/55">Pode ser da feira, do mercado ou algo só seu.</p>
              </div>
              <button type="button" onClick={() => setShowAddItem(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-brown-700/60" aria-label="Fechar"><X className="h-5 w-5" /></button>
            </div>

            <label htmlFor="extra-item-name" className="mt-5 block text-xs font-semibold uppercase tracking-wide text-brown-700/55">Nome do item</label>
            <input id="extra-item-name" autoFocus value={newItemName} onChange={(event) => setNewItemName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addExtraItem(); }} placeholder="Ex.: sabonete do bebê" className="mt-2 min-h-14 w-full rounded-2xl border border-primary-100 bg-primary-50/40 px-4 text-base text-brown-800 outline-none transition-shadow placeholder:text-brown-700/35 focus:border-primary-500 focus:shadow-[0_0_0_4px_var(--color-primary-glow)]" />

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => setNewItemName(suggestion)} className="min-h-9 rounded-full bg-gray-50 px-3 text-xs font-medium text-brown-700 active:bg-primary-50 active:text-primary-600">+ {suggestion}</button>)}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brown-700/55">Onde encontrar?</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((category) => <button key={category.key} type="button" onClick={() => setNewItemCategory(category.key)} className={`min-h-14 rounded-2xl border px-2 text-xs font-semibold transition-colors ${newItemCategory === category.key ? "border-primary-500 bg-primary-50 text-primary-600" : "border-gray-100 text-brown-700/60"}`}><span className="mr-1" aria-hidden="true">{category.emoji}</span>{category.label}</button>)}
            </div>

            <button type="button" onClick={addExtraItem} disabled={!newItemName.trim()} className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-[#ff2974] text-base font-bold text-white shadow-[0_8px_20px_var(--color-primary-glow)] disabled:opacity-40"><Plus className="h-5 w-5" />Adicionar à minha lista</button>
          </section>
        </div>
      )}
    </main>
  );
}
