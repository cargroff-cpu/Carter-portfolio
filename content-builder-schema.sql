-- content-builder-schema.sql — run once against the Scaffold Supabase
-- project (kvgeimwitzdlstagqumw), in the SQL editor. Not applied
-- automatically: whatever Supabase access created `campaigns`/`links`/
-- `docket_tasks` earlier isn't reachable from this session's tools, so this
-- has to be run by hand (or by a future session with access) before the
-- Content Builder screen can save or read pieces.
--
-- Mirrors the existing tables' pattern: RLS on, anon key gets read-only
-- access, all writes go through api/scaffold-write.js with the service-role
-- key (which bypasses RLS).

create table if not exists generated_content (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('ltw', 'sq')),
  kind text not null,
  title text,
  eyebrow text,
  subject text,
  hi text,
  preheader text,
  greeting text,
  body jsonb not null default '[]'::jsonb,
  cta text,
  cta2 text,
  campaign_id text,
  by text not null default 'Builder',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table generated_content enable row level security;

create policy "Public read access" on generated_content
  for select using (true);

-- After running this, add 'generated_content' to ALLOWED_TABLES in
-- api/scaffold-write.js if it isn't already there (it is, as of the commit
-- that added this file).
