"use client";

import { useEffect } from "react";
import { event } from "@/lib/fpixel";

/**
 * Dispara o Purchase do Pixel (navegador) nesta página — a única tela onde
 * o pagamento já foi confirmado pelo servidor (ver obrigado/page.tsx). Usa
 * o mesmo `eventId` do evento de Purchase enviado via Conversions API no
 * webhook do Pagar.me (ver meta-conversion.js) para o Meta deduplicar os
 * dois lados automaticamente, em vez de contar a compra duas vezes.
 *
 * Guarda em sessionStorage por eventId: evitar reenvio se a pessoa atualizar
 * a página ou voltar pra ela (F5, botão voltar do navegador).
 */
export function PurchasePixel({ eventId, valueCents }: { eventId: string; valueCents: number }) {
  useEffect(() => {
    const storageKey = `nutrimae:purchase-pixel:${eventId}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // sessionStorage indisponível — dispara mesmo assim, sem controle de duplicidade.
    }
    event("Purchase", { value: valueCents / 100, currency: "BRL" }, eventId);
  }, [eventId, valueCents]);

  return null;
}
