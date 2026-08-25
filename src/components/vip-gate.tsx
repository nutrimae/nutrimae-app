import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEntitlementStatus } from "@/lib/entitlements";
import { VipUpgradeScreen } from "@/components/vip-upgrade-screen";

/**
 * Gate da Área VIP: libera o acesso quando a usuária tem PELO MENOS UM dos
 * três módulos ativos (SOS Desmame Noturno, Protocolo Intestino Livre ou
 * Batch Cooking & Congelamento). Cada sub-tela ainda usa o ModuleGate
 * normal para o produto específico — este gate só controla a entrada no
 * hub central /app/vip.
 */
export async function VipGate({ children }: { children: React.ReactNode }) {
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

  const [weaningStatus, intestinoStatus, batchCookingStatus] = await Promise.all([
    getEntitlementStatus(supabase, user.id, "sos_desmame_noturno"),
    getEntitlementStatus(supabase, user.id, "protocolo_intestino_livre"),
    getEntitlementStatus(supabase, user.id, "batch_cooking"),
  ]);

  if (weaningStatus !== "active" && intestinoStatus !== "active" && batchCookingStatus !== "active") {
    return <VipUpgradeScreen />;
  }

  return <>{children}</>;
}
