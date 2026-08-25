import {
  CLAIM_MESSAGE_SQL,
  UPSERT_SESSION_AFTER_REPLY_SQL,
  GET_SESSION_SQL,
  MARK_ERROR_NOTIFIED_SQL,
  SYNC_IDADE_FROM_TYPEBOT_SQL,
} from "../src/sql.js";

/**
 * Simulação em memória de `nutribot_whatsapp_sessions` usada só nos testes
 * deste pacote. Reproduz o comportamento das 5 queries de src/sql.js
 * (incluindo IS DISTINCT FROM / COALESCE(NULLIF(...))) suficiente para
 * validar a lógica de src/sessionStore.js SEM depender de um Postgres real.
 *
 * Isto NÃO substitui um teste de integração contra Postgres de verdade —
 * ver docs/production-checklist.md, item "smoke test contra staging".
 */
export function createFakeDb() {
  /** @type {Map<string, any>} */
  const rows = new Map();

  function nullIfEmpty(value) {
    return value === "" || value == null ? null : value;
  }

  async function query(text, params = []) {
    switch (text) {
      case CLAIM_MESSAGE_SQL: {
        const [phone, messageId] = params;
        const existing = rows.get(phone);

        if (!existing) {
          const row = {
            phone,
            session_id: null,
            updated_at: new Date(),
            last_message_id: messageId,
            email_cliente: null,
            idade_bebe: null,
            status: "active",
            ended_at: null,
            last_route: null,
            last_error_notified_at: null,
          };
          rows.set(phone, row);
          return { rows: [{ ...row, is_new_row: true }], rowCount: 1 };
        }

        if (existing.last_message_id === messageId) {
          // IS DISTINCT FROM falso -> UPDATE não roda -> RETURNING vazio.
          return { rows: [], rowCount: 0 };
        }

        existing.last_message_id = messageId;
        // updated_at NÃO é tocado pelo claim (ver comentário em src/sql.js
        // sobre CLAIM_MESSAGE_SQL) — só upsertSessionAfterReply o atualiza.
        return { rows: [{ ...existing, is_new_row: false }], rowCount: 1 };
      }

      case UPSERT_SESSION_AFTER_REPLY_SQL: {
        const [phone, sessionId, lastMessageId, emailCliente, idadeBebe, status, endedAt, lastRoute] =
          params;
        const existing = rows.get(phone) ?? {
          phone,
          session_id: null,
          updated_at: new Date(),
          last_message_id: null,
          email_cliente: null,
          idade_bebe: null,
          status: "active",
          ended_at: null,
          last_route: null,
          last_error_notified_at: null,
        };

        const updated = {
          ...existing,
          session_id: nullIfEmpty(sessionId) ?? existing.session_id,
          updated_at: new Date(),
          last_message_id: nullIfEmpty(lastMessageId) ?? existing.last_message_id,
          email_cliente: nullIfEmpty(emailCliente) ?? existing.email_cliente,
          idade_bebe: nullIfEmpty(idadeBebe) ?? existing.idade_bebe,
          status,
          ended_at: endedAt ?? null,
          last_route: lastRoute,
        };

        rows.set(phone, updated);
        return { rows: [updated], rowCount: 1 };
      }

      case GET_SESSION_SQL: {
        const [phone] = params;
        const row = rows.get(phone);
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }

      case MARK_ERROR_NOTIFIED_SQL: {
        const [phone] = params;
        const row = rows.get(phone);
        if (row) row.last_error_notified_at = new Date();
        return { rows: [], rowCount: row ? 1 : 0 };
      }

      case SYNC_IDADE_FROM_TYPEBOT_SQL: {
        const [phone, idadeBebe] = params;
        const row = rows.get(phone);
        if (!row) return { rows: [], rowCount: 0 };
        row.idade_bebe = nullIfEmpty(idadeBebe) ?? row.idade_bebe;
        row.updated_at = new Date();
        return { rows: [row], rowCount: 1 };
      }

      default:
        throw new Error(`fakeDb: query não reconhecida:\n${text}`);
    }
  }

  return {
    query,
    _debugRows: rows,
    _seed(phone, row) {
      rows.set(phone, { last_route: null, last_error_notified_at: null, ended_at: null, ...row });
    },
  };
}
