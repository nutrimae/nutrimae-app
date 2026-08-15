-- NutriMãe: schema inicial (Sessão 1)
-- Rode este script inteiro no SQL Editor do seu projeto Supabase.

-- 1. Tabela de bebês vinculados a uma conta (auth.users)
create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  birth_date date not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists babies_user_id_idx on public.babies (user_id);

alter table public.babies enable row level security;

drop policy if exists "Usuárias veem seus próprios bebês" on public.babies;
create policy "Usuárias veem seus próprios bebês"
  on public.babies for select
  using (auth.uid() = user_id);

drop policy if exists "Usuárias inserem seus próprios bebês" on public.babies;
create policy "Usuárias inserem seus próprios bebês"
  on public.babies for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuárias atualizam seus próprios bebês" on public.babies;
create policy "Usuárias atualizam seus próprios bebês"
  on public.babies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuárias apagam seus próprios bebês" on public.babies;
create policy "Usuárias apagam seus próprios bebês"
  on public.babies for delete
  using (auth.uid() = user_id);

-- 2. Bucket de fotos dos bebês (Storage)
insert into storage.buckets (id, name, public)
values ('baby-photos', 'baby-photos', true)
on conflict (id) do nothing;

-- Cada usuária só pode gerenciar arquivos dentro de uma pasta com o seu próprio user_id:
-- caminho esperado: <user_id>/<arquivo>
drop policy if exists "Leitura pública de fotos de bebês" on storage.objects;
create policy "Leitura pública de fotos de bebês"
  on storage.objects for select
  using (bucket_id = 'baby-photos');

drop policy if exists "Usuárias enviam fotos na própria pasta" on storage.objects;
create policy "Usuárias enviam fotos na própria pasta"
  on storage.objects for insert
  with check (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuárias atualizam fotos na própria pasta" on storage.objects;
create policy "Usuárias atualizam fotos na própria pasta"
  on storage.objects for update
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuárias apagam fotos na própria pasta" on storage.objects;
create policy "Usuárias apagam fotos na própria pasta"
  on storage.objects for delete
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
