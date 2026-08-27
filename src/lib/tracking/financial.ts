import { randomUUID } from "node:crypto";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function emitFinancialTrackingEvent(
  admin: AdminClient,
  input: {
    eventName: "purchase_confirmed" | "refund_confirmed" | "chargeback_confirmed" | "subscription_activated" | "subscription_canceled";
    aggregateId: string;
    orderId?: string;
    subscriptionId?: string;
    payload: Record<string, unknown>;
  },
) {
  const eventKey = `${input.eventName}:${input.aggregateId}`;
  try {
    const { data: outbox, error } = await admin.from("analytics_outbox").insert({
      event_key: eventKey,
      event_name: input.eventName,
      aggregate_id: input.aggregateId,
      payload: input.payload,
    }).select("id").single();
    if (error?.code === "23505") return;
    if (error || !outbox) throw error ?? new Error("outbox_insert_failed");

    const order = input.orderId
      ? (await admin.from("orders").select("visitor_id, session_id, last_attribution_id, user_id, metadata").eq("id", input.orderId).maybeSingle()).data
      : null;
    const subscription = input.subscriptionId
      ? (await admin.from("subscriptions").select("visitor_id, session_id, last_attribution_id, customers(user_id)").eq("id", input.subscriptionId).maybeSingle()).data
      : null;
    const customer = subscription?.customers as unknown as { user_id?: string | null } | null;
    let isInternal = Boolean((order?.metadata as { tracking_internal?: boolean } | null)?.tracking_internal);
    const visitorId = order?.visitor_id ?? subscription?.visitor_id ?? null;
    if (!isInternal && visitorId) {
      const { data: visitor } = await admin.from("analytics_visitors").select("is_internal").eq("id", visitorId).maybeSingle();
      isInternal = Boolean(visitor?.is_internal);
    }

    const { error: eventError } = await admin.from("analytics_events").insert({
      event_id: randomUUID(),
      event_name: input.eventName,
      event_version: 1,
      event_source: "webhook",
      visitor_id: visitorId,
      session_id: order?.session_id ?? subscription?.session_id ?? null,
      attribution_id: order?.last_attribution_id ?? subscription?.last_attribution_id ?? null,
      user_id: order?.user_id ?? customer?.user_id ?? null,
      order_id: input.orderId ?? null,
      subscription_id: input.subscriptionId ?? null,
      properties: input.payload,
      is_internal: isInternal,
      occurred_at: new Date().toISOString(),
    });
    if (eventError) throw eventError;
    await admin.from("analytics_outbox").update({ status: "processed", processed_at: new Date().toISOString(), attempts: 1 }).eq("id", outbox.id);
  } catch (error) {
    // Analytics nunca derruba o webhook financeiro.
    console.error("[tracking-financial] evento ficou pendente para reconciliação", eventKey, error);
    try {
      await admin.from("analytics_outbox").update({ status: "error", last_error: error instanceof Error ? error.message : String(error), attempts: 1 }).eq("event_key", eventKey);
    } catch { /* banco de tracking pode ainda não estar disponível */ }
  }
}
