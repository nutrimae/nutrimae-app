"use client";

import { useEffect, useState } from "react";

/**
 * Contagem regressiva real (baseada no `expiresAt` que a Pagar.me devolve
 * pro Pix) — usada nas telas de checkout que mostram QR Code, pra dar
 * urgência honesta sem inventar prazo nenhum.
 */
export function PixCountdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <p className="text-sm font-semibold text-primary-600">
      Expira em {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </p>
  );
}
