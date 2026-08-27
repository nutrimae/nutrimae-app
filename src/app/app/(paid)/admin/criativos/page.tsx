import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { CreativeLab } from "./creative-lab";

export default async function CriativosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!await isCurrentUserAdmin(supabase, user.id)) redirect("/app");
  return <CreativeLab />;
}
