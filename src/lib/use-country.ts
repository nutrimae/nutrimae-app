"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Country } from "@/lib/i18n/country";

const STORAGE_KEY = "nutrimae:country";

export function useCountry() {
  const [country, setCountryState] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try sessionStorage first for instant load
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      setCountryState(cached as Country);
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
        .select("country")
        .eq("user_id", user.id)
        .maybeSingle();

      const c = (data?.country as Country) ?? null;
      setCountryState(c);
      if (c) {
        sessionStorage.setItem(STORAGE_KEY, c);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    });
  }, []);

  const setCountry = useCallback(async (c: Country) => {
    setCountryState(c);
    sessionStorage.setItem(STORAGE_KEY, c);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // "profiles" não tem policy de update pro client — ver
    // src/app/api/profile/country/route.ts para o porquê.
    await fetch("/api/profile/country", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: c }),
    });
  }, []);

  return { country, setCountry, loading } as const;
}
