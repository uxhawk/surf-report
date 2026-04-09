-- ============================================================
-- SURF TRACKER — SUPABASE SCHEMA
-- Run this in your Supabase project → SQL Editor → New Query
-- ============================================================

-- LOCATIONS
create table if not exists locations (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  description text,
  created_at  timestamptz default now()
);

-- BOARDS
create table if not exists boards (
  id                 uuid          default gen_random_uuid() primary key,
  brand              text          not null,
  model              text          not null,
  length_inches      numeric(5,1)  not null,
  volume             decimal(5,1),
  description        text,
  fin_configurations text[]        not null default '{}',
  picture_url        text,
  archived           boolean       not null default false,
  created_at         timestamptz   default now()
);

-- FINS
create table if not exists fins (
  id          uuid        default gen_random_uuid() primary key,
  brand       text        not null,
  model       text        not null,
  setup       text        not null check (setup in ('Single', 'Twin', 'Thruster', 'Quad')),
  picture_url text,
  archived    boolean     not null default false,
  created_at  timestamptz default now()
);

-- SESSIONS
create table if not exists sessions (
  id          uuid        default gen_random_uuid() primary key,
  date        date        not null,
  location_id uuid        not null references locations(id) on delete restrict,
  board_id    uuid        not null references boards(id)    on delete restrict,
  fins_id     uuid        not null references fins(id)      on delete restrict,
  waves       text        not null,
  notes       text        not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- This is a personal app with no authentication — allow all.
-- If you ever add auth, tighten these policies.
-- ============================================================

alter table locations enable row level security;
alter table boards     enable row level security;
alter table fins       enable row level security;
alter table sessions   enable row level security;

create policy "Public access" on locations for all using (true) with check (true);
create policy "Public access" on boards     for all using (true) with check (true);
create policy "Public access" on fins       for all using (true) with check (true);
create policy "Public access" on sessions   for all using (true) with check (true);

-- ============================================================
-- STORAGE BUCKET FOR GEAR PHOTOS (board/fins images)
--
-- Option A: Create via Supabase Dashboard (recommended)
--   Storage → New Bucket → Name: "gear-photos" → Public: ON
--
-- Option B: Uncomment below to create via SQL
-- ============================================================

-- insert into storage.buckets (id, name, public)
--   values ('gear-photos', 'gear-photos', true)
--   on conflict do nothing;
--
-- create policy "Public gear photos" on storage.objects
--   for all using (bucket_id = 'gear-photos')
--   with check (bucket_id = 'gear-photos');
