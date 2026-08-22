import type { NormalizedEvent } from "./normalize";

/**
 * Máquina de decisão de rotas do NutriBot. Ordem obrigatória de prioridade:
 *   1. fromMe ou payload inválido       -> REJECTED
 *   2. mensagem de reinício              -> RESET
 *   3. e-mail válido                     -> EMAIL_VALID
 *   4. e-mail com @ mas inválido         -> EMAIL_INVALID
 *   5. continuação de sessão ativa       -> CONTINUATION
 *   6. sessão expirada/inválida          -> FALLBACK_EXPIRED_OR_INVALID
 *   7. sem sessão nenhuma                -> INITIAL_NO_SESSION
 *
 * A deduplicação (DUPLICATE) é resolvida ANTES desta função ser chamada —
 * pelo claim atômico do session-store. Portado de nutribot-n8n/src/router.js.
 */

export const ROUTES = {
  REJECTED: "rejected",
  DUPLICATE: "duplicate_ignored",
  RESET: "reset",
  EMAIL_VALID: "email_valid",
  EMAIL_INVALID: "email_invalid",
  CONTINUATION: "continuation",
  FALLBACK_EXPIRED_OR_INVALID: "fallback_expired_or_invalid",
  INITIAL_NO_SESSION: "initial_no_session",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

export interface SessionRow {
  phone?: string;
  session_id?: string | null;
  updated_at?: string | Date | null;
  last_message_id?: string | null;
  email_cliente?: string | null;
  idade_bebe?: string | null;
  status?: string | null;
  ended_at?: string | Date | null;
}

export function isPayloadValid(event: NormalizedEvent | null | undefined): boolean {
  return Boolean(
    event &&
      typeof event.phone === "string" &&
      event.phone.length > 0 &&
      typeof event.text === "string" &&
      event.text.length > 0 &&
      typeof event.messageId === "string" &&
      event.messageId.length > 0,
  );
}

export function isRejected(event: NormalizedEvent | null | undefined): boolean {
  if (!event) return true;
  if (event.fromMe) return true;
  if (!isPayloadValid(event)) return true;
  return false;
}

export function isSessionActive(session: SessionRow | null | undefined, now: Date, sessionTtlHours: number): boolean {
  if (!session) return false;
  if (!session.session_id || String(session.session_id).trim() === "") return false;
  if (session.status && session.status !== "active") return false;

  const updatedAtRaw = session.updated_at;
  if (!updatedAtRaw) return false;

  const updatedAt = updatedAtRaw instanceof Date ? updatedAtRaw : new Date(updatedAtRaw);
  if (Number.isNaN(updatedAt.getTime())) return false;

  const ageMs = now.getTime() - updatedAt.getTime();
  return ageMs < sessionTtlHours * 60 * 60 * 1000;
}

export interface RouteDecision {
  route: Route;
  reason: string;
  hasEmail?: boolean;
}

export function decideRoute(
  event: NormalizedEvent,
  session: SessionRow | null,
  options: { now?: Date; sessionTtlHours?: number } = {},
): RouteDecision {
  const now = options.now ?? new Date();
  const sessionTtlHours = options.sessionTtlHours ?? 24;

  if (isRejected(event)) {
    return { route: ROUTES.REJECTED, reason: event?.fromMe ? "from_me" : "invalid_payload" };
  }

  if (session && session.last_message_id && session.last_message_id === event.messageId) {
    return { route: ROUTES.DUPLICATE, reason: "duplicate_message_id" };
  }

  if (event.isReset) {
    return { route: ROUTES.RESET, reason: "reset_command" };
  }

  if (event.isValidEmail) {
    return { route: ROUTES.EMAIL_VALID, reason: "valid_email" };
  }

  if (event.isInvalidEmail) {
    return { route: ROUTES.EMAIL_INVALID, reason: "invalid_email" };
  }

  if (isSessionActive(session, now, sessionTtlHours)) {
    return { route: ROUTES.CONTINUATION, reason: "active_session" };
  }

  if (session) {
    return {
      route: ROUTES.FALLBACK_EXPIRED_OR_INVALID,
      reason: "expired_or_invalid_session",
      hasEmail: Boolean(session.email_cliente),
    };
  }

  return { route: ROUTES.INITIAL_NO_SESSION, reason: "no_session_found" };
}
