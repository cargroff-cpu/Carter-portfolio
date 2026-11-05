-- 20261106_workflow.sql — the Scaffold's job workflow (brief to paid).
--
-- NOT APPLIED YET. Apply it right before the code on this branch goes live
-- (the new Back Room reads these tables). Every table it drops was empty on
-- 2026-11-06 (checked row counts), so nothing is lost. Safe to re-run.
--
-- One job carries a piece of work from brief to paid:
--   new -> proposed -> drafts -> final -> paid   (closed = dropped)
-- The client moves it along from a private link (/j/<token>): accept the
-- proposal, pick a direction, approve or ask for changes, pay.
-- Billing per job: 'split' (50% deposit on accept, 50% on approval) or
-- 'end' (one invoice on approval). No card fee.

create extension if not exists pgcrypto;

-- 1. Retire empty tables the workflow replaces ---------------------------
-- leads/lead_messages/projects/project_deliverables/notes -> jobs and
-- job_events; campaigns/links/generated_content and wick_* belonged to the
-- retired marketing board and Wick.
alter table if exists invoices drop column if exists project_id;
alter table if exists design_briefs drop column if exists converted_lead_id;
drop table if exists lead_messages cascade;
drop table if exists project_deliverables cascade;
drop table if exists notes cascade;
drop table if exists leads cascade;
drop table if exists projects cascade;
drop table if exists campaigns cascade;
drop table if exists links cascade;
drop table if exists generated_content cascade;
drop table if exists wick_actions cascade;
drop table if exists wick_messages cascade;
drop table if exists wick_memory cascade;
drop table if exists wick_sessions cascade;

-- 2. Jobs -----------------------------------------------------------------
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  brief_id uuid references design_briefs(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  name text not null,
  email text,
  business text,
  lane text not null default 'design' check (lane in ('design', 'automation')),
  stage text not null default 'new' check (stage in ('new', 'proposed', 'drafts', 'final', 'paid', 'closed')),
  billing text not null default 'split' check (billing in ('split', 'end')),
  revisions_included integer not null default 2,
  revisions_used integer not null default 0,
  picked_file_id uuid,
  approved_at timestamptz,
  notes text,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jobs_stage_idx on jobs(stage);
alter table design_briefs add column if not exists job_id uuid references jobs(id) on delete set null;

-- 3. Proposals (one live proposal per job; a resend replaces it) -----------
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  summary text,
  items jsonb not null default '[]'::jsonb,   -- [{ "label": "...", "amount": 0 }]
  timeline text,
  terms text,
  total numeric not null default 0,
  billing text not null default 'split' check (billing in ('split', 'end')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists proposals_job_idx on proposals(job_id);

-- 4. Files: drafts (directions) and finals, uploaded or linked -------------
create table if not exists job_files (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  kind text not null check (kind in ('draft', 'final')),
  round integer not null default 1,
  label text,
  url text,
  storage_path text,
  filename text,
  content_type text,
  created_at timestamptz not null default now(),
  check (url is not null or storage_path is not null)
);
create index if not exists job_files_job_idx on job_files(job_id);

-- 5. The job's history: emails sent, client actions, notes ----------------
create table if not exists job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  kind text not null,
  who text not null default 'system' check (who in ('me', 'client', 'system')),
  body text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists job_events_job_idx on job_events(job_id, created_at desc);

-- 6. Invoices belong to a job --------------------------------------------
alter table invoices add column if not exists job_id uuid references jobs(id) on delete set null;
alter table invoices add column if not exists label text;
alter table invoices add column if not exists stripe_url text;
create index if not exists invoices_job_idx on invoices(job_id);

-- Brief attachments can now come from two buckets: the small images/PDFs
-- (brief-uploads) and the optional large tool plan (brief-plans).
alter table design_brief_attachments add column if not exists bucket text not null default 'brief-uploads';

-- 7. Locked down like everything else: RLS on, no policies. Only the
-- server routes (service-role key) read or write these.
alter table jobs enable row level security;
alter table proposals enable row level security;
alter table job_files enable row level security;
alter table job_events enable row level security;

-- 8. Private storage: job files (drafts/finals) and large brief plans.
insert into storage.buckets (id, name, public, file_size_limit)
values ('job-files', 'job-files', false, 52428800)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brief-plans', 'brief-plans', false, 26214400, array[
  'application/pdf', 'application/zip', 'text/plain', 'text/csv', 'image/png', 'image/jpeg',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do nothing;
