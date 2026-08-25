import type { SupabaseClient } from "@supabase/supabase-js";
import { ALLERGEN_LABEL, type Allergen } from "@/lib/recipes";

export interface AllergenInfo {
  id: Allergen;
  description: string;
}

// Os 14 alérgenos de declaração obrigatória pela ANVISA (RDC 26/2015),
// adaptados ao contexto da introdução alimentar.
export const ALLERGEN_CHECKLIST: AllergenInfo[] = [
  { id: "leite", description: "Leite de vaca e derivados (queijo, iogurte, manteiga)." },
  { id: "ovo", description: "Ovo de galinha e derivados." },
  { id: "gluten", description: "Trigo, centeio, cevada, aveia e derivados." },
  { id: "amendoim", description: "Amendoim e produtos que o contenham, como pasta de amendoim." },
  { id: "castanhas", description: "Castanha-do-pará, castanha-de-caju, nozes, amêndoas, avelã, pistache." },
  { id: "peixe", description: "Peixes de qualquer espécie." },
  { id: "crustaceos", description: "Camarão, caranguejo, lagosta e afins." },
  { id: "moluscos", description: "Mexilhão, ostra, lula, polvo e afins." },
  { id: "soja", description: "Soja e derivados, como molho de soja e tofu." },
  { id: "gergelim", description: "Semente de gergelim e óleo de gergelim." },
  { id: "mostarda", description: "Mostarda e derivados." },
  { id: "aipo", description: "Aipo (salsão) e derivados." },
  { id: "sulfitos", description: "Sulfitos em concentração acima de 10mg/kg (conservante comum em frutas secas)." },
  { id: "tremoco", description: "Tremoço e derivados (comum em farinhas alternativas)." },
];

export { ALLERGEN_LABEL };

/**
 * Checklist de alergênicos por bebê, na tabela `baby_allergens` — não é
 * mais localStorage (o NutriBot, rodando no servidor via WhatsApp, precisa
 * ler esse dado, e localStorage é invisível fora do navegador da mãe).
 */
export async function getAllergenChecklist(supabase: SupabaseClient, babyId: string): Promise<Allergen[]> {
  const { data } = await supabase.from("baby_allergens").select("allergen").eq("baby_id", babyId);
  return (data ?? []).map((row) => row.allergen as Allergen);
}

export async function toggleAllergenChecklist(supabase: SupabaseClient, babyId: string, id: Allergen): Promise<Allergen[]> {
  const current = await getAllergenChecklist(supabase, babyId);
  if (current.includes(id)) {
    await supabase.from("baby_allergens").delete().eq("baby_id", babyId).eq("allergen", id);
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("baby_allergens").insert({ baby_id: babyId, user_id: user.id, allergen: id });
    }
  }
  return getAllergenChecklist(supabase, babyId);
}
