import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Camada de acesso a `nutribot_whatsapp_sessions` — migrado do Postgres
 * próprio do n8n (nutribot-n8n/src/sessionStore.js, cliente `pg` cru) pra
 * funções Postgres no Supabase, chamadas via `.rpc()`. Mesma garantia de
 * atomicidade (claim + upsert continuam sendo uma única instrução no
 * servidor) — ver supabase/schema.sql seção 13.
 */

export interface SessionRow {
  phone: string;
  session_id: string | null;
  email_cliente: string | null;
  idade_bebe: string | null;
  status: string | null;
  updated_at: string | null;
  ended_at: string | null;
  last_message_id: string | null;
  last_error_notified_at?: string | null;
}

export interface ClaimResult {
  claimed: boolean;
  isNewRow: boolean;
  session: SessionRow | null;
}

/**
 * Tenta "reivindicar" um messageId para um telefone. Se já foi processado
 * (mesmo last_message_id), retorna claimed=false — quem chamar NÃO deve
 * seguir para Typebot/Evolution API.
 */
export async function claimMessage(
  admin: AdminClient,
  { phone, messageId }: { phone: string; messageId: string },
): Promise<ClaimResult> {
  const { data, error } = await admin.rpc("nutribot_claim_message", { p_phone: phone, p_message_id: messageId });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.claimed) {
    return { claimed: false, session: null, isNewRow: false };
  }

  return {
    claimed: true,
    isNewRow: Boolean(row.is_new_row),
    // last_message_id já foi sobrescrito pelo próprio claim — zeramos pro
    // resto do pipeline de decisão de rota não confundir com duplicata.
    session: {
      phone,
      session_id: row.session_id ?? null,
      email_cliente: row.email_cliente ?? null,
      idade_bebe: row.idade_bebe ?? null,
      status: row.status ?? null,
      updated_at: row.updated_at ?? null,
      ended_at: row.ended_at ?? null,
      last_message_id: null,
    },
  };
}

export async function getSession(admin: AdminClient, phone: string): Promise<SessionRow | null> {
  const { data, error } = await admin.from("nutribot_whatsapp_sessions").select("*").eq("phone", phone).maybeSingle();
  if (error) throw error;
  return data as SessionRow | null;
}

/**
 * Grava o resultado de uma chamada ao Typebot (start ou continue),
 * preservando email_cliente/idade_bebe existentes quando o novo valor vem
 * vazio.
 */
export async function upsertSessionAfterReply(
  admin: AdminClient,
  params: {
    phone: string;
    sessionId: string | null;
    lastMessageId: string;
    emailCliente?: string | null;
    idadeBebe?: string | null;
    keepSession: boolean;
    route: string;
  },
) {
  const status = params.keepSession ? "active" : "ended";
  const endedAt = params.keepSession ? null : new Date().toISOString();

  const { data, error } = await admin.rpc("nutribot_upsert_session_after_reply", {
    p_phone: params.phone,
    p_session_id: params.sessionId ?? "",
    p_last_message_id: params.lastMessageId,
    p_email_cliente: params.emailCliente ?? "",
    p_idade_bebe: params.idadeBebe ?? "",
    p_status: status,
    p_ended_at: endedAt,
    p_route: params.route,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function markErrorNotified(admin: AdminClient, phone: string) {
  const { error } = await admin.rpc("nutribot_mark_error_notified", { p_phone: phone });
  if (error) throw error;
}

export async function syncIdadeFromTypebot(admin: AdminClient, { phone, idadeBebe }: { phone: string; idadeBebe?: string | null }) {
  const { data, error } = await admin.rpc("nutribot_sync_idade_from_typebot", {
    p_phone: phone,
    p_idade_bebe: idadeBebe ?? "",
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

/** Cooldown para a mensagem de erro temporário. */
export function shouldNotifyError(session: { last_error_notified_at?: string | null } | null | undefined, now: Date, cooldownMinutes = 10): boolean {
  if (!session?.last_error_notified_at) return true;
  const last = new Date(session.last_error_notified_at);
  if (Number.isNaN(last.getTime())) return true;
  return now.getTime() - last.getTime() >= cooldownMinutes * 60 * 1000;
}
