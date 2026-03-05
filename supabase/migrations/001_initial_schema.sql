-- NewCo Intel — Supabase schema
-- Run this in the Supabase SQL editor to set up the database

-- ── Leads table ─────────────────────────────────
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  siren         text not null,
  siret         text,
  company_name  text not null,
  legal_form    text,
  activity      text,
  naf_code      text,
  capital       integer,
  city          text,
  postal_code   text,
  region        text,
  address       text,

  -- BODACC source
  bodacc_id     text unique,
  bodacc_date   date not null default current_date,
  creation_date date,

  -- Vertical assignment
  vertical      text not null check (vertical in ('agence-web', 'expert-comptable', 'assureur')),

  -- AI scoring
  ai_score      integer default 0 check (ai_score >= 0 and ai_score <= 100),
  score_reasons jsonb default '[]'::jsonb,

  -- Enrichment
  has_domain    boolean default false,
  domain        text,
  has_website   boolean default false,
  website_stack text[] default '{}',
  social_presence text[] default '{}',
  employee_estimate text,

  -- Contact enrichment
  contact_first_name text,
  contact_last_name  text,
  contact_email      text,
  contact_phone      text,
  contact_linkedin   text,
  contact_role       text,

  -- Outreach
  outreach_angle text,
  tags           text[] default '{}',

  -- Metadata
  enrichment_status text default 'pending' check (enrichment_status in ('pending', 'enriched', 'failed')),
  scoring_status    text default 'pending' check (scoring_status in ('pending', 'scored', 'failed')),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Indexes for fast queries
create index if not exists idx_leads_vertical on leads(vertical);
create index if not exists idx_leads_ai_score on leads(ai_score desc);
create index if not exists idx_leads_bodacc_date on leads(bodacc_date desc);
create index if not exists idx_leads_siren on leads(siren);
create index if not exists idx_leads_enrichment_status on leads(enrichment_status);
create index if not exists idx_leads_scoring_status on leads(scoring_status);
create index if not exists idx_leads_created_at on leads(created_at desc);

-- ── Daily stats table ───────────────────────────
create table if not exists daily_stats (
  id               uuid primary key default gen_random_uuid(),
  date             date not null unique,
  total_creations  integer default 0,
  qualified        integer default 0,
  high_score       integer default 0,
  medium_score     integer default 0,
  low_score        integer default 0,
  created_at       timestamptz default now()
);

create index if not exists idx_daily_stats_date on daily_stats(date desc);

-- ── Pipeline runs (track cron executions) ───────
create table if not exists pipeline_runs (
  id          uuid primary key default gen_random_uuid(),
  run_date    date not null,
  step        text not null check (step in ('ingest', 'enrich', 'score')),
  status      text not null check (status in ('running', 'success', 'failed')),
  leads_count integer default 0,
  error       text,
  started_at  timestamptz default now(),
  finished_at timestamptz
);

-- ── Auto-update updated_at ──────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- ── Row Level Security ──────────────────────────
-- For now, allow public read access (no auth yet)
alter table leads enable row level security;
alter table daily_stats enable row level security;
alter table pipeline_runs enable row level security;

create policy "Public read leads" on leads for select using (true);
create policy "Public read daily_stats" on daily_stats for select using (true);
create policy "Public read pipeline_runs" on pipeline_runs for select using (true);

-- Service role can do everything (for cron functions)
create policy "Service insert leads" on leads for insert with check (true);
create policy "Service update leads" on leads for update using (true);
create policy "Service insert daily_stats" on daily_stats for insert with check (true);
create policy "Service update daily_stats" on daily_stats for update using (true);
create policy "Service insert pipeline_runs" on pipeline_runs for insert with check (true);
create policy "Service update pipeline_runs" on pipeline_runs for update using (true);
