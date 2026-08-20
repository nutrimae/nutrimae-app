"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_AGE_KEY, getAgeOption, type AgeKey, type AgeOption } from "./data";

interface AgeContextValue {
  ageKey: AgeKey;
  ageOption: AgeOption;
  setAgeKey: (key: AgeKey) => void;
}

const AgeContext = createContext<AgeContextValue | null>(null);

/**
 * Estado compartilhado da fase escolhida — único client boundary que
 * precisa existir para isso. Seções puramente estáticas (Problem,
 * BeliefBreak etc.) continuam Server Components mesmo "dentro" deste
 * provider, contanto que sejam instanciadas no Server Component pai e
 * passadas aqui via children (ver oferta-content.tsx).
 */
export function AgeProvider({ children }: { children: ReactNode }) {
  const [ageKey, setAgeKey] = useState<AgeKey>(DEFAULT_AGE_KEY);
  const ageOption = getAgeOption(ageKey);

  return <AgeContext.Provider value={{ ageKey, ageOption, setAgeKey }}>{children}</AgeContext.Provider>;
}

export function useAge(): AgeContextValue {
  const ctx = useContext(AgeContext);
  if (!ctx) {
    throw new Error("useAge precisa ser usado dentro de <AgeProvider>");
  }
  return ctx;
}
