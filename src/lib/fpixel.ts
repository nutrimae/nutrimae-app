export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

/**
 * window.fbq pode não existir (script bloqueado por AdBlocker, pixel não
 * configurado em dev, etc.) — todas as chamadas abaixo checam antes de
 * disparar, pra nunca quebrar a página por causa de tracking.
 */
function callFbq(...args: Parameters<NonNullable<Window["fbq"]>>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(...args);
}

export const pageview = () => {
  callFbq("track", "PageView");
};

export const event = (name: string, options?: Record<string, unknown>) => {
  callFbq("track", name, options);
};
