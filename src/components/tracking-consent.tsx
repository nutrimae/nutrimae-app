"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { FacebookPixel } from "@/components/FacebookPixel";
import { getTrackingConsent, setTrackingConsent, track, type TrackingConsent } from "@/lib/tracking/client";
import { useLocale } from "@/lib/use-locale";

export function TrackingConsentManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<TrackingConsent>("unknown");
  const { locale } = useLocale();
  const es = locale === "es";

  useEffect(() => {
    const current = getTrackingConsent();
    // A landing (nutrimae.app) e o checkout (app.nutrimae.app) são origens
    // diferentes — localStorage não atravessa esse limite. Sem isto, quem já
    // decidiu na landing via um ?consent= repassado pelo redirecionamento
    // (ver goToCheckout em landing-nutrimae/script.js) reviria o banner do
    // zero aqui, e boa parte simplesmente ignora e segue pro formulário sem
    // clicar — perdendo toda sessão/atribuição no lado do checkout.
    const forwarded = current === "unknown" ? searchParams.get("consent") : null;
    if (forwarded === "denied" || forwarded === "analytics" || forwarded === "marketing") {
      setTrackingConsent(forwarded);
      setConsent(forwarded);
    } else {
      setConsent(current);
    }
    const listener = (event: Event) => setConsent((event as CustomEvent<TrackingConsent>).detail);
    window.addEventListener("nutrimae:tracking-consent", listener);
    return () => window.removeEventListener("nutrimae:tracking-consent", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (consent !== "analytics" && consent !== "marketing") return;
    track("page_viewed", { page_type: pathname === "/oferta" ? "landing" : pathname.startsWith("/checkout") ? "checkout" : "other", path: `${pathname}?${searchParams}` });
  }, [consent, pathname, searchParams]);

  function choose(value: "denied" | "analytics" | "marketing") {
    setTrackingConsent(value);
    setConsent(value);
  }

  return (
    <>
      {consent === "marketing" ? <FacebookPixel /> : null}
      {consent === "unknown" ? (
        <aside className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-lg rounded-3xl border border-sage-100 bg-white/95 p-4 shadow-strong backdrop-blur-xl" aria-label={es ? "Preferencias de privacidad" : "Preferências de privacidade"}>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-600"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold text-brown-900">{es ? "Tu privacidad es lo primero" : "Sua privacidade vem primeiro"}</p>
              <p className="mt-1 text-xs leading-relaxed text-brown-700/80">
                {es
                  ? "Podemos usar datos anónimos de navegación para entender qué funciona y, si lo permites, medir anuncios. Nunca enviamos datos del bebé."
                  : "Podemos usar dados anônimos de navegação para entender o que funciona e, se você permitir, medir anúncios. Nunca enviamos dados do bebê."}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => choose("marketing")} className="min-h-11 rounded-xl bg-primary-500 px-3 text-xs font-bold text-white">{es ? "Aceptar todo" : "Aceitar tudo"}</button>
            <button type="button" onClick={() => choose("analytics")} className="min-h-11 rounded-xl bg-sage-100 px-3 text-xs font-bold text-sage-700">{es ? "Solo análisis anónimo" : "Só análise anônima"}</button>
            <button type="button" onClick={() => choose("denied")} className="min-h-11 rounded-xl border border-sage-100 px-3 text-xs font-semibold text-brown-700">{es ? "Solo esencial" : "Somente essencial"}</button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
