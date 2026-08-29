"use client";

import Script from "next/script";
import { useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Widget do Cloudflare Turnstile (proteção contra bot no checkout — item 12
 * do checklist de segurança). Não renderiza nada enquanto
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY não estiver configurada, pra não quebrar o
 * checkout antes de existir uma conta Cloudflare criada. Ver verificação
 * correspondente em src/lib/checkout/turnstile.ts.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const rawId = useId();
  const containerId = `turnstile-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const rendered = useRef(false);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={() => {
          if (rendered.current) return;
          rendered.current = true;
          window.turnstile?.render(`#${containerId}`, {
            sitekey: SITE_KEY,
            callback: (token: string) => onToken(token),
            "expired-callback": () => onToken(null),
            "error-callback": () => onToken(null),
          });
        }}
      />
      <div id={containerId} className="flex justify-center" />
    </>
  );
}
