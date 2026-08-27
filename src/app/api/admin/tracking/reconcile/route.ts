import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin";
import { computeTrackingMetrics } from "@/lib/admin/tracking-metrics";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin(supabase, user.id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const metrics = await computeTrackingMetrics(createAdminClient());
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    status: metrics.health.purchasesMissingEvent === 0 && metrics.health.outboxErrors === 0 ? "ok" : "attention",
    paidOrders: metrics.health.paidOrders,
    purchasesMissingEvent: metrics.health.purchasesMissingEvent,
    outboxPending: metrics.health.outboxPending,
    outboxErrors: metrics.health.outboxErrors,
    unattributedPurchases: metrics.health.unattributedPurchases,
  });
}
