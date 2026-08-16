"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { useActiveBaby } from "@/components/active-baby-context";
import { createClient } from "@/lib/supabase/client";
import { ageInMonths } from "@/lib/age";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { ageBandForMonths, allergenForDietFilter, buildShoppingList, type DietFilter } from "@/lib/menu";

export default function ListaComprasPage() {
  const { activeBaby } = useActiveBaby();
  const supabase = useMemo(() => createClient(), []);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [hasRestricao, setHasRestricao] = useState(false);

  const months = activeBaby ? ageInMonths(activeBaby.birth_date) : 0;
  const ageBand = useMemo(() => ageBandForMonths(months), [months]);
  const dietFilter = (activeBaby?.diet_filter as DietFilter) ?? "padrao";
  const avoidAllergen = hasRestricao ? allergenForDietFilter(dietFilter) : null;
  const groups = useMemo(
    () => buildShoppingList(ageBand, { avoidAllergen }),
    [ageBand, avoidAllergen],
  );

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const checkedCount = checked.size;

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

  function handleShareWhatsApp() {
    if (!activeBaby) return;
    const lines = [`🛒 Lista de compras de ${activeBaby.name}`, ""];
    for (const group of groups) {
      lines.push(`*${group.label}*`);
      for (const item of group.items) {
        lines.push(`${checked.has(item.key) ? "✅" : "▫️"} ${item.name}`);
      }
      lines.push("");
    }
    lines.push("Gerada em NutriMäe 💚");
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

      {groups.map((group) => (
        <div key={group.category}>
          <h2 className="mb-2 font-heading text-base font-bold text-sage-700">
            {group.label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => {
              const isChecked = checked.has(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleItem(item.key)}
                  disabled={loading}
                  className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/80 px-4 text-left shadow-sm shadow-brown-900/5 disabled:opacity-60"
                >
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
              );
            })}
          </div>
        </div>
      ))}

      <MedicalDisclaimerFooter />
    </main>
  );
}
