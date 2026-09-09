"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LatamRegion } from "@/lib/latam-regions";

const STORAGE_KEY = "nutrimae:region";

export function useRegion() {
  const [region, setRegionState] = useState<LatamRegion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try sessionStorage first for instant load
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      setRegionState(cached as LatamRegion);
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
        .select("latam_region")
        .eq("user_id", user.id)
        .maybeSingle();

      const r = (data?.latam_region as LatamRegion) ?? null;
      setRegionState(r);
      if (r) {
        sessionStorage.setItem(STORAGE_KEY, r);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    });
  }, []);

  const setRegion = useCallback(async (r: LatamRegion | null) => {
    setRegionState(r);
    if (r) {
      sessionStorage.setItem(STORAGE_KEY, r);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // "profiles" não tem policy de update pro client — ver
    // src/app/api/profile/region/route.ts para o porquê.
    await fetch("/api/profile/region", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region: r }),
    });
  }, []);

  return { region, setRegion, loading } as const;
}
