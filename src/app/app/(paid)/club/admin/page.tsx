import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { AdminPanel } from "./admin-panel";

export default async function ClubAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = await isCurrentUserAdmin(supabase, user.id);
  if (!isAdmin) redirect("/app/club");

  return <AdminPanel />;
}
