// Wrapper de rastreamento client-side (Meta Pixel via fbq).
//
// Server-side (CAPI) fica como pendência intencional: exige token de acesso
// do Meta + confirmação de compra via webhook (hoje src/app/api/webhooks/
// pagarme/route.ts). Quando essas credenciais forem configuradas, adicione
// o disparo de Purchase/InitiateCheckout ali, dentro do handler do webhook,
// para não depender só do client-side (que se perde com bloqueadores de
// rastreamento, Safari ITP, etc.).

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

import { track } from "@/lib/tracking/client";

const INTERNAL_EVENT_MAP = {
  AgeSelected: "age_selected",
  VideoPlay: "vsl_started",
  HeroCtaClick: "cta_clicked",
  AssistantFinish: "cta_clicked",
  AssistantAnswer: "quiz_answered",
  AssistantComplete: "quiz_completed",
  InitiateCheckout: "cta_clicked",
  ViewContent: "landing_viewed",
} as const;

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, params ?? {});
  }
  const internalName = INTERNAL_EVENT_MAP[eventName as keyof typeof INTERNAL_EVENT_MAP];
  if (internalName) {
    const safeParams: Record<string, string | number | boolean | null | string[]> = {};
    for (const [key, value] of Object.entries(params ?? {})) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null || (Array.isArray(value) && value.every((item) => typeof item === "string"))) safeParams[key] = value as string | number | boolean | null | string[];
    }
    if (eventName === "HeroCtaClick") safeParams.cta_id = "hero_phase";
    if (eventName === "InitiateCheckout") safeParams.cta_id = "offer_checkout";
    track(internalName, safeParams);
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[track]", eventName, params ?? {});
  }
}
