import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { MetricsDashboard } from "./metrics-dashboard";

export default async function MetricasAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = await isCurrentUserAdmin(supabase, user.id);
  if (!admin) redirect("/app/cardapio");

  return <MetricsDashboard />;
}
