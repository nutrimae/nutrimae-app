"use client";

import type { TrackingAttribution, TrackingEventPayload } from "./contracts";
import { applyAttributionTouch, shouldStartNewSession } from "./attribution-policy";

export type TrackingConsent = "unknown" | "denied" | "analytics" | "marketing";

const CONSENT_KEY = "nutrimae:tracking-consent:v1";
const VISITOR_KEY = "nutrimae:visitor-id:v1";
const SESSION_KEY = "nutrimae:session:v1";
const FIRST_TOUCH_KEY = "nutrimae:first-touch:v1";
const SESSION_TOUCH_KEY = "nutrimae:session-touch:v1";
const LAST_NON_DIRECT_KEY = "nutrimae:last-non-direct:v1";
const QUIZ_KEY = "nutrimae:quiz-answers:v1";
const SESSION_TTL_MS = 30 * 60 * 1000;

interface StoredSession {
  id: string;
  lastSeenAt: number;
  campaignFingerprint: string;
}

const ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content", "utm_term",
  "creative_id", "ad_id", "adset_id", "campaign_id", "fbclid", "gclid", "ttclid",
] as const;

function safeStorage(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}

export function getTrackingConsent(): TrackingConsent {
  if (typeof window === "undefined") return "unknown";
  const value = safeStorage()?.getItem(CONSENT_KEY);
  return value === "denied" || value === "analytics" || value === "marketing" ? value : "unknown";
}

export function setTrackingConsent(value: Exclude<TrackingConsent, "unknown">) {
  safeStorage()?.setItem(CONSENT_KEY, value);
  if (value === "denied") {
    safeStorage()?.removeItem(VISITOR_KEY);
    safeStorage()?.removeItem(SESSION_KEY);
    safeStorage()?.removeItem(FIRST_TOUCH_KEY);
    safeStorage()?.removeItem(SESSION_TOUCH_KEY);
    safeStorage()?.removeItem(LAST_NON_DIRECT_KEY);
  }
  window.dispatchEvent(new CustomEvent("nutrimae:tracking-consent", { detail: value }));
}

function sanitize(value: string | null): string | null {
  if (!value) return null;
  return value.trim().slice(0, 1000) || null;
}

function captureTouch(): TrackingAttribution | null {
  const params = new URLSearchParams(window.location.search);
  const raw: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = sanitize(params.get(key));
    if (value) raw[key] = value;
  }
  const hasCampaign = Object.keys(raw).length > 0;
  let referrer = sanitize(document.referrer);
  if (referrer) {
    try { if (new URL(referrer).origin === window.location.origin) referrer = null; } catch { referrer = null; }
  }
  if (!hasCampaign && !referrer) return null;

  return {
    source: sanitize(params.get("utm_source")),
    medium: sanitize(params.get("utm_medium")),
    campaign: sanitize(params.get("utm_campaign")),
    campaignId: sanitize(params.get("campaign_id") ?? params.get("utm_id")),
    content: sanitize(params.get("utm_content")),
    term: sanitize(params.get("utm_term")),
    creativeId: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.get("creative_id") ?? "") ? params.get("creative_id") : null,
    adId: sanitize(params.get("ad_id")),
    adsetId: sanitize(params.get("adset_id")),
    fbclid: sanitize(params.get("fbclid")),
    gclid: sanitize(params.get("gclid")),
    ttclid: sanitize(params.get("ttclid")),
    landingPath: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer,
    raw,
  };
}

function parseStored<T>(key: string): T | null {
  try {
    const value = safeStorage()?.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch { return null; }
}

function campaignFingerprint(touch: TrackingAttribution | null): string {
  if (!touch) return "direct";
  return JSON.stringify([touch.source, touch.medium, touch.campaign, touch.campaignId, touch.creativeId, touch.fbclid, touch.gclid, touch.ttclid]);
}

export function getTrackingContext() {
  const consent = getTrackingConsent();
  if (consent !== "analytics" && consent !== "marketing") return null;
  const storage = safeStorage();
  if (!storage) return null;

  let visitorId = storage.getItem(VISITOR_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    storage.setItem(VISITOR_KEY, visitorId);
  }

  const captured = captureTouch();
  let firstTouch = parseStored<TrackingAttribution>(FIRST_TOUCH_KEY);
  const previousLastNonDirect = parseStored<TrackingAttribution>(LAST_NON_DIRECT_KEY);
  const attributionState = applyAttributionTouch({ firstTouch, lastNonDirect: previousLastNonDirect }, captured);
  firstTouch = attributionState.firstTouch;
  if (firstTouch && !storage.getItem(FIRST_TOUCH_KEY)) storage.setItem(FIRST_TOUCH_KEY, JSON.stringify(firstTouch));
  if (attributionState.lastNonDirect) storage.setItem(LAST_NON_DIRECT_KEY, JSON.stringify(attributionState.lastNonDirect));
  const lastNonDirect = attributionState.lastNonDirect;

  const now = Date.now();
  const fingerprint = campaignFingerprint(captured);
  let session = parseStored<StoredSession>(SESSION_KEY);
  const newSession = shouldStartNewSession({
    hasSession: Boolean(session), lastSeenAt: session?.lastSeenAt ?? null, now, ttlMs: SESSION_TTL_MS,
    currentCampaignFingerprint: session?.campaignFingerprint ?? null,
    incomingCampaignFingerprint: captured ? fingerprint : null,
  });
  if (newSession) {
    session = { id: crypto.randomUUID(), lastSeenAt: now, campaignFingerprint: fingerprint };
    if (lastNonDirect) storage.setItem(SESSION_TOUCH_KEY, JSON.stringify(lastNonDirect));
    else storage.removeItem(SESSION_TOUCH_KEY);
  } else if (session) {
    session.lastSeenAt = now;
  }
  if (!session) return null;
  storage.setItem(SESSION_KEY, JSON.stringify(session));

  const sessionTouch = parseStored<TrackingAttribution>(SESSION_TOUCH_KEY) ?? lastNonDirect;
  return {
    visitorId,
    sessionId: session.id,
    consentStatus: consent,
    firstTouch,
    sessionTouch,
    isInternal: window.location.hostname === "localhost" || new URLSearchParams(window.location.search).get("tracking_test") === "1",
  } as const;
}

export function getCheckoutTrackingContext() {
  const context = getTrackingContext();
  if (!context) return null;
  return { visitorId: context.visitorId, sessionId: context.sessionId };
}

export function saveQuizAnswer(question: string, answer: string) {
  if (typeof window === "undefined") return;
  const current = parseStored<Record<string, string>>(QUIZ_KEY) ?? {};
  safeStorage()?.setItem(QUIZ_KEY, JSON.stringify({ ...current, [question]: answer }));
}

export function getQuizAnswers(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  return parseStored<Record<string, string>>(QUIZ_KEY);
}

export function track(eventName: TrackingEventPayload["eventName"], properties: Record<string, string | number | boolean | null | string[]> = {}) {
  if (typeof window === "undefined") return;
  const context = getTrackingContext();
  if (!context) return;

  const event: TrackingEventPayload = {
    eventId: crypto.randomUUID(),
    eventName,
    eventVersion: 1,
    visitorId: context.visitorId,
    sessionId: context.sessionId,
    consentStatus: context.consentStatus,
    occurredAt: new Date().toISOString(),
    landingPath: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer: document.referrer?.slice(0, 1000) || null,
    isInternal: context.isInternal,
    firstTouch: context.firstTouch,
    sessionTouch: context.sessionTouch,
    properties,
  };

  void fetch("/api/tracking/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: [event] }),
    keepalive: true,
  }).catch(() => undefined);
}
