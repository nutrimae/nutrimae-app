import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export interface CheckoutTrackingInput {
  visitorId?: unknown;
  sessionId?: unknown;
}

export interface ResolvedCheckoutTracking {
  visitorId: string;
  sessionId: string;
  firstAttributionId: string | null;
  lastAttributionId: string | null;
  isInternal: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function resolveCheckoutTracking(admin: AdminClient, input: CheckoutTrackingInput | null | undefined): Promise<ResolvedCheckoutTracking | null> {
  const visitorId = typeof input?.visitorId === "string" && UUID.test(input.visitorId) ? input.visitorId : null;
  const sessionId = typeof input?.sessionId === "string" && UUID.test(input.sessionId) ? input.sessionId : null;
  if (!visitorId || !sessionId) return null;

  const { data: session } = await admin
    .from("analytics_sessions")
    .select("id, visitor_id, attribution_id, is_internal, analytics_visitors(first_attribution_id)")
    .eq("id", sessionId)
    .eq("visitor_id", visitorId)
    .maybeSingle();
  if (!session) return null;
  const visitor = session.analytics_visitors as unknown as { first_attribution_id?: string | null } | null;
  return {
    visitorId,
    sessionId,
    firstAttributionId: visitor?.first_attribution_id ?? null,
    lastAttributionId: session.attribution_id ?? null,
    isInternal: Boolean(session.is_internal),
  };
}
