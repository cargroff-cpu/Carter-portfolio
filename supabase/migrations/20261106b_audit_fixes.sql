-- 20261106b_audit_fixes.sql — from the 2026-11-06 operations audit.
--
-- APPLIED 2026-11-06 via the Supabase MCP (safe with both the old and the
-- new code, so it did not need to wait for the deploy). Safe to re-run.
--
-- 1. site_content allows row 2. api/save-content.js writes the Scaffold
--    page's content (/backroom/scaffold → ?page=scaffold) to id 2 and
--    design.jsx reads id 2, but the table only allowed id 1, so every
--    Scaffold-page publish failed.
-- 2. Drops three design_briefs columns nothing reads (ip_hash, details, and
--    triage_at, a duplicate of triaged_at). The table had 0 rows.
-- 3. Indexes the three foreign keys the Supabase advisor flagged.

-- 1. -----------------------------------------------------------------------
alter table site_content drop constraint if exists site_content_single_row;
alter table site_content add constraint site_content_single_row check (id in (1, 2));

-- 2. -----------------------------------------------------------------------
drop index if exists design_briefs_ip_hash_created_idx;
alter table design_briefs drop column if exists ip_hash;
alter table design_briefs drop column if exists details;
alter table design_briefs drop column if exists triage_at;

-- 3. -----------------------------------------------------------------------
create index if not exists jobs_brief_idx on jobs(brief_id);
create index if not exists jobs_client_idx on jobs(client_id);
create index if not exists design_briefs_job_idx on design_briefs(job_id);
