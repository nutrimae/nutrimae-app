import type { createAdminClient } from "@/lib/supabase/admin";
import { ageInMonths } from "@/lib/age";
import type { Allergen } from "@/lib/recipes";
import type { Region } from "@/lib/regions";

type AdminClient = ReturnType<typeof createAdminClient>;

export interface RecentFoodLogEntry {
  foodKey: string;
  reaction: "gostou" | "neutro" | "nao_gostou";
  triedAt: string;
}

export interface BabyContext {
  userId: string;
  babyId: string;
  babyName: string;
  ageMonths: number;
  region: Region | null;
  allergens: Allergen[];
  recentFoodLog: RecentFoodLogEntry[];
}

/** Só dígitos, sem "+" — mesmo formato salvo em profiles.phone_number. */
function onlyDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Resolve quem está do outro lado do WhatsApp: telefone -> conta (profiles)
 * -> bebê. Retorna null quando o telefone não está vinculado a nenhuma
 * conta (ex.: número ainda não usado numa compra) — nesse caso o NutriBot
 * segue pro fluxo genérico do Typebot, sem personalização.
 *
 * Usa o client admin (service role) de propósito: RLS de profiles/babies só
 * libera para o próprio usuário autenticado, e aqui não há sessão de
 * usuária — é o servidor do bot resolvendo por conta própria.
 */
export async function resolveBabyContext(admin: AdminClient, phone: string): Promise<BabyContext | null> {
  const digits = onlyDigits(phone);
  if (!digits) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("user_id, region")
    .eq("phone_number", digits)
    .maybeSingle();

  if (!profile) return null;

  const { data: babies } = await admin
    .from("babies")
    .select("id, name, birth_date")
    .eq("user_id", profile.user_id)
    .order("created_at", { ascending: true });

  // MVP: assume o primeiro bebê cadastrado. Famílias com mais de um bebê
  // recebem contexto do bebê mais antigo até existir um jeito de perguntar
  // "qual bebê?" pelo WhatsApp — limitação conhecida, não um bug silencioso.
  const baby = babies?.[0];
  if (!baby) return null;

  const [{ data: allergenRows }, { data: logRows }] = await Promise.all([
    admin.from("baby_allergens").select("allergen").eq("baby_id", baby.id),
    admin
      .from("food_log")
      .select("food_key, reaction, tried_at")
      .eq("baby_id", baby.id)
      .order("tried_at", { ascending: false })
      .limit(20),
  ]);

  return {
    userId: profile.user_id,
    babyId: baby.id,
    babyName: baby.name,
    ageMonths: ageInMonths(baby.birth_date),
    region: (profile.region as Region | null) ?? null,
    allergens: (allergenRows ?? []).map((r) => r.allergen as Allergen),
    recentFoodLog: (logRows ?? []).map((r) => ({
      foodKey: r.food_key as string,
      reaction: r.reaction as RecentFoodLogEntry["reaction"],
      triedAt: r.tried_at as string,
    })),
  };
}
