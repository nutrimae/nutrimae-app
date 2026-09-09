"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locale";

const STORAGE_KEY = "nutrimae:locale";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (isLocale(cached)) {
      setLocaleState(cached);
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
        .select("locale")
        .eq("user_id", user.id)
        .maybeSingle();

      const l = isLocale(data?.locale) ? data.locale : DEFAULT_LOCALE;
      setLocaleState(l);
      sessionStorage.setItem(STORAGE_KEY, l);
      setLoading(false);
    });
  }, []);

  const setLocale = useCallback(async (l: Locale) => {
    setLocaleState(l);
    sessionStorage.setItem(STORAGE_KEY, l);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ locale: l }).eq("user_id", user.id);
  }, []);

  return { locale, setLocale, loading } as const;
}
