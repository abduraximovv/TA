-- Real-time inventory: upgrades services.is_available (a single on/off switch) to per-date
-- bookable capacity. A service with zero service_inventory rows for a given date is treated as
-- unmanaged/always-open (falls back to the pre-inventory is_available behavior) -- the table
-- starts empty and most providers won't populate a calendar on day one, so hard-requiring a row
-- would silently zero out search results and booking for the entire catalog.
--
-- Booking time-of-day is not currently passed to the backend as a distinct field (SafronCoordinator
-- / ServiceBookingModal / PackageBookingModal all send booking_date as a full ISO timestamp, but
-- bookings.booking_date is a `date` column, so the time-of-day is discarded before it reaches the
-- DB). start_time is kept here for providers who want to model distinct time slots and for future
-- frontend work, but capacity enforcement below operates per (service_id, available_date) --
-- summed across whatever rows exist for that day -- since there's currently no per-slot identifier
-- coming from the client to attribute a booking to one specific time slot.
CREATE TABLE public.service_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    available_date date NOT NULL,
    start_time time, -- NULL = all-day / not time-slotted
    total_capacity int NOT NULL CHECK (total_capacity >= 0),
    booked_capacity int NOT NULL DEFAULT 0 CHECK (booked_capacity >= 0),
    is_blocked boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT service_inventory_capacity_check CHECK (booked_capacity <= total_capacity),
    -- Postgres treats each NULL as distinct, so this does NOT stop two all-day (start_time IS
    -- NULL) rows for the same service/date -- acceptable here since the capacity check below
    -- aggregates across all rows for a day rather than assuming exactly one.
    UNIQUE (service_id, available_date, start_time)
);

CREATE INDEX idx_service_inventory_date ON public.service_inventory (available_date, service_id);

ALTER TABLE public.service_inventory ENABLE ROW LEVEL SECURITY;

-- Public read: search-services/plan-trip need to check capacity for anonymous visitors too (the
-- route's own auth check is currently disabled "for testing" -- see route.ts comments), same
-- public-read posture as services itself.
CREATE POLICY "Anyone can view service inventory"
ON public.service_inventory FOR SELECT
USING (true);

-- Only the owning provider can manage their own service's calendar.
CREATE POLICY "Providers can manage inventory for their own services"
ON public.service_inventory FOR ALL
USING (service_id IN (SELECT id FROM public.services WHERE provider_id = auth.uid()))
WITH CHECK (service_id IN (SELECT id FROM public.services WHERE provider_id = auth.uid()));

-- No auto-updating trigger on updated_at -- matches every other table in this schema (e.g.
-- user_profiles, services), none of which auto-bump it either; app code sets it manually if it
-- ever needs to.

-- ---------------------------------------------------------------------------------------------
-- search_available_services: server-side capacity filter for GET/POST /api/v1/ai/search-services
-- and POST /api/v1/ai/plan-trip. Mirrors searchServices.ts's existing filters (category/region/
-- max_price/exclude_id) plus an optional travel_date. A service passes the date filter if it has
-- no inventory rows for that date at all (unmanaged/open), or if it has at least one non-blocked
-- row and remaining capacity (summed across its rows for that date) is greater than zero.
-- ---------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_available_services(
    p_category text DEFAULT NULL,
    p_region text DEFAULT NULL,
    p_max_price numeric DEFAULT NULL,
    p_exclude_id uuid DEFAULT NULL,
    p_travel_date date DEFAULT NULL,
    p_limit int DEFAULT 5
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

-- ---------------------------------------------------------------------------------------------
-- create_booking_with_capacity_check: the concurrency-safe path for POST /api/v1/bookings when
-- service_id is set (itinerary_id bookings are unaffected -- itineraries have no inventory
-- concept and keep using the plain insert). SECURITY DEFINER so it can lock/update
-- service_inventory rows the calling tourist has no direct UPDATE grant on (RLS above only lets
-- providers write their own inventory) while still inserting into bookings as that tourist --
-- tourist_id is taken from auth.uid() inside the function, never trusted from the caller.
--
-- Row lock (FOR UPDATE) on the matching service_inventory rows is what actually prevents the
-- race described in the "someone booked the last slot 5 seconds ago" scenario: two concurrent
-- calls for the same (service_id, available_date) serialize on that lock, so the second caller's
-- capacity check runs against the first caller's already-applied increment, not a stale read.
-- ---------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_with_capacity_check(
    p_service_id uuid,
    p_booking_date date,
    p_guest_count int,
    p_special_requests text DEFAULT NULL,
    p_passenger_manifest jsonb DEFAULT NULL,
    p_dietary_preferences text DEFAULT NULL,
    p_pickup_location text DEFAULT NULL,
    p_total_price numeric DEFAULT NULL,
    p_currency text DEFAULT 'UZS'
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tourist_id uuid := auth.uid();
    v_provider_id uuid;
    v_row RECORD;
    v_has_inventory boolean := false;
    v_any_blocked boolean := false;
    v_total_remaining int := 0;
    v_to_allocate int;
    v_take int;
    v_booking public.bookings;
BEGIN
    IF v_tourist_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    IF p_guest_count IS NULL OR p_guest_count < 1 THEN
        RAISE EXCEPTION 'guest_count must be at least 1' USING ERRCODE = '22023';
    END IF;

    SELECT provider_id INTO v_provider_id FROM public.services WHERE id = p_service_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not found' USING ERRCODE = 'P0002';
    END IF;

    -- Lock every inventory row for this service/date up front -- a concurrent call for the same
    -- day blocks here until this transaction commits or rolls back, so the loop below never
    -- reads a stale total_capacity/booked_capacity that another in-flight booking is about to
    -- change.
    v_has_inventory := false;
    FOR v_row IN
        SELECT id, total_capacity, booked_capacity, is_blocked
        FROM public.service_inventory
        WHERE service_id = p_service_id AND available_date = p_booking_date
        ORDER BY start_time NULLS FIRST
        FOR UPDATE
    LOOP
        v_has_inventory := true;
        v_any_blocked := v_any_blocked OR v_row.is_blocked;
        v_total_remaining := v_total_remaining + (v_row.total_capacity - v_row.booked_capacity);
    END LOOP;

    IF v_has_inventory THEN
        IF v_any_blocked THEN
            RAISE EXCEPTION 'This date is not available for this service' USING ERRCODE = 'P0001';
        END IF;
        IF v_total_remaining < p_guest_count THEN
            RAISE EXCEPTION 'Not enough capacity left for this date (% requested, % remaining)', p_guest_count, v_total_remaining
                USING ERRCODE = 'P0001';
        END IF;

        -- Spend the requested guest_count across rows in order, never taking more from a single
        -- row than that row itself has free -- keeps every row's own
        -- (booked_capacity <= total_capacity) invariant intact even when a day has several
        -- time-slot rows and only some of them have room. There's no per-slot identifier from
        -- the client to target one specific row directly (see migration header comment), so this
        -- greedy earliest-first allocation is the closest honest approximation of "which slot did
        -- this booking actually take."
        v_to_allocate := p_guest_count;
        FOR v_row IN
            SELECT id, total_capacity, booked_capacity
            FROM public.service_inventory
            WHERE service_id = p_service_id AND available_date = p_booking_date
            ORDER BY start_time NULLS FIRST
            FOR UPDATE
        LOOP
            EXIT WHEN v_to_allocate <= 0;
            v_take := LEAST(v_to_allocate, v_row.total_capacity - v_row.booked_capacity);
            IF v_take > 0 THEN
                UPDATE public.service_inventory
                SET booked_capacity = booked_capacity + v_take
                WHERE id = v_row.id;
                v_to_allocate := v_to_allocate - v_take;
            END IF;
        END LOOP;
    END IF;

    INSERT INTO public.bookings (
        tourist_id, service_id, provider_id, status, booking_date, guest_count,
        special_requests, passenger_manifest, dietary_preferences, pickup_location,
        total_price, currency
    ) VALUES (
        v_tourist_id, p_service_id, v_provider_id, 'pending', p_booking_date, p_guest_count,
        p_special_requests, p_passenger_manifest, p_dietary_preferences, p_pickup_location,
        p_total_price, coalesce(p_currency, 'UZS')
    )
    RETURNING * INTO v_booking;

    RETURN v_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.create_booking_with_capacity_check FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking_with_capacity_check TO authenticated;
