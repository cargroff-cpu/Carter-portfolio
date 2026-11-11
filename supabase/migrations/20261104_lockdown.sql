-- 20261104_lockdown.sql — from the 2026-11-04 assessment.
--
-- APPLIED: confirmed on the live database 2026-11-11. The note below is from before it ran.
-- NOT APPLIED YET. Run it in the Supabase SQL editor (or via the Supabase
-- MCP) only AFTER the code on this branch is deployed to production. The
-- Business Hub and the Docket now read through /api/scaffold-read; if you
-- run this first, they lose their reads until that deploy is live.
--
-- 1. Drops every "Public read access" policy except site_content's (the
--    public portfolio's own content, which the site reads with the anon key).
--    The anon key is committed in data.jsx, so until this runs anyone can
--    read every lead, client, invoice, note and brief.
-- 2. Adds the columns the new brief route and AI triage write.
-- 3. Adds brief_events (a log of every brief attempt, success or failure).
-- 4. Creates a private storage bucket for brief uploads.
-- Safe to re-run.

-- 1. Lock down -----------------------------------------------------------
drop policy if exists "Public read access" on campaigns;
drop policy if exists "Public read access" on links;
drop policy if exists "Public read access" on docket_tasks;
drop policy if exists "Public read access" on generated_content;
drop policy if exists "Public read access" on clients;
drop policy if exists "Public read access" on leads;
drop policy if exists "Public read access" on lead_messages;
drop policy if exists "Public read access" on projects;
drop policy if exists "Public read access" on project_deliverables;
drop policy if exists "Public read access" on invoices;
drop policy if exists "Public read access" on notes;
drop policy if exists "Public read access" on design_briefs;
drop policy if exists "Public read access" on design_brief_attachments;
-- RLS stays enabled on all of them with no policies: anon gets nothing,
-- the service-role key (server routes only) bypasses RLS.

-- 2. Brief columns -------------------------------------------------------
alter table design_briefs add column if not exists reference text;
alter table design_briefs add column if not exists lane text not null default 'design';
alter table design_briefs add column if not exists auto_slow text;
alter table design_briefs add column if not exists auto_tools text;
alter table design_briefs add column if not exists auto_who text;
alter table design_briefs add column if not exists attachment_count integer not null default 0;
alter table design_briefs add column if not exists triage jsonb;
alter table design_briefs add column if not exists triaged_at timestamptz;
do $$ begin
  alter table design_briefs add constraint design_briefs_lane_check check (lane in ('design','automation'));
exception when duplicate_object then null; end $$;
create unique index if not exists design_briefs_reference_idx on design_briefs(reference) where reference is not null;

-- 3. Event log -----------------------------------------------------------
create table if not exists brief_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null,
  ok boolean not null default true,
  reference text,
  detail text,
  ip text
);
create index if not exists brief_events_created_idx on brief_events(created_at desc);
alter table brief_events enable row level security;

-- 4. Upload bucket (private: no public URL, service role only) -----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brief-uploads', 'brief-uploads', false, 2621440,
  array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','application/pdf'])
on conflict (id) do nothing;
