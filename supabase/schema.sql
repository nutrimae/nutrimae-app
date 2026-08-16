-- NutriMãe: schema (Sessões 1 e 2)
-- Rode este script inteiro no SQL Editor do seu projeto Supabase.
-- É seguro rodar de novo: todos os comandos são idempotentes.

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

-- 2. Bucket de fotos dos bebês (Storage) — privado; acesso via URL assinada
insert into storage.buckets (id, name, public)
values ('baby-photos', 'baby-photos', false)
on conflict (id) do update set public = false;

-- Cada usuária só pode ler/gerenciar arquivos dentro de uma pasta com o seu próprio user_id:
-- caminho esperado: <user_id>/<arquivo>
drop policy if exists "Leitura pública de fotos de bebês" on storage.objects;
drop policy if exists "Usuárias leem fotos na própria pasta" on storage.objects;
create policy "Usuárias leem fotos na própria pasta"
  on storage.objects for select
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

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

-- 3. Checkboxes da lista de compras (Sessão 2)
-- Guarda o estado marcado/desmarcado de cada item, por usuária e por bebê.
-- "item_key" é um slug do ingrediente (ex.: "batata-doce"), gerado no app.
create table if not exists public.shopping_list_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  baby_id uuid not null references public.babies (id) on delete cascade,
  item_key text not null,
  checked boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (user_id, baby_id, item_key)
);

create index if not exists shopping_list_checks_baby_id_idx
  on public.shopping_list_checks (baby_id);

alter table public.shopping_list_checks enable row level security;

drop policy if exists "Usuárias veem seus próprios itens" on public.shopping_list_checks;
create policy "Usuárias veem seus próprios itens"
  on public.shopping_list_checks for select
  using (auth.uid() = user_id);

drop policy if exists "Usuárias inserem seus próprios itens" on public.shopping_list_checks;
create policy "Usuárias inserem seus próprios itens"
  on public.shopping_list_checks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuárias atualizam seus próprios itens" on public.shopping_list_checks;
create policy "Usuárias atualizam seus próprios itens"
  on public.shopping_list_checks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuárias apagam seus próprios itens" on public.shopping_list_checks;
create policy "Usuárias apagam seus próprios itens"
  on public.shopping_list_checks for delete
  using (auth.uid() = user_id);

-- 4. Permissões de acesso a módulos pagos (Sessão 4)
--
-- As tabelas "user_products" e "webhook_logs" já existiam neste projeto antes
-- desta sessão (origem: SQL rodado manualmente no editor, fora deste script).
-- Reaproveitamos essa estrutura em vez de criar uma tabela paralela.
--
-- IMPORTANTE — correção de segurança: as políticas originais de
-- "user_products" permitiam que a própria usuária autenticada alterasse sua
-- linha via API (ex.: mudar product_id/status e se autoconceder acesso pago
-- sem pagar). O bloco abaixo remove TODAS as políticas existentes nas duas
-- tabelas e recria apenas leitura (própria linha). Escrita passa a ser
-- possível somente via service role (webhook), que ignora RLS.
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('user_products', 'webhook_logs')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table public.user_products enable row level security;
alter table public.webhook_logs enable row level security;

-- Usuária só lê suas próprias linhas de produto. Nenhuma policy de
-- insert/update/delete é criada de propósito.
create policy "Usuárias veem suas próprias permissões"
  on public.user_products for select
  using (auth.uid() = user_id);

-- webhook_logs é um log interno (pode conter payload bruto do webhook,
-- incluindo e-mail). Sem nenhuma policy: só a service role acessa.

-- 5. Perfis + flag de admin (Sessão 5)
-- Uma linha por usuária, criada automaticamente via trigger. "is_admin" só é
-- alterável manualmente no SQL Editor (nenhuma policy de update para o cliente).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Usuárias veem seu próprio perfil" on public.profiles;
create policy "Usuárias veem seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cria perfis retroativamente para contas que já existiam antes desta sessão.
insert into public.profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Para virar admin: rode manualmente
--   update public.profiles set is_admin = true where user_id = '<seu-user-id>';

-- 6. Diário do Bebê (Sessão 5) — módulo pago "diario_bebe"
create table if not exists public.food_log (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  food_key text not null,
  reaction text not null check (reaction in ('gostou', 'neutro', 'nao_gostou')),
  photo_url text,
  notes text,
  tried_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (baby_id, food_key)
);

create index if not exists food_log_baby_id_idx on public.food_log (baby_id);

alter table public.food_log enable row level security;

drop policy if exists "Usuárias veem o diário dos seus bebês" on public.food_log;
create policy "Usuárias veem o diário dos seus bebês"
  on public.food_log for select
  using (auth.uid() = user_id);

drop policy if exists "Usuárias registram no diário dos seus bebês" on public.food_log;
create policy "Usuárias registram no diário dos seus bebês"
  on public.food_log for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuárias atualizam o diário dos seus bebês" on public.food_log;
create policy "Usuárias atualizam o diário dos seus bebês"
  on public.food_log for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuárias apagam do diário dos seus bebês" on public.food_log;
create policy "Usuárias apagam do diário dos seus bebês"
  on public.food_log for delete
  using (auth.uid() = user_id);

create table if not exists public.food_milestones (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  milestone_key text not null,
  achieved_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  unique (baby_id, milestone_key)
);

create index if not exists food_milestones_baby_id_idx on public.food_milestones (baby_id);

alter table public.food_milestones enable row level security;

drop policy if exists "Usuárias veem os marcos dos seus bebês" on public.food_milestones;
create policy "Usuárias veem os marcos dos seus bebês"
  on public.food_milestones for select
  using (auth.uid() = user_id);

drop policy if exists "Usuárias registram marcos dos seus bebês" on public.food_milestones;
create policy "Usuárias registram marcos dos seus bebês"
  on public.food_milestones for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuárias apagam marcos dos seus bebês" on public.food_milestones;
create policy "Usuárias apagam marcos dos seus bebês"
  on public.food_milestones for delete
  using (auth.uid() = user_id);

-- 7. Cardápio de Restrição Alimentar (Sessão 5) — filtro salvo por bebê
alter table public.babies
  add column if not exists diet_filter text not null default 'padrao';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'babies_diet_filter_check'
  ) then
    alter table public.babies
      add constraint babies_diet_filter_check
      check (diet_filter in ('padrao', 'sem_leite', 'sem_ovo', 'sem_gluten'));
  end if;
end $$;

-- 8. Club das Mães (Sessão 5) — comunidade, incluída na assinatura ativa
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  is_hidden boolean not null default false,
  reply_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

drop policy if exists "Assinantes veem posts" on public.community_posts;
create policy "Assinantes veem posts"
  on public.community_posts for select
  using (auth.role() = 'authenticated');

drop policy if exists "Assinantes criam posts" on public.community_posts;
create policy "Assinantes criam posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

-- Sem policy de update/delete: fixar, ocultar etc. só via rota admin (service role).

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  is_official boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists community_replies_post_id_idx on public.community_replies (post_id);

alter table public.community_replies enable row level security;

drop policy if exists "Assinantes veem respostas" on public.community_replies;
create policy "Assinantes veem respostas"
  on public.community_replies for select
  using (auth.role() = 'authenticated');

drop policy if exists "Assinantes respondem" on public.community_replies;
create policy "Assinantes respondem"
  on public.community_replies for insert
  with check (auth.uid() = user_id);

create or replace function public.bump_post_reply_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.community_posts
    set reply_count = reply_count + 1
    where id = new.post_id;
  return new;
end;
$$;

drop trigger if exists on_community_reply_created on public.community_replies;
create trigger on_community_reply_created
  after insert on public.community_replies
  for each row execute function public.bump_post_reply_count();

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'reply')),
  target_id uuid not null,
  reporter_user_id uuid not null references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.community_reports enable row level security;

drop policy if exists "Assinantes reportam" on public.community_reports;
create policy "Assinantes reportam"
  on public.community_reports for insert
  with check (auth.uid() = reporter_user_id);

-- Sem policy de select: só a rota admin (service role) lê denúncias.

create table if not exists public.community_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.community_faqs enable row level security;

drop policy if exists "Assinantes veem o FAQ" on public.community_faqs;
create policy "Assinantes veem o FAQ"
  on public.community_faqs for select
  using (auth.role() = 'authenticated');

-- Sem policy de insert/update/delete: FAQ é editado só via rota admin.

-- 9. Canal de Suporte (Sessão 5) — incluído na assinatura ativa
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "Usuárias veem seus próprios tickets" on public.support_tickets;
create policy "Usuárias veem seus próprios tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "Usuárias abrem seus próprios tickets" on public.support_tickets;
create policy "Usuárias abrem seus próprios tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')),
  body text not null,
  read_by_user boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_ticket_id_idx on public.support_messages (ticket_id);

alter table public.support_messages enable row level security;

drop policy if exists "Usuárias veem mensagens dos seus tickets" on public.support_messages;
create policy "Usuárias veem mensagens dos seus tickets"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Usuárias enviam mensagens nos seus tickets" on public.support_messages;
create policy "Usuárias enviam mensagens nos seus tickets"
  on public.support_messages for insert
  with check (
    sender = 'user'
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Usuárias marcam como lidas as mensagens dos seus tickets" on public.support_messages;
create policy "Usuárias marcam como lidas as mensagens dos seus tickets"
  on public.support_messages for update
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

create or replace function public.bump_ticket_last_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.support_tickets
    set last_message_at = new.created_at
    where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists on_support_message_created on public.support_messages;
create trigger on_support_message_created
  after insert on public.support_messages
  for each row execute function public.bump_ticket_last_message();

-- 10. Bucket de fotos do Diário do Bebê (Storage) — privado, mesmo padrão de baby-photos
insert into storage.buckets (id, name, public)
values ('food-log-photos', 'food-log-photos', false)
on conflict (id) do update set public = false;

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'Diário:%'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

create policy "Diário: usuárias leem fotos na própria pasta"
  on storage.objects for select
  using (
    bucket_id = 'food-log-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Diário: usuárias enviam fotos na própria pasta"
  on storage.objects for insert
  with check (
    bucket_id = 'food-log-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Diário: usuárias apagam fotos na própria pasta"
  on storage.objects for delete
  using (
    bucket_id = 'food-log-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 11. Gênero do bebê (redesign) — define o tema rosa/azul do app
alter table public.babies
  add column if not exists gender text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'babies_gender_check'
  ) then
    alter table public.babies
      add constraint babies_gender_check
      check (gender in ('male', 'female'));
  end if;
end $$;

-- Bebês cadastrados antes desta sessão não têm gênero: assumem 'female'
-- (tema rosa) por padrão, como definido pelo produto.
update public.babies set gender = 'female' where gender is null;
