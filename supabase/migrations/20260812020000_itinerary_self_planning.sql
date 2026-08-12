-- Lets a tourist save an AI-generated itinerary ("Save to My Trips" on the Itinerary Canvas
-- generator) as their own, alongside the existing agency-curated flow. Today itineraries.agency_id
-- is the *only* ownership column, with RLS scoped entirely to "agency_id = auth.uid()" -- a
-- tourist has no way to create or own one directly. tourist_id is the mirror of agency_id: both
-- nullable, mutually exclusive in practice (self-planned trips have no agency, agency-curated
-- trips have no tourist_id -- tourists are linked to those via bookings.itinerary_id instead).
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS tourist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Tourists can read/write their own self-planned itineraries"
ON public.itineraries FOR ALL
USING (tourist_id = auth.uid());

CREATE POLICY "Tourists can read/write items on their own self-planned itineraries"
ON public.itinerary_items FOR ALL
USING (itinerary_id IN (SELECT id FROM public.itineraries WHERE tourist_id = auth.uid()));

-- itinerary_items previously only carried (title, price, sort_order) -- enough for an agency
-- linking a real service_id, but not enough to preserve what the AI actually generates (a time,
-- a free-text description, a named location, and which day of the trip it falls on). All
-- nullable/additive -- existing agency-authored items are unaffected.
ALTER TABLE public.itinerary_items ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.itinerary_items ADD COLUMN IF NOT EXISTS location_name text;
ALTER TABLE public.itinerary_items ADD COLUMN IF NOT EXISTS scheduled_time text;
ALTER TABLE public.itinerary_items ADD COLUMN IF NOT EXISTS day_number int;

CREATE INDEX IF NOT EXISTS itineraries_tourist_id_idx ON public.itineraries (tourist_id);
