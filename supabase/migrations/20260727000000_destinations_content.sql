-- Extend destinations for a blog-style detail page (existing columns stay as the
-- landing-page carousel summary: description = short blurb, image_url/hero_image_url = cover).
ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[] NOT NULL DEFAULT '{}';

-- Visitor opinions on a destination. Unlike public.reviews, these are not tied to a booking --
-- destinations aren't a bookable product, so anyone who's created an account can leave one.
CREATE TABLE IF NOT EXISTS public.destination_reviews (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete cascade not null,
  tourist_id uuid references auth.users(id) not null,
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text not null,
  created_at timestamptz default now()
);

ALTER TABLE public.destination_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destination reviews are publicly readable"
ON public.destination_reviews FOR SELECT
USING (true);

CREATE POLICY "Tourists can write their own destination reviews"
ON public.destination_reviews FOR INSERT
WITH CHECK (tourist_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_destination_reviews_destination ON public.destination_reviews(destination_id);
