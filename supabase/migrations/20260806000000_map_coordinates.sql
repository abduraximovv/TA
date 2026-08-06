-- The /map page plots destinations, services (experiences), and events together on one
-- Leaflet map. Destinations already carry latitude/longitude (20260102 landing-page migration);
-- services and events never did, so there was nothing to plot but destinations. Adding the same
-- nullable NUMERIC pair to both, matching the destinations column types exactly.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;
