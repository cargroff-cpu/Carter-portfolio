-- 20261107_docket_brand.sql — the Docket no longer tags tasks by brand.
-- docket_tasks was empty when this was written. Safe to re-run.
update docket_tasks set brand = 'me' where brand <> 'me';
alter table docket_tasks drop constraint if exists docket_tasks_brand_check;
alter table docket_tasks alter column brand set default 'me';
alter table docket_tasks add constraint docket_tasks_brand_check check (brand = 'me');
