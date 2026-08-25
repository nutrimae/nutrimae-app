"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const SESSION_KEY = "nutrimae:splash-shown";
// A marca aparece sem bloquear a mãe: a abertura inteira dura menos de 1s.
const HOLD_MS = 520;
const FADE_MS = 180;

const SKIP_SPLASH_PREFIXES = ["/oferta"];

export function SplashScreen() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("hidden");
  const skip = SKIP_SPLASH_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (skip) return;
    if (phase === "hidden") {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      const revealFrame = window.requestAnimationFrame(() => {
        window.sessionStorage.setItem(SESSION_KEY, "1");
        setPhase("visible");
      });
      return () => window.cancelAnimationFrame(revealFrame);
    }
    if (phase === "visible") {
      const fadeTimer = setTimeout(() => setPhase("fading"), HOLD_MS);
      return () => clearTimeout(fadeTimer);
    }
    if (phase === "fading") {
      const hideTimer = setTimeout(() => setPhase("hidden"), FADE_MS);
      return () => clearTimeout(hideTimer);
    }
  }, [phase, skip]);

  if (skip || phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity ease-out"
      style={{
        background: "linear-gradient(180deg, #fff5f7 0%, #fdf9f3 40%, #f2f5ee 100%)",
        opacity: phase === "fading" ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="animate-splash-logo relative flex flex-col items-center">
        <div className="animate-splash-heartbeat relative">
          <Image
            src="/nutrimae-logo.png"
            alt="NutriMãe"
            width={280}
            height={280}
            priority
            className="h-52 w-52 object-contain drop-shadow-[0_16px_40px_rgba(255,107,157,0.3)]"
          />
        </div>
        <p className="animate-splash-text mt-2 text-sm font-medium tracking-wide text-brown-700/90">
          Alimentação segura, com carinho
        </p>
      </div>

      <div className="absolute bottom-20 h-1.5 w-36 overflow-hidden rounded-full bg-primary-100/60">
        <div className="animate-splash-shimmer h-full w-full rounded-full" />
      </div>
    </div>
  );
}
