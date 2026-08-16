import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { AdminTicketList } from "./admin-ticket-list";

export default async function SupportAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = await isCurrentUserAdmin(supabase, user.id);
  if (!isAdmin) redirect("/app/suporte");

  return <AdminTicketList />;
}
