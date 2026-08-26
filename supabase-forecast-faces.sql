-- Forecast tab: beach orientation per spot.
-- Used to judge offshore vs onshore wind on the Forecast tab.
-- Run this in the Supabase SQL editor before saving spots with a "Faces" value.

alter table locations add column if not exists faces_degrees integer;

comment on column locations.faces_degrees is
  'Compass direction the spot faces, in degrees (0=N, 90=E, 180=S, 270=W). Null = assume west-facing.';
