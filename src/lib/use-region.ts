"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Region } from "@/lib/regions";

const STORAGE_KEY = "nutrimae:region";

export function useRegion() {
  const [region, setRegionState] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try sessionStorage first for instant load
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      setRegionState(cached as Region);
      setLoading(false);
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("region")
        .eq("user_id", user.id)
        .maybeSingle();

      const r = (data?.region as Region) ?? null;
      setRegionState(r);
      if (r) {
        sessionStorage.setItem(STORAGE_KEY, r);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    });
  }, []);

  const setRegion = useCallback(async (r: Region | null) => {
    setRegionState(r);
    if (r) {
      sessionStorage.setItem(STORAGE_KEY, r);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ region: r }).eq("user_id", user.id);
  }, []);

  return { region, setRegion, loading } as const;
}
