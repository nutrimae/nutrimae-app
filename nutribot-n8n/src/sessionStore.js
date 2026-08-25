import {
  CLAIM_MESSAGE_SQL,
  UPSERT_SESSION_AFTER_REPLY_SQL,
  GET_SESSION_SQL,
  MARK_ERROR_NOTIFIED_SQL,
  SYNC_IDADE_FROM_TYPEBOT_SQL,
} from "./sql.js";

/**
 * Camada de acesso a `nutribot_whatsapp_sessions`. Recebe qualquer client
 * com `.query(text, params) => Promise<{rows, rowCount}>` — funciona tanto
 * com `pg.Pool`/`pg.PoolClient` reais quanto com o fake de
 * tests/fakeDb.js, usado nos testes automatizados deste pacote.
 *
 * @typedef {{query: (text: string, params?: unknown[]) => Promise<{rows: any[], rowCount: number}>}} QueryClient
 */

/**
 * Tenta "reivindicar" um messageId para um telefone. Se já foi processado
 * (mesmo last_message_id), retorna claimed=false — quem chamar NÃO deve
 * seguir para Typebot/Z-API (spec seção 6).
 *
 * @param {QueryClient} client
 */
export async function claimMessage(client, { phone, messageId }) {
  const { rows, rowCount } = await client.query(CLAIM_MESSAGE_SQL, [phone, messageId]);

  if (rowCount === 0) {
    return { claimed: false, session: null };
  }

  const row = rows[0];
  // last_message_id já foi sobrescrito com o messageId ATUAL pelo próprio
  // claim (é assim que o dedup funciona). Se o repassássemos como está, o
  // router.decideRoute() compararia session.last_message_id === event.messageId
  // e concluiria (erradamente) que toda mensagem nova é duplicada — o claim
  // já resolveu essa pergunta, então zeramos o campo para o resto do
  // pipeline de decisão de rota.
  const { is_new_row, last_message_id, ...rest } = row;
  return { claimed: true, isNewRow: Boolean(is_new_row), session: { ...rest, last_message_id: null } };
}

/** @param {QueryClient} client */
export async function getSession(client, phone) {
  const { rows } = await client.query(GET_SESSION_SQL, [phone]);
  return rows[0] ?? null;
}

/**
 * Grava o resultado de uma chamada ao Typebot (start ou continue),
 * preservando email_cliente/idade_bebe existentes quando o novo valor vem
 * vazio (spec seção 7 e 14).
 *
 * @param {QueryClient} client
 * @param {{
 *   phone: string,
 *   sessionId: string|null,
 *   lastMessageId: string,
 *   emailCliente?: string|null,
 *   idadeBebe?: string|null,
 *   keepSession: boolean,
 *   route: string,
 * }} params
 */
export async function upsertSessionAfterReply(client, params) {
  const status = params.keepSession ? "active" : "ended";
  const endedAt = params.keepSession ? null : new Date().toISOString();

  const { rows } = await client.query(UPSERT_SESSION_AFTER_REPLY_SQL, [
    params.phone,
    params.sessionId ?? "",
    params.lastMessageId,
    params.emailCliente ?? "",
    params.idadeBebe ?? "",
    status,
    endedAt,
    params.route,
  ]);

  return rows[0];
}

/** @param {QueryClient} client */
export async function markErrorNotified(client, phone) {
  await client.query(MARK_ERROR_NOTIFIED_SQL, [phone]);
}

/** @param {QueryClient} client */
export async function syncIdadeFromTypebot(client, { phone, idadeBebe }) {
  const { rows } = await client.query(SYNC_IDADE_FROM_TYPEBOT_SQL, [phone, idadeBebe ?? ""]);
  return rows[0] ?? null;
}

/**
 * Cooldown para a mensagem de erro temporário (spec seção 16: "usar
 * cooldown para não enviar essa mensagem repetidamente").
 */
export function shouldNotifyError(session, now, cooldownMinutes = 10) {
  if (!session?.last_error_notified_at) return true;
  const last = new Date(session.last_error_notified_at);
  if (Number.isNaN(last.getTime())) return true;
  return now.getTime() - last.getTime() >= cooldownMinutes * 60 * 1000;
}
