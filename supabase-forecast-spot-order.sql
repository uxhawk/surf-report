-- Forecast tab: manual spot ordering.
-- Persists the drag-and-drop order of spot cards on the Forecast tab.
-- Run this in the Supabase SQL editor; until then, reordering still works
-- but only lasts for the current session.

alter table locations add column if not exists sort_order integer;

comment on column locations.sort_order is
  'Manual position of the spot on the Forecast tab (0 = first). Null sorts last, alphabetically.';
