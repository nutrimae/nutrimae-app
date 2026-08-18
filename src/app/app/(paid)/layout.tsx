import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEntitlementStatus } from "@/lib/entitlements";
import { PRODUCTS } from "@/lib/products";
import { UpgradeScreen } from "@/components/upgrade-screen";

// Cardápio, Cortes Seguros, Lista de Compras, Guia de Alergia, Club das
// Mães e Suporte são todos liberados pela mesma assinatura — um único gate
// cobre o grupo inteiro. Admins passam sempre, mesmo sem assinatura.
// O Manual S.O.S. NÃO fica neste grupo — é gratuito e público em /sos.
export default async function PaidLayout({ children }: { children: React.ReactNode }) {
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

  const status = await getEntitlementStatus(supabase, user.id, "nutrimae_assinatura");

  if (status !== "active") {
    return <UpgradeScreen product={PRODUCTS.nutrimae_assinatura} />;
  }

  return <>{children}</>;
}
