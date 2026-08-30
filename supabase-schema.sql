-- supabase-schema.sql — the full schema for the one live Supabase project
-- (rodxrkzwpsgeeatmbwku, "Carters Portfolio"). Already applied directly via
-- the Supabase MCP connection on 2026-08-30 — this file exists as a
-- version-controlled record of what's live, not something that still needs
-- running. If you ever need to rebuild from scratch, this is what to run.
--
-- History: the Scaffold originally lived in a second, separate Supabase
-- project (kvgeimwitzdlstagqumw) — see freelance-schema.sql and
-- content-builder-schema.sql, both now superseded by this file. That
-- project was deleted (moved-device cleanup) along with all its data:
-- Docket tasks, Wick's memory/conversation history, campaign/link tracking,
-- and generated content. Nothing recoverable was lost from this repo's
-- side — only the rows. This file recreates the tables (empty) in the
-- portfolio's project, the one project that still exists, and all the app
-- code (command-center-data.jsx, api/scaffold-write.js, api/design-brief.js,
-- api/create-invoice-link.js, api/stripe-webhook.js, api/wick-brain-server.js,
-- api/wick-close-session.js) now points there instead. See DECISIONS.md.
--
-- Pattern: RLS on everywhere. Tables read client-side via the anon key
-- (campaigns, links, docket_tasks, generated_content, and the Business Hub
-- CRM tables) get a public-read policy; all writes go through
-- api/scaffold-write.js with the service-role key, which bypasses RLS.
-- design_briefs/design_brief_attachments are also written by
-- api/design-brief.js (public, unauthenticated) with the same service-role
-- key, since a brief submitter has no Scaffold session. wick_memory/
-- wick_sessions/wick_messages/wick_actions get RLS with NO select policy —
-- service-role key only, zero anon access, matching api/wick-memory.js's
-- documented intent.

create table if not exists campaigns (
  id text primary key,
  brand text not null check (brand in ('ltw','sq')),
  date date not null,
  channel text,
  type text,
  name text not null,
  audience text,
  qty integer,
  cost numeric,
  attribution text,
  utm text,
  leads integer default 0,
  status text not null default 'draft' check (status in ('draft','sent','flagged')),
  checklist jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null check (brand in ('ltw','sq')),
  channel text,
  date date,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists docket_tasks (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('ltw','sq','me')),
  q text not null check (q in ('q1','q2','q3','q4')),
  t text not null,
  due date,
  made date not null default current_date,
  rank integer default 0,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists generated_content (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('ltw', 'sq')),
  kind text not null,
  title text,
  eyebrow text,
  subject text,
  hi text,
  preheader text,
  greeting text,
  body jsonb not null default '[]'::jsonb,
  cta text,
  cta2 text,
  campaign_id text,
  by text not null default 'Builder',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists wick_sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  turns integer default 0,
  headline text
);

create table if not exists wick_memory (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date not null default current_date,
  topic text not null,
  summary text not null,
  related_brand text check (related_brand in ('ltw','sq')),
  kind text default 'decision' check (kind in ('decision','preference','result','pattern','disagreement')),
  source text default 'conversation',
  weight integer default 1,
  session_id uuid references wick_sessions(id) on delete set null
);
create index if not exists wick_memory_brand_date on wick_memory (related_brand, date desc);

create table if not exists wick_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references wick_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null check (role in ('user','assistant')),
  content text not null,
  tool_calls jsonb
);

create table if not exists wick_actions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid references wick_sessions(id) on delete set null,
  tool text not null,
  input jsonb not null,
  result text,
  entity text,
  ok boolean default true
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  email text,
  since date,
  prefers text,
  rate numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  email text,
  source text,
  ask text,
  value numeric,
  status text not null default 'New' check (status in ('New','Awaiting Response','Replied','Converted','Dead')),
  converted_project_id uuid,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  "from" text not null check ("from" in ('them','me')),
  body text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists lead_messages_lead_id_idx on lead_messages(lead_id);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  name text not null,
  kind text,
  status text not null default 'Scheduled',
  started date,
  due date,
  fee numeric,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_client_id_idx on projects(client_id);

alter table leads add constraint leads_converted_project_id_fkey
  foreign key (converted_project_id) references projects(id) on delete set null;

create table if not exists project_deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists project_deliverables_project_id_idx on project_deliverables(project_id);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  amount numeric not null,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue')),
  stripe_payment_link_id text,
  stripe_payment_intent_id text,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invoices_client_id_idx on invoices(client_id);
create index if not exists invoices_project_id_idx on invoices(project_id);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  client_id uuid references clients(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_client_id_idx on notes(client_id);
create index if not exists notes_project_id_idx on notes(project_id);
create index if not exists notes_lead_id_idx on notes(lead_id);

create table if not exists design_briefs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  business text,
  need jsonb not null default '[]'::jsonb,
  about text,
  "where" text,
  when_date date,
  flexible boolean not null default false,
  assets text,
  copy text,
  refs text,
  notes text,
  budget text,
  status text not null default 'new' check (status in ('new','answered')),
  converted_lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create table if not exists design_brief_attachments (
  id uuid primary key default gen_random_uuid(),
  design_brief_id uuid not null references design_briefs(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  content_type text,
  created_at timestamptz not null default now()
);
create index if not exists design_brief_attachments_brief_id_idx on design_brief_attachments(design_brief_id);

alter table campaigns enable row level security;
alter table links enable row level security;
alter table docket_tasks enable row level security;
alter table generated_content enable row level security;
alter table clients enable row level security;
alter table leads enable row level security;
alter table lead_messages enable row level security;
alter table projects enable row level security;
alter table project_deliverables enable row level security;
alter table invoices enable row level security;
alter table notes enable row level security;
alter table design_briefs enable row level security;
alter table design_brief_attachments enable row level security;
alter table wick_sessions enable row level security;
alter table wick_memory enable row level security;
alter table wick_messages enable row level security;
alter table wick_actions enable row level security;

create policy "Public read access" on campaigns for select using (true);
create policy "Public read access" on links for select using (true);
create policy "Public read access" on docket_tasks for select using (true);
create policy "Public read access" on generated_content for select using (true);
create policy "Public read access" on clients for select using (true);
create policy "Public read access" on leads for select using (true);
create policy "Public read access" on lead_messages for select using (true);
create policy "Public read access" on projects for select using (true);
create policy "Public read access" on project_deliverables for select using (true);
create policy "Public read access" on invoices for select using (true);
create policy "Public read access" on notes for select using (true);
create policy "Public read access" on design_briefs for select using (true);
create policy "Public read access" on design_brief_attachments for select using (true);
