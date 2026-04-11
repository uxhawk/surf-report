-- ============================================================
-- SURF TRACKER — SUPABASE SCHEMA
-- Run this in your Supabase project → SQL Editor → New Query
-- ============================================================

-- LOCATIONS
create table if not exists locations (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        not null default auth.uid() references auth.users(id),
  name        text        not null,
  description text,
  archived    boolean     not null default false,
  created_at  timestamptz default now()
);

-- BOARDS
create table if not exists boards (
  id                 uuid          default gen_random_uuid() primary key,
  user_id            uuid          not null default auth.uid() references auth.users(id),
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
  user_id     uuid        not null default auth.uid() references auth.users(id),
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
  user_id     uuid        not null default auth.uid() references auth.users(id),
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
-- Each user can only access their own data.
-- ============================================================

alter table locations enable row level security;
alter table boards     enable row level security;
alter table fins       enable row level security;
alter table sessions   enable row level security;

-- Locations
create policy "Users see own locations"    on locations for select using (auth.uid() = user_id);
create policy "Users insert own locations" on locations for insert with check (auth.uid() = user_id);
create policy "Users update own locations" on locations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own locations" on locations for delete using (auth.uid() = user_id);

-- Boards
create policy "Users see own boards"    on boards for select using (auth.uid() = user_id);
create policy "Users insert own boards" on boards for insert with check (auth.uid() = user_id);
create policy "Users update own boards" on boards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own boards" on boards for delete using (auth.uid() = user_id);

-- Fins
create policy "Users see own fins"    on fins for select using (auth.uid() = user_id);
create policy "Users insert own fins" on fins for insert with check (auth.uid() = user_id);
create policy "Users update own fins" on fins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own fins" on fins for delete using (auth.uid() = user_id);

-- Sessions
create policy "Users see own sessions"    on sessions for select using (auth.uid() = user_id);
create policy "Users insert own sessions" on sessions for insert with check (auth.uid() = user_id);
create policy "Users update own sessions" on sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own sessions" on sessions for delete using (auth.uid() = user_id);

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
