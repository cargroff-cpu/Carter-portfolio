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
-- Pattern: RLS on everywhere, no public-read policies (see the bottom of
-- this file). All reads go through api/scaffold-read.js and all writes
-- through api/scaffold-write.js with the service-role key, which bypasses RLS.
-- design_briefs/design_brief_attachments are also written by
-- api/design-brief.js (public, unauthenticated) with the same service-role
-- key, since a brief submitter has no Scaffold session. wick_memory/
-- wick_sessions/wick_messages/wick_actions get RLS with NO select policy —
-- service-role key only, zero anon access, matching api/wick-memory.js's
-- documented intent.


create table if not exists docket_tasks (
  id uuid primary key default gen_random_uuid(),
  brand text not null default 'me' check (brand = 'me'),
  q text not null check (q in ('q1','q2','q3','q4')),
  t text not null,
  due date,
  made date not null default current_date,
  rank integer default 0,
  done boolean not null default false,
  created_at timestamptz not null default now()
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

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
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
alter table docket_tasks enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table design_briefs enable row level security;
alter table design_brief_attachments enable row level security;

-- No public-read policies on any of the tables above (dropped 2026-11-04,
-- supabase/migrations/20261104_lockdown.sql). RLS is on with no policies, so
-- the anon key reads nothing; the Backroom reads via /api/scaffold-read and
-- writes via /api/scaffold-write, both with the service-role key behind the
-- session check. The only anon-readable table is site_content (the public
-- portfolio's content), which is managed outside this file.
--
-- The old leads, projects, campaigns, links, notes, Wick and Content Builder
-- tables were dropped 2026-11-06 and are no longer described here. Jobs,
-- proposals, job files and job events are in
-- supabase/migrations/20261106_workflow.sql.

-- Added 2026-11-04 (same migration): brief columns for the new brief route
-- and AI triage, the brief_events log, and the private brief-uploads bucket.
alter table design_briefs add column if not exists reference text;
alter table design_briefs add column if not exists lane text not null default 'design';
alter table design_briefs add column if not exists auto_slow text;
alter table design_briefs add column if not exists auto_tools text;
alter table design_briefs add column if not exists auto_who text;
alter table design_briefs add column if not exists attachment_count integer not null default 0;
alter table design_briefs add column if not exists triage jsonb;
alter table design_briefs add column if not exists triaged_at timestamptz;

create table if not exists brief_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null,
  ok boolean not null default true,
  reference text,
  detail text,
  ip text
);
alter table brief_events enable row level security;
