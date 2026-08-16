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
    return <UpgradeScreen product={PRODUCTS[productKey]} />;
  }

  return <>{children}</>;
}
