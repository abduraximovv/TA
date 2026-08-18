-- Adds pagination to match_relevant_packages() for the "Find another option" carousel button --
-- SafronCoordinator.tsx calls this with p_offset = packages.length, p_limit = 1 to fetch exactly
-- one NEW package it hasn't already shown, rather than re-fetching packages.length + 1 rows and
-- discarding all but the last one every click (which would re-transfer the full nested `items`
-- jsonb payload for every already-shown package repeatedly -- the token/bandwidth waste this
-- whole feature branch has been explicitly trying to avoid).
--
-- CORRECTION (learned by actually running this): CREATE OR REPLACE is NOT safe here without a
-- DROP first. Postgres function identity includes the parameter list -- (text,text,int) and
-- (text,text,int,int) are two DIFFERENT functions, not one being replaced, so CREATE OR REPLACE
-- alone leaves the old 3-arg overload standing alongside the new 4-arg one. The very next
-- statement (a bare GRANT EXECUTE ON FUNCTION public.match_relevant_packages, no argument list)
-- then fails with "function name is not unique" because Postgres can't tell which overload it
-- means -- confirmed by actually applying this migration once and watching it fail exactly that
-- way. Dropping the old signature explicitly first is what makes this a true replace instead of
-- an overload.
DROP FUNCTION IF EXISTS public.match_relevant_packages(text, text, int);

CREATE OR REPLACE FUNCTION public.match_relevant_packages(
    p_category text DEFAULT NULL,
    p_region    text DEFAULT NULL,
    p_limit     int  DEFAULT 3,
    p_offset    int  DEFAULT 0
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
    -- Same fully-deterministic order as before (this is what makes OFFSET pagination stable
    -- across calls -- no two rows can tie on all three keys since created_at is effectively
    -- unique per package, so a given offset always lands on the same row for the same filters).
    CASE WHEN (p_category IS NULL AND p_region IS NULL) THEN scored.item_count ELSE scored.match_score END DESC,
    scored.item_count DESC, scored.created_at DESC
  LIMIT greatest(p_limit, 0)
  OFFSET greatest(p_offset, 0);
$$;

GRANT EXECUTE ON FUNCTION public.match_relevant_packages TO anon, authenticated;
