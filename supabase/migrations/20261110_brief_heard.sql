-- 20261110_brief_heard.sql — "How did you hear about me?" on the brief form.
-- APPLIED 2026-11-07 via the Supabase MCP. Safe to re-run.
-- Holds a source value (referral, social, search, event, repeat, other); the
-- Backroom copies it to the client's "Came from" field.
alter table design_briefs add column if not exists heard text;
