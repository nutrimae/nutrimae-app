import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPurchasedAppAccess } from "@/lib/entitlements";

export default async function RootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!(await hasPurchasedAppAccess(supabase, user.id))) {
    redirect("/acesso-pendente");
  }

  const { count } = await supabase
    .from("babies")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!count) {
    redirect("/onboarding/welcome");
  }

  redirect("/app");
}
