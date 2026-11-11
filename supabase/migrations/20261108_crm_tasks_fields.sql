-- 20261108_crm_tasks_fields.sql — follow-up tasks, client custom fields,
-- and a lookup index for duplicate checks. Business Hub CRM features.
--
-- APPLIED: confirmed on the live database 2026-11-11. The note below is from before it ran.
-- NOT APPLIED. Review it, then run it in the Supabase SQL editor. The Hub
-- works without it: Tasks shows a "set up" note, and client custom fields
-- stay hidden until the column exists. Safe to re-run.

-- 1. Follow-up tasks ------------------------------------------------------
-- A task can hang off a job, a client, both, or neither.
create table if not exists crm_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  job_id uuid references jobs(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  due_on date,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_tasks_open_idx on crm_tasks(due_on) where done_at is null;
create index if not exists crm_tasks_job_idx on crm_tasks(job_id);
create index if not exists crm_tasks_client_idx on crm_tasks(client_id);
-- Locked down like every other table: RLS on, no policies. Only the server
-- routes (service-role key) read or write it.
alter table crm_tasks enable row level security;

-- 2. Custom fields on clients --------------------------------------------
-- A small object of label -> value, e.g. {"Instagram": "@reyesplumbing"}.
alter table clients add column if not exists custom jsonb not null default '{}'::jsonb;

-- 3. Duplicate lookups ----------------------------------------------------
-- Not unique: existing duplicates would make a unique index fail, and the
-- Hub's merge tool is how they get cleaned up.
create index if not exists clients_email_lower_idx on clients (lower(email)) where email is not null;
