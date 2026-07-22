-- Providers/agencies need to manage their own listings from the new dashboards.
-- The live `services` table (packages/database/schema/03_services.sql) only ever got a
-- public-read policy — there was no owner write path at all. Adding one here, scoped to
-- the owning user via `provider_id = auth.uid()` (works for both provider- and
-- agency-authored listings; the column has no role distinction of its own).

DO $$ BEGIN
  CREATE POLICY "Owners can insert their own services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = provider_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can update their own services"
  ON public.services FOR UPDATE
  USING (auth.uid() = provider_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can delete their own services"
  ON public.services FOR DELETE
  USING (auth.uid() = provider_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS services_provider_id_idx ON public.services (provider_id);
