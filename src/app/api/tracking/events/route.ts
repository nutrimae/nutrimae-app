import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { TrackingBatchSchema, hasForbiddenProperties, type TrackingEventPayload, type TrackingAttribution } from "@/lib/tracking/contracts";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 48_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request): string {
  return (request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "unknown").trim();
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function isTrustedInternalRequest(request: Request): boolean {
  const host = request.headers.get("host")?.split(":")[0];
  if (host === "localhost" || host === "127.0.0.1") return true;

  const expected = process.env.TRACKING_E2E_SECRET;
  const received = request.headers.get("x-nutrimae-tracking-e2e");
  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function attributionRow(event: TrackingEventPayload, touch: TrackingAttribution, type: "first" | "session") {
  return {
    visitor_id: event.visitorId,
    session_id: type === "session" ? event.sessionId : null,
    attribution_type: type,
    source: touch.source?.toLowerCase() ?? null,
    medium: touch.medium?.toLowerCase() ?? null,
    campaign: touch.campaign ?? null,
    campaign_id: touch.campaignId ?? null,
    content: touch.content ?? null,
    term: touch.term ?? null,
    creative_id: touch.creativeId ?? null,
    ad_id: touch.adId ?? null,
    adset_id: touch.adsetId ?? null,
    fbclid: touch.fbclid ?? null,
    gclid: touch.gclid ?? null,
    ttclid: touch.ttclid ?? null,
    landing_path: touch.landingPath ?? null,
    referrer: touch.referrer ?? null,
    raw: touch.raw,
    captured_at: event.occurredAt,
  };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  if (rateLimited(clientIp(request))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const parsed = TrackingBatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_event", details: parsed.error.issues.slice(0, 5) }, { status: 400 });
  if (parsed.data.events.some((event) => hasForbiddenProperties(event.properties))) {
    return NextResponse.json({ error: "forbidden_properties" }, { status: 400 });
  }

  // O cliente não pode se auto-classificar como interno em produção.
  const isInternal = isTrustedInternalRequest(request);

  try {
    const admin = createAdminClient();
    for (const event of parsed.data.events) {
    const { error: visitorInsertError } = await admin.from("analytics_visitors").insert({
      id: event.visitorId,
      consent_status: event.consentStatus,
      is_internal: isInternal,
      first_seen_at: event.occurredAt,
      last_seen_at: event.occurredAt,
    });
    if (visitorInsertError && visitorInsertError.code !== "23505") throw visitorInsertError;
    await admin.from("analytics_visitors").update({ last_seen_at: event.occurredAt, consent_status: event.consentStatus }).eq("id", event.visitorId);

    const { error: sessionInsertError } = await admin.from("analytics_sessions").insert({
      id: event.sessionId,
      visitor_id: event.visitorId,
      landing_path: event.landingPath,
      referrer: event.referrer,
      is_internal: isInternal,
      started_at: event.occurredAt,
      last_seen_at: event.occurredAt,
    });
    if (sessionInsertError && sessionInsertError.code !== "23505") throw sessionInsertError;
    await admin.from("analytics_sessions").update({ last_seen_at: event.occurredAt }).eq("id", event.sessionId);

    let firstAttributionId: string | null = null;
    if (event.firstTouch) {
      const { error } = await admin.from("analytics_attributions").insert(attributionRow(event, event.firstTouch, "first"));
      if (error && error.code !== "23505") throw error;
      const { data } = await admin.from("analytics_attributions").select("id").eq("visitor_id", event.visitorId).eq("attribution_type", "first").maybeSingle();
      firstAttributionId = data?.id ?? null;
      if (firstAttributionId) await admin.from("analytics_visitors").update({ first_attribution_id: firstAttributionId }).eq("id", event.visitorId).is("first_attribution_id", null);
    }

    let sessionAttributionId: string | null = null;
    if (event.sessionTouch) {
      const { error } = await admin.from("analytics_attributions").insert(attributionRow(event, event.sessionTouch, "session"));
      if (error && error.code !== "23505") throw error;
      const { data } = await admin.from("analytics_attributions").select("id").eq("session_id", event.sessionId).eq("attribution_type", "session").maybeSingle();
      sessionAttributionId = data?.id ?? null;
      if (sessionAttributionId) await admin.from("analytics_sessions").update({ attribution_id: sessionAttributionId }).eq("id", event.sessionId);
    }

    const { error: eventError } = await admin.from("analytics_events").insert({
      event_id: event.eventId,
      event_name: event.eventName,
      event_version: event.eventVersion,
      event_source: "browser",
      visitor_id: event.visitorId,
      session_id: event.sessionId,
      attribution_id: sessionAttributionId ?? firstAttributionId,
      properties: event.properties,
      is_internal: isInternal,
      occurred_at: event.occurredAt,
    });
    if (eventError && eventError.code !== "23505") throw eventError;
    }

    return NextResponse.json({ accepted: parsed.data.events.length });
  } catch (error) {
    // Tracking jamais deve derrubar a conversão. Mantemos um erro genérico
    // para o navegador e registramos somente o diagnóstico técnico no servidor.
    console.error("[tracking] event persistence failed", error);
    return NextResponse.json({ error: "tracking_unavailable" }, { status: 503 });
  }
}
