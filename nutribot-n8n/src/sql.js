/**
 * SQL usado pelo session-store. Duas decisões deliberadas que DIVERGEM do
 * exemplo literal da spec (autorizado pela própria spec: "não reutilize
 * cegamente os IDs, filtros ou módulos do Make"):
 *
 * 1. CLAIM_MESSAGE_SQL faz dedup + leitura da sessão em UMA única
 *    instrução atômica (INSERT ... ON CONFLICT ... WHERE ... RETURNING),
 *    em vez de um SELECT ... FOR UPDATE separado. Isso evita depender de
 *    uma transação/conexão compartilhada entre nodes do n8n (cada node
 *    Postgres normalmente abre sua própria conexão) e ainda assim
 *    serializa concorrência no mesmo `phone`, porque o Postgres já
 *    serializa UPDATEs concorrentes na mesma linha de PK.
 *
 * 2. UPSERT_SESSION_AFTER_REPLY_SQL usa NULLIF(..., '') dentro do COALESCE
 *    para email_cliente/idade_bebe (a spec pede explicitamente "não
 *    sobrescrever com vazio, null ou string inexistente" — o exemplo dado
 *    só protegia contra NULL). Também NÃO força status='active' sempre:
 *    quem decide status/ended_at é a aplicação (com base em
 *    typebotResponse.interpretTypebotResult().shouldKeepSession), porque
 *    forçar 'active' sempre, como no exemplo original, contradiz a regra
 *    da seção 16 ("se Typebot não retornar input, marcar status como
 *    ended/expired").
 */

export const CLAIM_MESSAGE_SQL = `
INSERT INTO nutribot_whatsapp_sessions (phone, last_message_id, updated_at, status)
VALUES ($1, $2, NOW(), 'active')
ON CONFLICT (phone) DO UPDATE SET
  last_message_id = EXCLUDED.last_message_id
  -- Deliberadamente NÃO tocamos updated_at aqui: este campo é o relógio da
  -- expiração de 24h (spec seção 14) e deve refletir a última interação
  -- REAL com o Typebot, não a simples chegada de uma mensagem. Se o claim
  -- bumpasse updated_at, uma sessão de 25h atrás pareceria "fresca" na
  -- hora de decidir a rota, e a expiração nunca disparia.
WHERE nutribot_whatsapp_sessions.last_message_id IS DISTINCT FROM EXCLUDED.last_message_id
RETURNING
  phone,
  session_id,
  email_cliente,
  idade_bebe,
  status,
  updated_at,
  ended_at,
  last_message_id,
  (xmax = 0) AS is_new_row;
`.trim();

export const UPSERT_SESSION_AFTER_REPLY_SQL = `
INSERT INTO nutribot_whatsapp_sessions (
  phone, session_id, updated_at, last_message_id, email_cliente, idade_bebe, status, ended_at, last_route
)
VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)
ON CONFLICT (phone) DO UPDATE SET
  session_id      = COALESCE(NULLIF(EXCLUDED.session_id, ''), nutribot_whatsapp_sessions.session_id),
  updated_at       = NOW(),
  last_message_id  = COALESCE(NULLIF(EXCLUDED.last_message_id, ''), nutribot_whatsapp_sessions.last_message_id),
  email_cliente    = COALESCE(NULLIF(EXCLUDED.email_cliente, ''), nutribot_whatsapp_sessions.email_cliente),
  idade_bebe       = COALESCE(NULLIF(EXCLUDED.idade_bebe, ''), nutribot_whatsapp_sessions.idade_bebe),
  status           = EXCLUDED.status,
  ended_at         = EXCLUDED.ended_at,
  last_route       = EXCLUDED.last_route
RETURNING *;
`.trim();

export const GET_SESSION_SQL = `
SELECT * FROM nutribot_whatsapp_sessions WHERE phone = $1;
`.trim();

export const MARK_ERROR_NOTIFIED_SQL = `
UPDATE nutribot_whatsapp_sessions
SET last_error_notified_at = NOW()
WHERE phone = $1;
`.trim();

/**
 * Sincronização vinda do próprio Typebot (ver
 * workflow/nutribot-typebot-sync.workflow.json e
 * docs/typebot-flow-changes.md): quando o Typebot captura idade_bebe,
 * ele chama de volta o n8n, que grava aqui sem tocar session_id/status.
 */
export const SYNC_IDADE_FROM_TYPEBOT_SQL = `
UPDATE nutribot_whatsapp_sessions
SET idade_bebe = COALESCE(NULLIF($2, ''), idade_bebe),
    updated_at = NOW()
WHERE phone = $1
RETURNING *;
`.trim();
