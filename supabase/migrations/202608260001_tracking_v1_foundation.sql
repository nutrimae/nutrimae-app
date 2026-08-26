-- Tracking V1 — fundação aditiva e reversível.
-- Não altera a autoridade financeira de orders/payments/subscriptions nem do webhook Pagar.me.

create table if not exists public.marketing_creatives (
  id uuid primary key default gen_random_uuid(),
  product_key text,
  name text not null,
  platform text not null default 'meta',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  parent_creative_id uuid references public.marketing_creatives(id) on delete set null,
  concept text,
  angle text,
  hook text,
  format text,
  persona text,
  asset_url text,
  landing_variant text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_visitors (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  consent_status text not null check (consent_status in ('analytics', 'marketing')),
  first_attribution_id uuid,
  is_internal boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_sessions (
  id uuid primary key,
  visitor_id uuid not null references public.analytics_visitors(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  attribution_id uuid,
  landing_path text,
  referrer text,
  is_internal boolean not null default false,
  started_at timestamptz not null,
  last_seen_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_attributions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.analytics_visitors(id) on delete cascade,
  session_id uuid references public.analytics_sessions(id) on delete cascade,
  attribution_type text not null check (attribution_type in ('first', 'session')),
  source text,
  medium text,
  campaign text,
  campaign_id text,
  content text,
  term text,
  creative_id uuid references public.marketing_creatives(id) on delete set null,
  ad_id text,
  adset_id text,
  fbclid text,
  gclid text,
  ttclid text,
  landing_path text,
  referrer text,
  raw jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create unique index if not exists analytics_attributions_first_visitor_idx
  on public.analytics_attributions(visitor_id) where attribution_type = 'first';
create unique index if not exists analytics_attributions_session_idx
  on public.analytics_attributions(session_id) where attribution_type = 'session';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'analytics_visitors_first_attribution_fk') then
    alter table public.analytics_visitors add constraint analytics_visitors_first_attribution_fk
      foreign key (first_attribution_id) references public.analytics_attributions(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'analytics_sessions_attribution_fk') then
    alter table public.analytics_sessions add constraint analytics_sessions_attribution_fk
      foreign key (attribution_id) references public.analytics_attributions(id) on delete set null;
  end if;
end $$;

create table if not exists public.analytics_events (
  event_id uuid primary key,
  event_name text not null,
  event_version smallint not null default 1,
  event_source text not null check (event_source in ('browser', 'server', 'webhook', 'reconciliation')),
  visitor_id uuid references public.analytics_visitors(id) on delete set null,
  session_id uuid references public.analytics_sessions(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  attribution_id uuid references public.analytics_attributions(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  is_internal boolean not null default false,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index if not exists analytics_events_name_occurred_idx on public.analytics_events(event_name, occurred_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events(session_id, occurred_at);
create index if not exists analytics_events_order_idx on public.analytics_events(order_id) where order_id is not null;
create index if not exists analytics_events_external_idx on public.analytics_events(occurred_at desc) where is_internal = false;

create table if not exists public.analytics_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_name text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processed', 'error')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_spend_daily (
  id uuid primary key default gen_random_uuid(),
  spend_date date not null,
  platform text not null,
  account_id text not null default '',
  campaign_id text not null default '',
  adset_id text not null default '',
  ad_id text not null default '',
  creative_id uuid references public.marketing_creatives(id) on delete set null,
  currency text not null default 'BRL',
  spend_cents integer not null check (spend_cents >= 0),
  impressions integer check (impressions is null or impressions >= 0),
  clicks integer check (clicks is null or clicks >= 0),
  source text not null default 'manual_csv' check (source in ('manual_csv', 'api')),
  import_hash text not null,
  imported_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create unique index if not exists ad_spend_daily_idempotency_idx
  on public.ad_spend_daily(spend_date, platform, account_id, campaign_id, adset_id, ad_id, creative_id, import_hash) nulls not distinct;

alter table public.orders add column if not exists visitor_id uuid references public.analytics_visitors(id) on delete set null;
alter table public.orders add column if not exists session_id uuid references public.analytics_sessions(id) on delete set null;
alter table public.orders add column if not exists first_attribution_id uuid references public.analytics_attributions(id) on delete set null;
alter table public.orders add column if not exists last_attribution_id uuid references public.analytics_attributions(id) on delete set null;
alter table public.orders add column if not exists currency text not null default 'BRL';

alter table public.subscriptions add column if not exists visitor_id uuid references public.analytics_visitors(id) on delete set null;
alter table public.subscriptions add column if not exists session_id uuid references public.analytics_sessions(id) on delete set null;
alter table public.subscriptions add column if not exists first_attribution_id uuid references public.analytics_attributions(id) on delete set null;
alter table public.subscriptions add column if not exists last_attribution_id uuid references public.analytics_attributions(id) on delete set null;

create index if not exists orders_session_idx on public.orders(session_id) where session_id is not null;
create index if not exists orders_last_attribution_idx on public.orders(last_attribution_id) where last_attribution_id is not null;

alter table public.marketing_creatives enable row level security;
alter table public.analytics_visitors enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_attributions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_outbox enable row level security;
alter table public.ad_spend_daily enable row level security;

-- Nenhuma escrita pública. Browser sempre passa pela API server-side validada.
drop policy if exists "Admins gerenciam criativos" on public.marketing_creatives;
create policy "Admins gerenciam criativos" on public.marketing_creatives for all
  using (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true));

drop policy if exists "Admins leem analytics" on public.analytics_events;
create policy "Admins leem analytics" on public.analytics_events for select
  using (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true));

drop policy if exists "Admins leem visitantes" on public.analytics_visitors;
create policy "Admins leem visitantes" on public.analytics_visitors for select
  using (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true));

drop policy if exists "Admins leem sessoes" on public.analytics_sessions;
create policy "Admins leem sessoes" on public.analytics_sessions for select
  using (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true));

drop policy if exists "Admins leem atribuicoes" on public.analytics_attributions;
create policy "Admins leem atribuicoes" on public.analytics_attributions for select
  using (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true));

drop policy if exists "Admins gerenciam gasto" on public.ad_spend_daily;
create policy "Admins gerenciam gasto" on public.ad_spend_daily for all
  using (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where user_id = auth.uid() and is_admin = true));

comment on table public.analytics_events is 'Eventos first-party V1; não contém PII nem dados do bebê.';
comment on table public.analytics_outbox is 'Fila idempotente de eventos financeiros derivados do webhook soberano.';
