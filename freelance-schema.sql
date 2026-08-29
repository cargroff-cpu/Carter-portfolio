-- freelance-schema.sql — Business Hub CRM + Design-briefs inbox. Run once
-- against the Scaffold Supabase project (kvgeimwitzdlstagqumw), in the SQL
-- editor, same as content-builder-schema.sql. Not applied automatically:
-- this session's tools have no reachable Supabase access, so a human (or a
-- future session with access) has to run it by hand before the Business Hub
-- can save or read anything.
--
-- Mirrors the existing tables' pattern: RLS on, anon key gets read-only
-- access, all writes go through api/scaffold-write.js with the service-role
-- key (which bypasses RLS). design_briefs/design_brief_attachments are the
-- one exception — they're also written by api/design-brief.js (a public,
-- unauthenticated endpoint) using the same service-role key, since the
-- person submitting a brief has no Scaffold session.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  email text,
  since date,
  prefers text,
  rate numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  email text,
  source text,
  ask text,
  value numeric,
  status text not null default 'New' check (status in ('New','Awaiting Response','Replied','Converted','Dead')),
  converted_project_id uuid,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  "from" text not null check ("from" in ('them','me')),
  body text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists lead_messages_lead_id_idx on lead_messages(lead_id);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  name text not null,
  kind text,
  status text not null default 'Scheduled',
  started date,
  due date,
  fee numeric,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_client_id_idx on projects(client_id);

alter table leads add constraint leads_converted_project_id_fkey
  foreign key (converted_project_id) references projects(id) on delete set null;

create table if not exists project_deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists project_deliverables_project_id_idx on project_deliverables(project_id);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  amount numeric not null,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue')),
  stripe_payment_link_id text,
  stripe_payment_intent_id text,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invoices_client_id_idx on invoices(client_id);
create index if not exists invoices_project_id_idx on invoices(project_id);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  client_id uuid references clients(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_client_id_idx on notes(client_id);
create index if not exists notes_project_id_idx on notes(project_id);
create index if not exists notes_lead_id_idx on notes(lead_id);

create table if not exists design_briefs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  business text,
  need jsonb not null default '[]'::jsonb,
  about text,
  "where" text,
  when_date date,
  flexible boolean not null default false,
  assets text,
  copy text,
  refs text,
  notes text,
  budget text,
  status text not null default 'new' check (status in ('new','answered')),
  converted_lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create table if not exists design_brief_attachments (
  id uuid primary key default gen_random_uuid(),
  design_brief_id uuid not null references design_briefs(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  content_type text,
  created_at timestamptz not null default now()
);
create index if not exists design_brief_attachments_brief_id_idx on design_brief_attachments(design_brief_id);

alter table clients enable row level security;
alter table leads enable row level security;
alter table lead_messages enable row level security;
alter table projects enable row level security;
alter table project_deliverables enable row level security;
alter table invoices enable row level security;
alter table notes enable row level security;
alter table design_briefs enable row level security;
alter table design_brief_attachments enable row level security;

create policy "Public read access" on clients for select using (true);
create policy "Public read access" on leads for select using (true);
create policy "Public read access" on lead_messages for select using (true);
create policy "Public read access" on projects for select using (true);
create policy "Public read access" on project_deliverables for select using (true);
create policy "Public read access" on invoices for select using (true);
create policy "Public read access" on notes for select using (true);
create policy "Public read access" on design_briefs for select using (true);
create policy "Public read access" on design_brief_attachments for select using (true);

-- Storage bucket for brief attachments, uploaded by api/design-brief.js with
-- the service-role key. Create it (private, not public) from the dashboard
-- or: select storage.create_bucket('design-briefs', public := false);

-- After running this, add the new table names to ALLOWED_TABLES in
-- api/scaffold-write.js if they aren't already there (they are, as of the
-- commit that added this file).
