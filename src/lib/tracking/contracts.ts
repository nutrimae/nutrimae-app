import { z } from "zod";

export const BROWSER_EVENT_NAMES = [
  "page_viewed",
  "landing_viewed",
  "age_selected",
  "quiz_started",
  "quiz_answered",
  "quiz_completed",
  "vsl_started",
  "vsl_progressed",
  "vsl_completed",
  "cta_clicked",
  "checkout_viewed",
  "bump_toggled",
  "checkout_submitted",
] as const;

export const BrowserEventNameSchema = z.enum(BROWSER_EVENT_NAMES);

const AttributionSchema = z.object({
  source: z.string().max(120).nullable().optional(),
  medium: z.string().max(120).nullable().optional(),
  campaign: z.string().max(200).nullable().optional(),
  campaignId: z.string().max(200).nullable().optional(),
  content: z.string().max(200).nullable().optional(),
  term: z.string().max(200).nullable().optional(),
  creativeId: z.string().uuid().nullable().optional(),
  adId: z.string().max(200).nullable().optional(),
  adsetId: z.string().max(200).nullable().optional(),
  fbclid: z.string().max(500).nullable().optional(),
  gclid: z.string().max(500).nullable().optional(),
  ttclid: z.string().max(500).nullable().optional(),
  landingPath: z.string().max(500).nullable().optional(),
  referrer: z.string().max(1000).nullable().optional(),
  raw: z.record(z.string(), z.string().max(1000)).default({}),
});

export type TrackingAttribution = z.infer<typeof AttributionSchema>;

export const TrackingEventSchema = z.object({
  eventId: z.string().uuid(),
  eventName: BrowserEventNameSchema,
  eventVersion: z.literal(1),
  visitorId: z.string().uuid(),
  sessionId: z.string().uuid(),
  consentStatus: z.enum(["analytics", "marketing"]),
  occurredAt: z.string().datetime(),
  landingPath: z.string().max(500),
  referrer: z.string().max(1000).nullable(),
  isInternal: z.boolean().default(false),
  firstTouch: AttributionSchema.nullable(),
  sessionTouch: AttributionSchema.nullable(),
  properties: z.record(z.string(), z.union([z.string().max(1000), z.number(), z.boolean(), z.null(), z.array(z.string().max(200)).max(20)])).default({}),
}).strict();

export const TrackingBatchSchema = z.object({
  events: z.array(TrackingEventSchema).min(1).max(20),
}).strict();

export type TrackingEventPayload = z.infer<typeof TrackingEventSchema>;

export const FORBIDDEN_PROPERTY_KEYS = /email|phone|telefone|cpf|document|name|nome|baby|bebe|birth|nascimento|photo|foto/i;

export function hasForbiddenProperties(properties: Record<string, unknown>): boolean {
  return Object.keys(properties).some((key) => FORBIDDEN_PROPERTY_KEYS.test(key));
}
