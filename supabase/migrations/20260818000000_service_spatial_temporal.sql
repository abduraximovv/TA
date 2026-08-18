-- Adds the spatial-temporal metadata the Phase 2 "CRITICAL PLANNING ALGORITHM" system prompt
-- rules (TIME MATH, GEOFENCE, GASTRONOMY) depend on.
--
-- Live schema check before writing this (see packages/database/src/types.ts / the services
-- Service interface, and confirmed again live against the deployed DB): duration_minutes,
-- latitude, and longitude already exist on public.services --
-- duration_minutes INTEGER was added by 20260723030000_services_stage2_columns.sql, and
-- latitude/longitude NUMERIC were added by 20260806000000_map_coordinates.sql. Re-adding them
-- would be a silent no-op at best (with IF NOT EXISTS) or an error at worst (without it) --
-- neither is what was actually needed. Only `neighborhood` is genuinely new.
--
-- latitude/longitude are NUMERIC here, not float8/DOUBLE PRECISION -- matching the existing
-- column type exactly rather than converting it. NUMERIC is already populated on all current
-- rows (0 NULLs, confirmed live) and works identically for coordinate storage; changing an
-- already-populated column's type on a live table is unnecessary risk for zero functional gain
-- here, so this migration does not touch them.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS neighborhood text;

-- duration_minutes already exists but is nullable with no default -- tightening it to the
-- NOT NULL DEFAULT 120 the AI planner rules assume. Safe to do directly (no backfill migration
-- needed): confirmed live that all 26 existing rows already have a non-null duration_minutes.
-- The UPDATE below is pure defensive insurance against a NULL slipping in between that check and
-- this migration actually running (e.g. a concurrent insert) -- it should affect zero rows.
UPDATE public.services SET duration_minutes = 120 WHERE duration_minutes IS NULL;

ALTER TABLE public.services
  ALTER COLUMN duration_minutes SET DEFAULT 120;

ALTER TABLE public.services
  ALTER COLUMN duration_minutes SET NOT NULL;
