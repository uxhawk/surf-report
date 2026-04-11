-- ============================================================
-- SURF TRACKER — AUTH MIGRATION
-- Run this in Supabase → SQL Editor → New Query
--
-- This script:
--   1. Adds a user_id column to every data table
--   2. Assigns ALL existing rows to uxhawk@gmail.com
--   3. Replaces the wide-open RLS policies with user-scoped ones
--   4. Adds a trigger so new rows auto-populate user_id
-- ============================================================

-- Step 1: Look up your auth.users id by email.
-- After you sign up / sign in for the first time, this will resolve.
-- If you haven't signed in yet, create the account first, then run this.

DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM auth.users WHERE email = 'uxhawk@gmail.com';

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found for uxhawk@gmail.com. Sign in first, then re-run this migration.';
  END IF;

  -- Step 2: Add user_id column to each table (nullable at first so we can backfill)
  ALTER TABLE locations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
  ALTER TABLE boards    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
  ALTER TABLE fins      ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
  ALTER TABLE sessions  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

  -- Step 3: Backfill existing rows
  UPDATE locations SET user_id = owner_id WHERE user_id IS NULL;
  UPDATE boards    SET user_id = owner_id WHERE user_id IS NULL;
  UPDATE fins      SET user_id = owner_id WHERE user_id IS NULL;
  UPDATE sessions  SET user_id = owner_id WHERE user_id IS NULL;

  -- Step 4: Make user_id NOT NULL with a default for future inserts
  ALTER TABLE locations ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE locations ALTER COLUMN user_id SET DEFAULT auth.uid();

  ALTER TABLE boards ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE boards ALTER COLUMN user_id SET DEFAULT auth.uid();

  ALTER TABLE fins ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE fins ALTER COLUMN user_id SET DEFAULT auth.uid();

  ALTER TABLE sessions ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE sessions ALTER COLUMN user_id SET DEFAULT auth.uid();

END $$;

-- Step 5: Drop the old wide-open policies
DROP POLICY IF EXISTS "Public access" ON locations;
DROP POLICY IF EXISTS "Public access" ON boards;
DROP POLICY IF EXISTS "Public access" ON fins;
DROP POLICY IF EXISTS "Public access" ON sessions;

-- Step 6: Create user-scoped RLS policies
-- Users can only see/modify their own data

CREATE POLICY "Users see own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own fins"
  ON fins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own fins"
  ON fins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own fins"
  ON fins FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own fins"
  ON fins FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users see own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);
