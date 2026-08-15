import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActiveBabyProvider } from "@/components/active-baby-context";
import { BabySwitcher } from "@/components/baby-switcher";
import type { Baby } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: babies } = await supabase
    .from("babies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!babies || babies.length === 0) {
    redirect("/onboarding/welcome");
  }

  return (
    <ActiveBabyProvider babies={babies as Baby[]}>
      <div className="flex min-h-dvh flex-col bg-cream">
        <BabySwitcher />
        <div className="flex-1">{children}</div>
      </div>
    </ActiveBabyProvider>
  );
}
