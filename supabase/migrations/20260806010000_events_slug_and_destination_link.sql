-- /events/[slug] needs stable, human-readable URLs -- events never had one (only a raw uuid id).
-- Nullable + unique (not NOT NULL) since existing rows need a backfill pass before any constraint
-- can be tightened; the seed script populates it going forward for every row it creates.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- destination_id already existed but was never populated by the seed script -- events had no way
-- to cross-link back to the /discover/[slug] page for the city they're actually in.
CREATE INDEX IF NOT EXISTS idx_events_destination_id ON public.events(destination_id);
