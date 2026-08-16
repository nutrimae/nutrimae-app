import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductKey } from "@/lib/products";

export type EntitlementStatus = "active" | "cancelled" | "late" | "none";

/**
 * Lê a permissão de um produto a partir da tabela "user_products" (já
 * existente no projeto — ver nota em supabase/schema.sql). RLS garante que
 * só a própria usuária consegue ler sua linha.
 */
export async function getEntitlementStatus(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  productKey: ProductKey,
): Promise<EntitlementStatus> {
  const { data } = await supabase
    .from("user_products")
    .select("status")
    .eq("user_id", userId)
    .eq("product_id", productKey)
    .maybeSingle();

  return (data?.status as EntitlementStatus) ?? "none";
}
