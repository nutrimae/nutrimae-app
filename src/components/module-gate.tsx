import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEntitlementStatus } from "@/lib/entitlements";
import { PRODUCTS, type ProductKey } from "@/lib/products";
import { UpgradeScreen } from "@/components/upgrade-screen";

/**
 * Gate reutilizável para qualquer módulo pago individual (Diário do Bebê,
 * Rotina do Sono, Calculadora de Fraldas, Cardápio de Restrição). Admins
 * sempre passam, independentemente de assinatura.
 */
export async function ModuleGate({
  productKey,
  children,
}: {
  productKey: ProductKey;
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.is_admin) {
    return <>{children}</>;
  }

  const status = await getEntitlementStatus(supabase, user.id, productKey);

  if (status !== "active") {
    // Se existir uma offer ativa de pagamento único pra este produto (ver
    // supabase/schema.sql seção "offers"), linka pro checkout de verdade em
    // vez do estado morto "assinatura em breve".
    const { data: offer } = await supabase
      .from("offers")
      .select("slug")
      .eq("product_key", productKey)
      .eq("billing_type", "one_time")
      .eq("active", true)
      .maybeSingle();

    return <UpgradeScreen product={PRODUCTS[productKey]} checkoutHref={offer ? `/checkout/${offer.slug}` : undefined} />;
  }

  return <>{children}</>;
}
