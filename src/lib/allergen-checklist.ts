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

const CHECKLIST_KEY = "nutrimae:alergia:checklist";

export function getAllergenChecklist(): Allergen[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHECKLIST_KEY);
    return raw ? (JSON.parse(raw) as Allergen[]) : [];
  } catch {
    return [];
  }
}

export function toggleAllergenChecklist(id: Allergen): Allergen[] {
  const current = getAllergenChecklist();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
  return next;
}
