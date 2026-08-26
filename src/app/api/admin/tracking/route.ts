import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";
import { computeTrackingMetrics } from "@/lib/admin/tracking-metrics";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin(supabase, user.id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    return NextResponse.json({ metrics: await computeTrackingMetrics(createAdminClient()), computedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[admin/tracking] métricas indisponíveis", error);
    return NextResponse.json({ error: "tracking_unavailable" }, { status: 503 });
  }
}
