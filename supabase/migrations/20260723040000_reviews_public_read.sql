-- Reviews are meant to be publicly visible on service/package pages (that's the point of a
-- reviews feature — helping other tourists decide) but the original shared-contract migration
-- only let a tourist read their own review or a business read reviews on their own bookings.
-- That silently made the "Reviews" section on /service/[id] and /packages/[id] empty for
-- everyone, since those pages render server-side with no user session attached. Adding public
-- read, matching the existing pattern on services/itineraries.
DO $$ BEGIN
  CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
