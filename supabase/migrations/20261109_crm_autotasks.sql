-- 20261109_crm_autotasks.sql — lets the Backroom put follow-up tasks into
-- crm_tasks itself (reply to a brief, nudge a proposal, chase an invoice).
--
-- APPLIED 2026-11-11 via the Supabase MCP, during the workflow audit: the
-- column was missing on the live database, so every automatic follow-up was
-- failing without a sound. crm_tasks was empty. Safe to re-run.
--
-- auto_key makes each automatic task unique ("prop:<job id>"), so sending a
-- proposal twice reopens one task instead of adding two. Tasks written by
-- hand have no auto_key and are never touched by the automation.
alter table crm_tasks add column if not exists auto_key text;
create unique index if not exists crm_tasks_auto_key_idx on crm_tasks(auto_key);
