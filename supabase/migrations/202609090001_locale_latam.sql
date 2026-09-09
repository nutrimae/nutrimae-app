-- Expansão LATAM: idioma do perfil (pt-BR = Brasil, es = espanhol
-- latino-americano genérico) e sub-região LATAM para personalização de
-- cardápio, no mesmo padrão de public.profiles.region (ver schema.sql,
-- seção "Regional menu + TTS").
alter table public.profiles
  add column if not exists locale text not null default 'pt-BR'
  check (locale in ('pt-BR', 'es'));

alter table public.profiles
  add column if not exists latam_region text
  check (latam_region is null or latam_region in ('mexico', 'centroamerica', 'caribe', 'andina', 'rio_de_la_plata', 'chile'));

notify pgrst, 'reload schema';
