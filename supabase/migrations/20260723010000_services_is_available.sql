-- getAvailableServices() (packages/database) filters on services.is_available, but that column
-- was never actually added to the live services table — this closes that gap. Default true so
-- every existing listing stays visible; owners can toggle it off from Services/Inventory later.
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true;
