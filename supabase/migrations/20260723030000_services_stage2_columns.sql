-- tourist-webapp's Stage 2 UI (ServiceCard, service detail page) reads services.rating_avg,
-- rating_count, duration_minutes, max_guests, city, region — none of which exist on the live
-- table (it only ever had avg_rating/reviews_count/location from packages/database/schema/03_services.sql
-- plus the landing-page columns from 20240102000000_landing_page.sql). Adding them additively;
-- backfilling rating_avg/rating_count from the existing avg_rating/reviews_count so seeded
-- ratings aren't lost. Not dropping the old columns — apps/provider-app and apps/agency-portal's
-- Services/Inventory pages (Stage 1) still read avg_rating/reviews_count directly.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(2,1) NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS max_guests INTEGER,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT;

UPDATE public.services
  SET rating_avg = avg_rating,
      rating_count = reviews_count
  WHERE rating_avg = 0.0 AND rating_count = 0;
