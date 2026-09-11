-- Expansão do tráfego pago pra México, Colômbia, Peru e Equador (além do
-- Chile já lançado): precisamos de um país granular por perfil pra
-- moeda/checkout futuro, separado da LatamRegion macro (usada só pra
-- priorizar receitas/alimentos) e do locale (idioma, que continua "es" pra
-- todos). Coluna nova — toda a base atual é do Chile, então o default 'cl'
-- já é o valor correto pra quem já existe, sem precisar de backfill.
alter table public.profiles
  add column if not exists country text not null default 'cl';

notify pgrst, 'reload schema';
