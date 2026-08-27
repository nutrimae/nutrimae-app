import type { TrackingAttribution } from "./contracts";

export interface AttributionState {
  firstTouch: TrackingAttribution | null;
  lastNonDirect: TrackingAttribution | null;
}

/** First Touch é imutável; acesso direto nunca apaga Last Non-Direct. */
export function applyAttributionTouch(state: AttributionState, incoming: TrackingAttribution | null): AttributionState {
  if (!incoming) return state;
  return {
    firstTouch: state.firstTouch ?? incoming,
    lastNonDirect: incoming,
  };
}

export function shouldStartNewSession(input: {
  hasSession: boolean;
  lastSeenAt: number | null;
  now: number;
  ttlMs: number;
  currentCampaignFingerprint: string | null;
  incomingCampaignFingerprint: string | null;
}): boolean {
  if (!input.hasSession || input.lastSeenAt === null) return true;
  if (input.now - input.lastSeenAt > input.ttlMs) return true;
  return Boolean(input.incomingCampaignFingerprint && input.incomingCampaignFingerprint !== input.currentCampaignFingerprint);
}
