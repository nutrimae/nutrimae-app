import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActiveBabyProvider } from "@/components/active-baby-context";
import { BabySwitcher } from "@/components/baby-switcher";
import { BottomNav } from "@/components/bottom-nav";
import { SosButton } from "@/components/sos-button";
import { ToastProvider } from "@/components/toast-provider";
import { withSignedPhotoUrls } from "@/lib/baby-photos";
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

  const babiesWithPhotos = await withSignedPhotoUrls(supabase, babies as Baby[]);

  return (
    <ActiveBabyProvider babies={babiesWithPhotos}>
      <ToastProvider>
        <div className="flex min-h-dvh flex-col bg-[#faf7f2]">
          <BabySwitcher />
          <div className="flex-1 pb-4">{children}</div>
          <BottomNav />
          <SosButton />
        </div>
      </ToastProvider>
    </ActiveBabyProvider>
  );
}
