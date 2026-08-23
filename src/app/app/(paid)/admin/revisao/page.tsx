import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { ReviewPanel } from "./review-panel";

export default async function RevisaoAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = await isCurrentUserAdmin(supabase, user.id);
  if (!admin) redirect("/app/cardapio");

  return <ReviewPanel />;
}
