import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductKey } from "@/lib/products";

export type EntitlementStatus = "active" | "cancelled" | "late" | "none";

export const APP_ACCESS_PRODUCT: ProductKey = "nutrimae_assinatura";

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

/**
 * Libera o núcleo privado somente para quem comprou a assinatura principal.
 * Administradores continuam com acesso para suporte e revisão do produto.
 * Em qualquer falha de consulta, o comportamento é fail-closed: acesso negado.
 */
export async function hasPurchasedAppAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<boolean> {
  const [profileResult, purchaseResult] = await Promise.all([
    supabase.from("profiles").select("is_admin").eq("user_id", userId).maybeSingle(),
    supabase
      .from("user_products")
      .select("status")
      .eq("user_id", userId)
      .eq("product_id", APP_ACCESS_PRODUCT)
      .maybeSingle(),
  ]);

  if (profileResult.error || purchaseResult.error) return false;
  return Boolean(profileResult.data?.is_admin) || purchaseResult.data?.status === "active";
}
