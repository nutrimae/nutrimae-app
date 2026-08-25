-- 001_create_nutribot_whatsapp_sessions.sql
-- Cria a tabela de sessões do NutriBot (spec seção 7). Idempotente.

CREATE TABLE IF NOT EXISTS nutribot_whatsapp_sessions (
  phone TEXT PRIMARY KEY,
  session_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_id TEXT,
  email_cliente TEXT,
  idade_bebe TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nutribot_sessions_updated_at
  ON nutribot_whatsapp_sessions (updated_at);
