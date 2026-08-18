// Wrapper de rastreamento client-side (Meta Pixel via fbq).
//
// Server-side (CAPI) fica como pendência intencional: exige token de acesso
// do Meta + confirmação de compra via webhook da Cartpanda (que já existe em
// src/app/api/webhooks/cartpanda/route.ts). Quando essas credenciais forem
// configuradas, adicione o disparo de Purchase/InitiateCheckout ali, dentro
// do handler do webhook, para não depender só do client-side (que se perde
// com bloqueadores de rastreamento, Safari ITP, etc.).

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, params ?? {});
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[track]", eventName, params ?? {});
  }
}
