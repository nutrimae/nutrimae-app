/**
 * Máquina de decisão de rotas do NutriBot.
 *
 * Implementa a ordem obrigatória de prioridade (spec seção 8):
 *   1. fromMe ou payload inválido       -> REJECTED
 *   2. mensagem de reinício              -> RESET
 *   3. e-mail válido                     -> EMAIL_VALID
 *   4. e-mail com @ mas inválido         -> EMAIL_INVALID
 *   5. continuação de sessão ativa       -> CONTINUATION
 *   6. sessão expirada/inválida          -> FALLBACK_EXPIRED_OR_INVALID
 *   7. sem sessão nenhuma                -> INITIAL_NO_SESSION
 *
 * A deduplicação (DUPLICATE) é resolvida ANTES desta função ser chamada —
 * na prática, pelo INSERT ... ON CONFLICT "claim" do session-store, que já
 * bloqueia messageId repetido no nível do banco (ver docs/route-map.md).
 * Ainda assim, `decideRoute` aceita a sessão pós-claim e valida de novo
 * `last_message_id !== messageId` como cinto-de-segurança (spec seção 13).
 *
 * Invariantes garantidas só pela ORDEM dos `if`s abaixo (não por checagens
 * redundantes): uma mensagem com "@" nunca alcança CONTINUATION; um comando
 * de reinício nunca alcança EMAIL_VALID/EMAIL_INVALID/CONTINUATION.
 *
 * Espelha o Code node "3 · Decide Route" do workflow n8n. Coberto por
 * tests/router.test.mjs e tests/acceptance.test.mjs.
 */

export const ROUTES = Object.freeze({
  REJECTED: "rejected",
  DUPLICATE: "duplicate_ignored",
  RESET: "reset",
  EMAIL_VALID: "email_valid",
  EMAIL_INVALID: "email_invalid",
  CONTINUATION: "continuation",
  FALLBACK_EXPIRED_OR_INVALID: "fallback_expired_or_invalid",
  INITIAL_NO_SESSION: "initial_no_session",
});

export function isPayloadValid(event) {
  return (
    Boolean(event) &&
    typeof event.phone === "string" &&
    event.phone.length > 0 &&
    typeof event.text === "string" &&
    event.text.length > 0 &&
    typeof event.messageId === "string" &&
    event.messageId.length > 0
  );
}

export function isRejected(event) {
  if (!event) return true;
  if (event.fromMe) return true;
  if (!isPayloadValid(event)) return true;
  return false;
}

/**
 * Sessão "ativa" para fins de continuação: tem session_id não vazio,
 * status ainda "active", e foi atualizada há menos de `sessionTtlHours`.
 */
export function isSessionActive(session, now, sessionTtlHours) {
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

/**
 * @param {ReturnType<typeof import('./normalize.js').normalizeEvent>} event
 * @param {{phone:string, session_id:string|null, updated_at:string|Date|null,
 *          last_message_id:string|null, email_cliente:string|null,
 *          idade_bebe:string|null, status:string|null, ended_at:string|Date|null}|null} session
 *          linha atual em nutribot_whatsapp_sessions para este telefone (ou null se não existe)
 * @param {{now?: Date, sessionTtlHours?: number}} [options]
 */
export function decideRoute(event, session, options = {}) {
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

  // A partir daqui: texto sem "@" e que não é comando de reinício.
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
