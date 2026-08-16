"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SESSION_KEY = "nutrimae:splash-shown";
const HOLD_MS = 1400;
const FADE_MS = 450;

export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("hidden");

  // Cada branch só arma o timer da fase atual — evita o bug clássico do
  // Strict Mode (dev) que roda o efeito de montagem duas vezes e cancelava
  // o timer de uma das execuções, deixando a splash presa na tela.
  useEffect(() => {
    if (phase === "hidden") {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setPhase("visible");
      return;
    }
    if (phase === "visible") {
      const fadeTimer = setTimeout(() => setPhase("fading"), HOLD_MS);
      return () => clearTimeout(fadeTimer);
    }
    if (phase === "fading") {
      const hideTimer = setTimeout(() => setPhase("hidden"), FADE_MS);
      return () => clearTimeout(hideTimer);
    }
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-primary-100 via-cream to-cream transition-opacity ease-out"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      <div className="animate-splash-logo flex flex-col items-center">
        <Image
          src="/nutrimae-logo.png"
          alt="NutriMäe"
          width={220}
          height={220}
          priority
          className="animate-splash-heartbeat h-40 w-40 object-contain drop-shadow-[0_12px_24px_rgba(255,107,157,0.25)]"
        />
        <p className="mt-4 type-small text-brown-700/80">
          Apoio calmo para a introdução alimentar do seu bebê
        </p>
      </div>

      <div className="absolute bottom-16 h-1 w-32 overflow-hidden rounded-full bg-primary-100">
        <div className="animate-splash-shimmer h-full w-full rounded-full" />
      </div>
    </div>
  );
}
