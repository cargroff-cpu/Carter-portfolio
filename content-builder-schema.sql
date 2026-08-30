-- content-builder-schema.sql — SUPERSEDED. The Scaffold Supabase project
-- this originally targeted (kvgeimwitzdlstagqumw) was deleted; this table
-- was recreated in the one remaining project as part of
-- supabase-schema.sql, which is now the source of truth. Kept here only for
-- history — do not run this file, run supabase-schema.sql instead if you
-- ever need to rebuild from scratch (it's already applied and live).

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
