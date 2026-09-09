import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locale";

/** Lê o locale do usuário autenticado a partir do Supabase, para uso em Server Components. */
export async function getServerLocale(): Promise<Locale> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_LOCALE;

  const { data } = await supabase.from("profiles").select("locale").eq("user_id", user.id).maybeSingle();
  return isLocale(data?.locale) ? data.locale : DEFAULT_LOCALE;
}
