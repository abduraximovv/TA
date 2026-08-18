-- Adds bulk exclusion to search_available_services for the multi-day itinerary builder
-- (POST /api/v1/ai/plan-trip): the day-by-day generateObject() loop was only telling the model
-- "already used: <ids>" as a prompt instruction, which the LLM was observed ignoring (e.g.
-- scheduling the same Heliskiing service on multiple days). Filtering already-used IDs out of
-- the candidate set itself, at the RPC level, makes repetition structurally impossible instead
-- of relying on the model to comply -- it can't pick an id it's never shown.
--
-- Additive alongside the existing single p_exclude_id (still used by GET /api/v1/ai/search-services,
-- unaffected).
--
-- CREATE OR REPLACE FUNCTION cannot add a parameter to an existing signature in place -- Postgres
-- treats a changed parameter list as a distinct overload, so a bare OR REPLACE here would leave
-- both the old 6-arg and new 7-arg versions coexisting, and the GRANT below would then fail with
-- "function name is not unique" (an unqualified GRANT can't tell the two overloads apart). The
-- explicit DROP first is required, not optional, for this specific kind of signature change.
DROP FUNCTION IF EXISTS public.search_available_services(text, text, numeric, uuid, date, int);

CREATE OR REPLACE FUNCTION public.search_available_services(
    p_category text DEFAULT NULL,
    p_region text DEFAULT NULL,
    p_max_price numeric DEFAULT NULL,
    p_exclude_id uuid DEFAULT NULL,
    p_travel_date date DEFAULT NULL,
    p_limit int DEFAULT 5,
    p_exclude_ids uuid[] DEFAULT NULL
)
RETURNS SETOF public.services
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT s.*
    FROM public.services s
    WHERE s.is_available = true
      AND (p_category IS NULL OR s.category = p_category)
      AND (p_region IS NULL OR s.region ILIKE '%' || p_region || '%')
      AND (p_max_price IS NULL OR s.price <= p_max_price)
      AND (p_exclude_id IS NULL OR s.id <> p_exclude_id)
      AND (p_exclude_ids IS NULL OR NOT (s.id = ANY(p_exclude_ids)))
      AND (
        p_travel_date IS NULL
        OR NOT EXISTS (
          SELECT 1 FROM public.service_inventory si
          WHERE si.service_id = s.id AND si.available_date = p_travel_date
        )
        OR EXISTS (
          SELECT 1 FROM public.service_inventory si
          WHERE si.service_id = s.id AND si.available_date = p_travel_date
          GROUP BY si.service_id
          HAVING bool_and(NOT si.is_blocked) AND sum(si.total_capacity - si.booked_capacity) > 0
        )
      )
    ORDER BY s.rating_avg DESC NULLS LAST
    LIMIT greatest(p_limit, 0);
$$;

GRANT EXECUTE ON FUNCTION public.search_available_services TO anon, authenticated;
