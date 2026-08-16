"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Baby } from "@/lib/types";

const STORAGE_KEY = "nutrimae_active_baby_id";

interface ActiveBabyContextValue {
  babies: Baby[];
  activeBaby: Baby | null;
  setActiveBabyId: (id: string) => void;
}

const ActiveBabyContext = createContext<ActiveBabyContextValue | null>(null);

export function ActiveBabyProvider({
  babies,
  children,
}: {
  babies: Baby[];
  children: React.ReactNode;
}) {
  const [activeBabyId, setActiveBabyIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const valid = babies.find((b) => b.id === stored);
    setActiveBabyIdState(valid ? valid.id : (babies[0]?.id ?? null));
  }, [babies]);

  function setActiveBabyId(id: string) {
    setActiveBabyIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  const activeBaby = useMemo(
    () => babies.find((b) => b.id === activeBabyId) ?? babies[0] ?? null,
    [babies, activeBabyId],
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-baby-theme", activeBaby?.gender ?? "female");
  }, [activeBaby]);

  return (
    <ActiveBabyContext.Provider value={{ babies, activeBaby, setActiveBabyId }}>
      {children}
    </ActiveBabyContext.Provider>
  );
}

export function useActiveBaby() {
  const ctx = useContext(ActiveBabyContext);
  if (!ctx) throw new Error("useActiveBaby deve ser usado dentro de ActiveBabyProvider");
  return ctx;
}
