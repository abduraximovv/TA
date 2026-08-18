-- package_showcase.sql
-- Part A: RLS fix for itineraries/itinerary_items (required for package matching to work for
-- non-owner tourists). Mirrors the idempotent pattern in 20260723040000_reviews_public_read.sql.
-- Side-effect fix: bookings/route.ts resolves provider_id for package bookings via
-- supabase.from('itineraries').select('agency_id') on the tourist's bearer-token client --
-- today that SELECT is blocked by RLS (only agency_id = auth.uid() exists), silently leaving
-- provider_id = null on every package booking. This migration fixes that as a side effect.
DO $$ BEGIN
  CREATE POLICY "Non-draft itineraries are publicly readable"
  ON public.itineraries FOR SELECT
  USING (status <> 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Items of non-draft itineraries are publicly readable"
  ON public.itinerary_items FOR SELECT
  USING (itinerary_id IN (SELECT id FROM public.itineraries WHERE status <> 'draft'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Part B: match_relevant_packages RPC
-- Matches agency packages (itineraries with agency_id set) to the AI's resolved region/category.
-- Scoring: +2 for region match (city/region ILIKE), +1 for category match; require score > 0.
-- Returns nothing if neither filter supplied (mirrors plan-trip's own ready_to_search gate).
-- Returns one row per package with BOTH card-summary AND full nested items -- zero extra fetch
-- required to open the detail sheet on the client.
-- Pattern: plain sql STABLE function, no SECURITY DEFINER (public read RLS already open),
-- GRANT to anon, authenticated -- matches search_available_services style.
CREATE OR REPLACE FUNCTION public.match_relevant_packages(
    p_category text DEFAULT NULL,
    p_region    text DEFAULT NULL,
    p_limit     int  DEFAULT 3
)
RETURNS TABLE (
    id           uuid,
    title        text,
    description  text,
    start_date   date,
    end_date     date,
    total_price  numeric,
    currency     text,
    agency_id    uuid,
    agency_name  text,
    image_url    text,
    cities       text[],
    item_count   int,
    match_score  int,
    items        jsonb
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH candidate_items AS (
    SELECT
      ii.itinerary_id,
      ii.id,
      ii.title,
      ii.description,
      ii.price,
      ii.sort_order,
      s.id         AS service_id,
      s.title      AS service_title,
      s.image_url  AS service_image,
      s.category   AS service_category,
      s.city       AS service_city,
      s.region     AS service_region
    FROM public.itinerary_items ii
    LEFT JOIN public.services s ON s.id = ii.service_id
  ),
  scored AS (
    SELECT
      i.id,
      i.title,
      i.description,
      i.start_date,
      i.end_date,
      i.total_price,
      i.currency,
      i.agency_id,
      i.created_at,
      COUNT(ci.id)::int AS item_count,
      (
        CASE WHEN p_region IS NOT NULL AND bool_or(
          ci.service_city   ILIKE '%' || p_region || '%'
          OR ci.service_region ILIKE '%' || p_region || '%'
        ) THEN 2 ELSE 0 END
        +
        CASE WHEN p_category IS NOT NULL AND bool_or(ci.service_category = p_category) THEN 1 ELSE 0 END
      ) AS match_score,
      array_remove(array_agg(DISTINCT ci.service_city), NULL)                              AS cities,
      (array_agg(ci.service_image ORDER BY ci.sort_order) FILTER (WHERE ci.service_image IS NOT NULL))[1] AS image_url,
      jsonb_agg(
        jsonb_build_object(
          'id',          ci.id,
          'service_id',  ci.service_id,
          'title',       coalesce(ci.service_title, ci.title),
          'description', ci.description,
          'price',       ci.price,
          'image_url',   ci.service_image
        )
        ORDER BY ci.sort_order
      ) AS items
    FROM public.itineraries i
    JOIN candidate_items ci ON ci.itinerary_id = i.id
    WHERE i.status <> 'draft'
      AND i.agency_id IS NOT NULL
    GROUP BY i.id
  )
  SELECT
    scored.id,
    scored.title,
    scored.description,
    scored.start_date,
    scored.end_date,
    scored.total_price,
    scored.currency,
    scored.agency_id,
    up.full_name     AS agency_name,
    scored.image_url,
    scored.cities,
    scored.item_count,
    scored.match_score,
    scored.items
  FROM scored
  LEFT JOIN public.user_profiles up ON up.id = scored.agency_id
  WHERE (p_category IS NULL AND p_region IS NULL) OR (scored.match_score > 0)
  ORDER BY
    /* Targeted search: best match first. Broad/inspirational search: biggest packages first */
    CASE WHEN (p_category IS NULL AND p_region IS NULL) THEN scored.item_count ELSE scored.match_score END DESC,
    scored.item_count DESC, scored.created_at DESC
  LIMIT greatest(p_limit, 0);
$$;

GRANT EXECUTE ON FUNCTION public.match_relevant_packages TO anon, authenticated;
