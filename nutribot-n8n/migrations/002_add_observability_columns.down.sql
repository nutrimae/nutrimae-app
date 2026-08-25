-- Rollback de 002. Não destrutivo para o restante da tabela.
ALTER TABLE nutribot_whatsapp_sessions
  DROP COLUMN IF EXISTS last_error_notified_at,
  DROP COLUMN IF EXISTS last_route;
