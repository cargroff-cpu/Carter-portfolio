-- 20261107b_crm_upgrades.sql — CRM upgrades for the Backroom.
--
-- NOT APPLIED YET. Apply it right before the code that reads these columns
-- goes live (the Business Hub, Docket and api/scaffold-write.js use them).
-- Safe to re-run; nothing is dropped and no rows are deleted.
--
-- 1. Activity on clients, not only jobs: job_events.client_id, and job_id
--    may now be empty (a call logged on a client who has no job yet).
-- 2. Tasks tied to a job or client, with an auto_key so the follow-ups the
--    Backroom creates itself (proposal nudge, invoice chase, brief reply)
--    are never duplicated.
-- 3. Why a job closed (close_reason, closed_at) and where a client came from
--    (clients.source).
-- 4. One client per email address. Existing emails are lower-cased first.
--    If two clients already share an email the unique index is skipped with
--    a notice; merge them in the Backroom (Clients > the client > Merge)
--    and re-run this file.

-- 1. -------------------------------------------------------------------
alter table job_events alter column job_id drop not null;
alter table job_events add column if not exists client_id uuid references clients(id) on delete cascade;
create index if not exists job_events_client_idx on job_events(client_id, created_at desc);
alter table job_events drop constraint if exists job_events_target_check;
alter table job_events add constraint job_events_target_check check (job_id is not null or client_id is not null);

-- 2. -------------------------------------------------------------------
alter table docket_tasks add column if not exists job_id uuid references jobs(id) on delete cascade;
alter table docket_tasks add column if not exists client_id uuid references clients(id) on delete cascade;
alter table docket_tasks add column if not exists auto_key text;
create unique index if not exists docket_tasks_auto_key_idx on docket_tasks(auto_key);
create index if not exists docket_tasks_job_idx on docket_tasks(job_id);
create index if not exists docket_tasks_client_idx on docket_tasks(client_id);

-- 3. -------------------------------------------------------------------
alter table jobs add column if not exists close_reason text;
alter table jobs add column if not exists closed_at timestamptz;
update jobs set closed_at = updated_at where stage = 'closed' and closed_at is null;
alter table clients add column if not exists source text;

-- 4. -------------------------------------------------------------------
update clients set email = nullif(lower(btrim(email)), '') where email is distinct from nullif(lower(btrim(email)), '');
do $$
begin
  if exists (select email from clients where email is not null group by email having count(*) > 1) then
    raise notice 'Duplicate client emails exist; unique index on clients(email) skipped. Merge them in the Backroom, then re-run.';
  else
    create unique index if not exists clients_email_key on clients(email) where email is not null;
  end if;
end $$;
