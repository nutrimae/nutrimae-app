import type { SupabaseClient } from "@supabase/supabase-js";

/** Confere se o usuário autenticado é admin (lê a própria linha de profiles). */
export async function isCurrentUserAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data?.is_admin);
}
