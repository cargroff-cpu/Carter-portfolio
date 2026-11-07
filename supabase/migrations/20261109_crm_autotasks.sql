-- 20261109_crm_autotasks.sql — lets the Backroom put follow-up tasks into
-- crm_tasks itself (reply to a brief, nudge a proposal, chase an invoice).
--
-- NOT APPLIED. Run it right after 20261108_crm_tasks_fields.sql, which
-- creates crm_tasks. Until both are run the automatic tasks are simply not
-- created (nothing else breaks). Safe to re-run.
--
-- auto_key makes each automatic task unique ("prop:<job id>"), so sending a
-- proposal twice reopens one task instead of adding two. Tasks written by
-- hand have no auto_key and are never touched by the automation.
alter table crm_tasks add column if not exists auto_key text;
create unique index if not exists crm_tasks_auto_key_idx on crm_tasks(auto_key);
