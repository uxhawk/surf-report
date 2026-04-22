-- Run in Supabase SQL Editor (once per project).
-- Adds optional default gear links for session logging.

ALTER TABLE boards
  ADD COLUMN IF NOT EXISTS default_fins_id uuid REFERENCES fins(id) ON DELETE SET NULL;

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS default_board_id uuid REFERENCES boards(id) ON DELETE SET NULL;
