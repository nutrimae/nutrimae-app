import type { SupabaseClient } from "@supabase/supabase-js";
import { ALLERGEN_LABEL, getAllergenLabel, type Allergen } from "@/lib/recipes";
import type { Locale } from "@/lib/i18n/locale";

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

// Versão em espanhol — mesma lista de alérgenos (padrão internacional, não
// específico da ANVISA), mas sem citar legislação brasileira.
export const ALLERGEN_CHECKLIST_ES: AllergenInfo[] = [
  { id: "leite", description: "Leche de vaca y derivados (queso, yogur, mantequilla)." },
  { id: "ovo", description: "Huevo de gallina y derivados." },
  { id: "gluten", description: "Trigo, centeno, cebada, avena y derivados." },
  { id: "amendoim", description: "Maní y productos que lo contengan, como mantequilla de maní." },
  { id: "castanhas", description: "Castaña de Pará, castaña de cajú (marañón), nueces, almendras, avellana, pistacho." },
  { id: "peixe", description: "Pescados de cualquier especie." },
  { id: "crustaceos", description: "Camarón, cangrejo, langosta y similares." },
  { id: "moluscos", description: "Mejillón, ostra, calamar, pulpo y similares." },
  { id: "soja", description: "Soya y derivados, como salsa de soya y tofu." },
  { id: "gergelim", description: "Semilla de sésamo y aceite de sésamo." },
  { id: "mostarda", description: "Mostaza y derivados." },
  { id: "aipo", description: "Apio y derivados." },
  { id: "sulfitos", description: "Sulfitos en concentración mayor a 10mg/kg (conservante común en frutas secas)." },
  { id: "tremoco", description: "Altramuz (lupino) y derivados (común en harinas alternativas)." },
];

export function getAllergenChecklistItems(locale: Locale = "es"): AllergenInfo[] {
  return locale === "pt-BR" ? ALLERGEN_CHECKLIST : ALLERGEN_CHECKLIST_ES;
}

export { ALLERGEN_LABEL, getAllergenLabel };

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
