-- O app não vende mais para o Brasil (zero assinantes BR ativos em
-- 2026-09-10 — ver commit "Renomeia marca para NutriMama..."), mas
-- public.profiles.locale foi criado com default 'pt-BR' (202609090001), e
-- nada no fluxo de compra/cadastro jamais grava 'es' explicitamente. Todo
-- perfil real, incluindo os criados hoje, está com locale = 'pt-BR' no
-- banco — por isso o app segue caindo no branch em português mesmo depois
-- de toda a localização de código, já que getServerLocale()/useLocale()
-- confiam nesse valor por usuária logada.
alter table public.profiles
  alter column locale set default 'es';

-- Backfill: sem assinante BR ativo hoje, é seguro corrigir todo perfil
-- existente de uma vez (ver nota acima). Se o BR voltar no futuro, isso
-- será revisitado por conta/segmento, não globalmente.
update public.profiles set locale = 'es' where locale = 'pt-BR';

notify pgrst, 'reload schema';
