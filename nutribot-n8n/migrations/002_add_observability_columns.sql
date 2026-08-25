-- 002_add_observability_columns.sql
-- Aditiva e retrocompatível — não altera o contrato dos campos exigidos
-- pela spec (phone, session_id, updated_at, last_message_id, email_cliente,
-- idade_bebe). Adiciona duas colunas usadas pela camada de confiabilidade:
--
-- last_error_notified_at: cooldown da mensagem de erro temporário
--   (spec seção 16: "usar cooldown para não enviar essa mensagem
--   repetidamente"). Sem isso não há onde guardar quando o último aviso
--   de erro foi enviado a esta mãe.
--
-- last_route: qual rota (das 7 da spec seção 8) processou a última
--   mensagem — requisito de observabilidade da seção 20
--   ("registro da rota executada").

ALTER TABLE nutribot_whatsapp_sessions
  ADD COLUMN IF NOT EXISTS last_error_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_route TEXT;
