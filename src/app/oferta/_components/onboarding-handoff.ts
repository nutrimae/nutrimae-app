// Passa a fase escolhida em /oferta para o onboarding do app (src/app/onboarding/baby/page.tsx),
// sem depender de query params (o fluxo de login não os propaga). sessionStorage
// sobrevive à navegação /oferta → /login → onboarding/welcome → onboarding/baby.
const STORAGE_KEY = "nutrimae:onboarding-months";

export function saveOnboardingMonths(months: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(months));
  } catch {
    // sessionStorage indisponível (modo privado restrito etc.) — sem problema,
    // o onboarding simplesmente não vem pré-preenchido.
  }
}

/** Lê e consome o valor salvo — chamar uma única vez, no onboarding. */
export function consumeOnboardingMonths(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(STORAGE_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}
