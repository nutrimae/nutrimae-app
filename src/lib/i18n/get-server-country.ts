import { createClient } from "@/lib/supabase/server";
import { DEFAULT_COUNTRY, isCountry, type Country } from "@/lib/i18n/country";

/** Lê o país do usuário autenticado a partir do Supabase, para uso em Server Components. */
export async function getServerCountry(): Promise<Country> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_COUNTRY;

  const { data } = await supabase.from("profiles").select("country").eq("user_id", user.id).maybeSingle();
  return isCountry(data?.country) ? data.country : DEFAULT_COUNTRY;
}
