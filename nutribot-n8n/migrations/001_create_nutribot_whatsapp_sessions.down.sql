-- Rollback de 001. Destrutivo — ver docs/rollback.md antes de rodar em produção.
DROP INDEX IF EXISTS idx_nutribot_sessions_updated_at;
DROP TABLE IF EXISTS nutribot_whatsapp_sessions;
