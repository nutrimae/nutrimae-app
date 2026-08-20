import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPurchasedAppAccess } from "@/lib/entitlements";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!(await hasPurchasedAppAccess(supabase, user.id))) redirect("/acesso-pendente");

  return children;
}
