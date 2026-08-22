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

-- 5.1 Telefone da usuária (NutriBot / WhatsApp)
-- Formato esperado: internacional, só dígitos, sem "+" (ex.: "5511999999999").
-- Preenchido pelo webhook de compra (service role) quando a plataforma de
-- pagamento envia o telefone. Usado pelo webhook do WhatsApp para achar o
-- user_id a partir do número que escreveu, e então checar "user_products".
alter table public.profiles add column if not exists phone_number text;

create unique index if not exists profiles_phone_number_idx
  on public.profiles (phone_number)
  where phone_number is not null;

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

-- 12. Checkout próprio (Pagar.me) — clientes, ofertas, pedidos, pagamentos
--
-- Substitui os links externos da CartPanda por um checkout nosso. "offers" é
-- a fonte única de verdade de preço/nome (landing, checkout e banco sempre
-- leem daqui, nunca de um valor hardcoded em outro lugar) e aponta, via
-- product_key, para o mesmo enum ProductKey já usado por user_products —
-- getEntitlementStatus() e hasPurchasedAppAccess() não mudam nada.
--
-- Dinheiro sempre em centavos (inteiro). RLS: leitura só da própria linha
-- (exceto "offers", que é pública já que o checkout lê preço sem estar
-- logado); escrita em qualquer uma dessas tabelas só pela service role — o
-- mesmo modelo já usado em "user_products" (nenhuma policy de
-- insert/update/delete pra usuária comum, de propósito).

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  pagarme_customer_id text,
  email text not null,
  name text not null,
  document text not null,
  phone_number text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_pagarme_customer_id_idx
  on public.customers (pagarme_customer_id)
  where pagarme_customer_id is not null;

create index if not exists customers_email_idx on public.customers (email);
create index if not exists customers_user_id_idx on public.customers (user_id);

-- "product_key" não é FK (ProductKey vive em TypeScript, não no banco) — a
-- validação de que é uma chave conhecida acontece na aplicação, igual já
-- acontece hoje com user_products.product_id.
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  product_key text not null,
  name text not null,
  billing_type text not null,
  price_cents integer not null,
  recurring_price_cents integer,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'offers_billing_type_check') then
    alter table public.offers
      add constraint offers_billing_type_check
      check (billing_type in ('one_time', 'recurring'));
  end if;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id),
  user_id uuid references auth.users (id) on delete set null,
  offer_id uuid not null references offers (id),
  parent_order_id uuid references orders (id),
  pagarme_order_id text,
  status text not null default 'pending',
  payment_method text not null,
  amount_cents integer not null,
  utm jsonb,
  quiz_answers jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists orders_pagarme_order_id_idx
  on public.orders (pagarme_order_id)
  where pagarme_order_id is not null;

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_parent_order_id_idx on public.orders (parent_order_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_status_check') then
    alter table public.orders
      add constraint orders_status_check
      check (status in ('pending', 'paid', 'refused', 'expired', 'canceled', 'refunded'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'orders_payment_method_check') then
    alter table public.orders
      add constraint orders_payment_method_check
      check (payment_method in ('pix', 'credit_card'));
  end if;
end $$;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  offer_id uuid not null references offers (id),
  description text not null,
  quantity integer not null default 1,
  unit_amount_cents integer not null,
  total_amount_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  pagarme_charge_id text,
  pagarme_transaction_id text,
  method text not null,
  status text not null,
  amount_cents integer not null,
  pix_qr_code text,
  pix_qr_code_url text,
  pix_expires_at timestamptz,
  card_brand text,
  card_last4 text,
  raw_last_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx on public.payments (order_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'payments_method_check') then
    alter table public.payments
      add constraint payments_method_check
      check (method in ('pix', 'credit_card'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'payments_status_check') then
    alter table public.payments
      add constraint payments_status_check
      check (status in ('pending', 'paid', 'refused', 'expired', 'canceled'));
  end if;
end $$;

-- Assinaturas recorrentes (Plano Mensal, NutriBot VIP). O código de
-- assinatura já é implementado de verdade (não é um stub) — o que mantém
-- isso fora do ar em produção é simplesmente nenhuma "offer" com
-- billing_type='recurring' estar com active=true ainda. Ver
-- src/lib/payments/pagarme.ts.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id),
  offer_id uuid not null references offers (id),
  pagarme_subscription_id text unique,
  status text not null default 'pending',
  next_billing_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_id_idx on public.subscriptions (customer_id);

-- Idempotência de webhook: cada evento (de qualquer provedor) só pode ser
-- processado uma vez. O handler insere a linha ANTES de processar; se
-- provider_event_id já existir para o mesmo provider, o índice único
-- rejeita o insert (23505) e o handler responde 200 sem reprocessar —
-- funciona mesmo com duas entregas concorrentes do mesmo evento.
alter table public.webhook_logs
  add column if not exists provider text not null default 'cartpanda';

alter table public.webhook_logs
  add column if not exists provider_event_id text;

create unique index if not exists webhook_logs_provider_event_idx
  on public.webhook_logs (provider, provider_event_id)
  where provider_event_id is not null;

alter table public.customers enable row level security;
alter table public.offers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Usuárias veem seus próprios dados de cliente" on public.customers;
create policy "Usuárias veem seus próprios dados de cliente"
  on public.customers for select
  using (auth.uid() = user_id);

drop policy if exists "Ofertas ativas são públicas" on public.offers;
create policy "Ofertas ativas são públicas"
  on public.offers for select
  using (active = true);

drop policy if exists "Usuárias veem seus próprios pedidos" on public.orders;
create policy "Usuárias veem seus próprios pedidos"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Usuárias veem os itens dos próprios pedidos" on public.order_items;
create policy "Usuárias veem os itens dos próprios pedidos"
  on public.order_items for select
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

drop policy if exists "Usuárias veem os pagamentos dos próprios pedidos" on public.payments;
create policy "Usuárias veem os pagamentos dos próprios pedidos"
  on public.payments for select
  using (exists (
    select 1 from public.orders
    where orders.id = payments.order_id and orders.user_id = auth.uid()
  ));

drop policy if exists "Usuárias veem suas próprias assinaturas" on public.subscriptions;
create policy "Usuárias veem suas próprias assinaturas"
  on public.subscriptions for select
  using (exists (
    select 1 from public.customers
    where customers.id = subscriptions.customer_id and customers.user_id = auth.uid()
  ));

-- Nenhuma policy de insert/update/delete em nenhuma destas tabelas, de
-- propósito — só a service role (que ignora RLS) escreve, a partir do
-- webhook do Pagar.me e da rota /api/checkout. Ver
-- src/app/api/webhooks/pagarme/route.ts e src/app/api/checkout/route.ts.

-- Sementes das ofertas ativas no lançamento. As ofertas de assinatura
-- (Mensal, NutriBot VIP) já existem aqui mas com active=false — ligar só
-- depois de validar em sandbox e produção controlada (ver plano de
-- implementação).
insert into public.offers (slug, product_key, name, billing_type, price_cents, recurring_price_cents, active)
values
  ('nutrimae-anual', 'nutrimae_assinatura', 'NutriMãe — Plano Anual', 'one_time', 9700, null, true),
  ('sos-desmame', 'sos_desmame_noturno', 'SOS Desmame Noturno', 'one_time', 2700, null, true),
  ('protocolo-intestino', 'protocolo_intestino_livre', 'Protocolo Intestino Livre', 'one_time', 1700, null, true),
  ('nutribot-30d', 'nutribot_30d', 'NutriBot — 30 Dias', 'one_time', 2790, null, true),
  ('nutrimae-mensal', 'nutrimae_assinatura', 'NutriMãe — Plano Mensal', 'recurring', 1990, 2990, false),
  ('nutribot-vip-mensal', 'nutribot_vip', 'NutriBot VIP', 'recurring', 3700, 3700, false)
on conflict (slug) do nothing;

-- 13. NutriBot — sessões de conversa do WhatsApp (migrado do Postgres próprio
-- do n8n — ver nutribot-n8n/migrations/001 e 002, e nutribot-n8n/src/sql.js).
-- Mesmas colunas, mesma lógica de dedup/upsert, só trocando "pg.Pool cru"
-- por funções Postgres chamadas via supabase.rpc() a partir do Next.js —
-- preserva a atomicidade (claim + upsert continuam sendo uma única
-- instrução no servidor) sem precisar manter uma segunda conexão de banco.
create table if not exists public.nutribot_whatsapp_sessions (
  phone text primary key,
  session_id text,
  updated_at timestamptz not null default now(),
  last_message_id text,
  email_cliente text,
  idade_bebe text,
  status text not null default 'active',
  ended_at timestamptz,
  last_error_notified_at timestamptz,
  last_route text
);

create index if not exists idx_nutribot_sessions_updated_at
  on public.nutribot_whatsapp_sessions (updated_at);

alter table public.nutribot_whatsapp_sessions enable row level security;
-- Sem nenhuma policy: só a service role (que ignora RLS) acessa esta
-- tabela — é estado interno do bot, nunca lido/escrito pelo cliente.

-- Reivindica um messageId pra um telefone (dedup). Se já processado (mesmo
-- last_message_id), devolve claimed=false — quem chamar não deve seguir
-- para Typebot/Evolution API. Não bate updated_at de propósito: esse campo
-- é o relógio da expiração de 24h e só deve refletir interação real com o
-- Typebot, não a mera chegada de uma mensagem (senão a expiração nunca dispara).
create or replace function public.nutribot_claim_message(p_phone text, p_message_id text)
returns table (
  claimed boolean,
  is_new_row boolean,
  session_id text,
  email_cliente text,
  idade_bebe text,
  status text,
  updated_at timestamptz,
  ended_at timestamptz
)
language plpgsql
security definer set search_path = public
as $$
declare
  r record;
  found_row boolean;
begin
  insert into public.nutribot_whatsapp_sessions (phone, last_message_id, updated_at, status)
  values (p_phone, p_message_id, now(), 'active')
  on conflict (phone) do update set
    last_message_id = excluded.last_message_id
  where public.nutribot_whatsapp_sessions.last_message_id is distinct from excluded.last_message_id
  returning
    public.nutribot_whatsapp_sessions.session_id,
    public.nutribot_whatsapp_sessions.email_cliente,
    public.nutribot_whatsapp_sessions.idade_bebe,
    public.nutribot_whatsapp_sessions.status,
    public.nutribot_whatsapp_sessions.updated_at,
    public.nutribot_whatsapp_sessions.ended_at,
    (xmax = 0) as is_new_row
  into r;

  found_row := found;

  if not found_row then
    return query select false, false, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz;
  else
    return query select true, r.is_new_row, r.session_id, r.email_cliente, r.idade_bebe, r.status, r.updated_at, r.ended_at;
  end if;
end;
$$;

-- Grava o resultado de uma chamada ao Typebot (start ou continue),
-- preservando email_cliente/idade_bebe existentes quando o novo valor vem
-- vazio — nunca sobrescreve memória já capturada com string vazia.
create or replace function public.nutribot_upsert_session_after_reply(
  p_phone text,
  p_session_id text,
  p_last_message_id text,
  p_email_cliente text,
  p_idade_bebe text,
  p_status text,
  p_ended_at timestamptz,
  p_route text
)
returns setof public.nutribot_whatsapp_sessions
language sql
security definer set search_path = public
as $$
  insert into public.nutribot_whatsapp_sessions (
    phone, session_id, updated_at, last_message_id, email_cliente, idade_bebe, status, ended_at, last_route
  )
  values (p_phone, p_session_id, now(), p_last_message_id, p_email_cliente, p_idade_bebe, p_status, p_ended_at, p_route)
  on conflict (phone) do update set
    session_id      = coalesce(nullif(excluded.session_id, ''), public.nutribot_whatsapp_sessions.session_id),
    updated_at      = now(),
    last_message_id = coalesce(nullif(excluded.last_message_id, ''), public.nutribot_whatsapp_sessions.last_message_id),
    email_cliente   = coalesce(nullif(excluded.email_cliente, ''), public.nutribot_whatsapp_sessions.email_cliente),
    idade_bebe      = coalesce(nullif(excluded.idade_bebe, ''), public.nutribot_whatsapp_sessions.idade_bebe),
    status          = excluded.status,
    ended_at        = excluded.ended_at,
    last_route      = excluded.last_route
  returning *;
$$;

create or replace function public.nutribot_mark_error_notified(p_phone text)
returns void
language sql
security definer set search_path = public
as $$
  update public.nutribot_whatsapp_sessions
  set last_error_notified_at = now()
  where phone = p_phone;
$$;

-- Sincronização vinda do próprio Typebot (bloco HTTP Request pós-captura de
-- idade): grava idade_bebe sem tocar session_id/status.
create or replace function public.nutribot_sync_idade_from_typebot(p_phone text, p_idade_bebe text)
returns setof public.nutribot_whatsapp_sessions
language sql
security definer set search_path = public
as $$
  update public.nutribot_whatsapp_sessions
  set idade_bebe = coalesce(nullif(p_idade_bebe, ''), idade_bebe),
      updated_at = now()
  where phone = p_phone
  returning *;
$$;
