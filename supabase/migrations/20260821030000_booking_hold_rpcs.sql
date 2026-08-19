BEGIN;

-- ===================================================================================================
-- create_package_booking: dedicated single-item entry point for booking one package_departure with
-- an expiring payment hold. Intentionally separate from process_multi_item_booking (per explicit
-- instruction, that function is not touched by this migration) rather than folded into it --
-- process_multi_item_booking's cart items land in 'pending' (a provider still manually
-- accepts/declines, no expiry), whereas this is a distinct workflow: seats are reserved
-- immediately but released automatically if payment doesn't complete within 15 minutes (see
-- release_expired_bookings below). Mixing both status semantics into one shared function would
-- make process_multi_item_booking's behavior depend on which caller invoked it -- a bookings row
-- inserted by this function is never mistaken for one of process_multi_item_booking's by anything
-- downstream, since only THIS function ever produces 'pending_payment'.
--
-- p_tourist_id is deliberately NOT a parameter, unlike the literal request that named one --
-- accepting a caller-supplied tourist id on a SECURITY DEFINER function would let any
-- authenticated caller create bookings (and consume real seat capacity) attributed to an
-- arbitrary other user. Every other booking RPC in this schema (create_booking_with_capacity_check,
-- process_multi_item_booking) derives the tourist from auth.uid() internally for exactly this
-- reason; this function matches that established convention instead of introducing a second,
-- weaker one.
-- ===================================================================================================
CREATE OR REPLACE FUNCTION public.create_package_booking(
    p_departure_id uuid,
    p_guests int,
    p_special_requests text DEFAULT NULL,
    p_passenger_manifest jsonb DEFAULT NULL,
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
    v_departure RECORD;
    v_itinerary_status text;
    v_provider_id uuid;
    v_new_booked int;
    v_new_status text;
    v_booking public.bookings;
BEGIN
    IF v_tourist_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    IF p_guests IS NULL OR p_guests < 1 THEN
        RAISE EXCEPTION 'p_guests must be at least 1' USING ERRCODE = '22023';
    END IF;

    -- Lock the departure row before validating anything against it -- same FOR UPDATE-first
    -- ordering process_multi_item_booking uses for its own package_departure intents, so a
    -- concurrent call through either function against the same departure serializes correctly
    -- instead of racing on a stale read.
    SELECT id, itinerary_id, start_date, max_guests, booked_guests, status
    INTO v_departure
    FROM public.package_departures
    WHERE id = p_departure_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Departure % not found', p_departure_id USING ERRCODE = 'P0002';
    END IF;

    IF v_departure.status <> 'scheduled' THEN
        RAISE EXCEPTION 'Departure % is not open for booking (status %)', p_departure_id, v_departure.status
            USING ERRCODE = 'P0001';
    END IF;

    -- package_departures' own public SELECT policy already excludes draft-itinerary departures,
    -- but this function is SECURITY DEFINER and bypasses RLS entirely -- a tourist who
    -- discovers/guesses a draft departure_id could otherwise still place a paid hold against an
    -- unpublished package. Checked before the capacity UPDATE so a rejected attempt never touches
    -- booked_guests.
    SELECT agency_id, status INTO v_provider_id, v_itinerary_status
    FROM public.itineraries WHERE id = v_departure.itinerary_id;

    IF v_itinerary_status = 'draft' THEN
        RAISE EXCEPTION 'Package is not yet published' USING ERRCODE = 'P0001';
    END IF;

    v_new_booked := v_departure.booked_guests + p_guests;
    IF v_new_booked > v_departure.max_guests THEN
        RAISE EXCEPTION 'Not enough capacity left for departure % (% requested, % remaining)',
            p_departure_id, p_guests, (v_departure.max_guests - v_departure.booked_guests)
            USING ERRCODE = 'P0001';
    END IF;

    v_new_status := CASE WHEN v_new_booked = v_departure.max_guests THEN 'sold_out' ELSE 'scheduled' END;
    UPDATE public.package_departures
    SET booked_guests = v_new_booked, status = v_new_status, updated_at = now()
    WHERE id = p_departure_id;

    INSERT INTO public.bookings (
        tourist_id, service_id, itinerary_id, departure_id, provider_id, status, booking_date,
        guest_count, special_requests, passenger_manifest, total_price, currency
    ) VALUES (
        v_tourist_id, NULL, v_departure.itinerary_id, p_departure_id, v_provider_id, 'pending_payment',
        v_departure.start_date, p_guests, p_special_requests, p_passenger_manifest,
        GREATEST(coalesce(p_total_price, 0), 0), coalesce(p_currency, 'UZS')
    )
    RETURNING * INTO v_booking;

    RETURN v_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.create_package_booking FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_package_booking TO authenticated;

-- ===================================================================================================
-- release_expired_bookings: sweeps 'pending_payment' holds older than 15 minutes, returns their
-- seats to inventory, and marks them 'expired'. Meant to be invoked by pg_cron (see the scheduling
-- block at the end of this file) as the database owner, not by end users -- no GRANT to
-- authenticated/anon below is deliberate (least privilege: nothing about a client needing to
-- trigger a mass-expiry sweep on demand).
--
-- FOR UPDATE ... SKIP LOCKED on the driving query is what makes this safe to run concurrently with
-- a real payment completing at the same moment: if some other transaction is mid-flight updating a
-- given booking (e.g. a payment webhook flipping it to 'accepted' right as this sweep runs), that
-- row is already locked and this loop skips it for now rather than blocking or racing to expire a
-- booking that just succeeded -- it will simply no longer match status = 'pending_payment' on the
-- next run a minute later.
-- ===================================================================================================
CREATE OR REPLACE FUNCTION public.release_expired_bookings()
RETURNS TABLE(released_booking_id uuid, released_kind text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking RECORD;
    v_to_release int;
    v_row RECORD;
    v_take int;
BEGIN
    FOR v_booking IN
        SELECT id, service_id, departure_id, booking_date, guest_count
        FROM public.bookings
        WHERE status = 'pending_payment'
          AND created_at < now() - interval '15 minutes'
        FOR UPDATE SKIP LOCKED
    LOOP
        IF v_booking.departure_id IS NOT NULL THEN
            -- Precise release: create_package_booking always stamps departure_id, so there is
            -- exactly one row to credit back, no ambiguity even if the itinerary has several
            -- scheduled departures.
            UPDATE public.package_departures
            SET booked_guests = GREATEST(booked_guests - v_booking.guest_count, 0),
                status = CASE WHEN status = 'sold_out' THEN 'scheduled' ELSE status END,
                updated_at = now()
            WHERE id = v_booking.departure_id;

        ELSIF v_booking.service_id IS NOT NULL THEN
            -- service_inventory pools capacity across possibly several rows per service+date with
            -- no per-booking row attribution (see create_booking_with_capacity_check's own greedy
            -- allocation, which spends across rows earliest-start_time-first with nothing recorded
            -- about which row a given booking's guests came from). Releasing in that same order is
            -- the closest available approximation of undoing this specific booking's allocation.
            -- Dormant in practice today: nothing currently inserts a service booking with
            -- status = 'pending_payment' (create_booking_with_capacity_check and
            -- process_multi_item_booking both use plain 'pending', which never expires), so this
            -- branch is here ready for if/when a service-side hold flow is added, not because it
            -- fires today.
            v_to_release := v_booking.guest_count;
            FOR v_row IN
                SELECT id, booked_capacity
                FROM public.service_inventory
                WHERE service_id = v_booking.service_id AND available_date = v_booking.booking_date
                ORDER BY start_time NULLS FIRST
                FOR UPDATE
            LOOP
                EXIT WHEN v_to_release <= 0;
                v_take := LEAST(v_to_release, v_row.booked_capacity);
                IF v_take > 0 THEN
                    UPDATE public.service_inventory
                    SET booked_capacity = booked_capacity - v_take
                    WHERE id = v_row.id;
                    v_to_release := v_to_release - v_take;
                END IF;
            END LOOP;
        END IF;

        UPDATE public.bookings SET status = 'expired', updated_at = now() WHERE id = v_booking.id;

        released_booking_id := v_booking.id;
        released_kind := CASE WHEN v_booking.departure_id IS NOT NULL THEN 'package_departure' ELSE 'service' END;
        RETURN NEXT;
    END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.release_expired_bookings FROM PUBLIC;

-- ===================================================================================================
-- cancel_booking: lets the tourist who made a booking cancel it themselves and atomically returns
-- whatever seats it held. There is currently no RLS UPDATE policy letting a tourist modify their
-- own bookings row at all (the only existing UPDATE policy, "Providers can update bookings", is
-- scoped to auth.uid() = provider_id) -- this SECURITY DEFINER function is what actually lets a
-- tourist cancel, re-checking ownership internally rather than relying on a broader RLS grant that
-- would also need to police status transitions.
--
-- p_user_id is likewise not a parameter for the same reason p_tourist_id isn't on
-- create_package_booking above -- ownership is checked against auth.uid(), never a caller-supplied
-- id.
-- ===================================================================================================
CREATE OR REPLACE FUNCTION public.cancel_booking(
    p_booking_id uuid
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id uuid := auth.uid();
    v_booking RECORD;
    v_to_release int;
    v_row RECORD;
    v_take int;
    v_result public.bookings;
BEGIN
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    SELECT id, tourist_id, service_id, departure_id, booking_date, guest_count, status
    INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking % not found', p_booking_id USING ERRCODE = 'P0002';
    END IF;

    IF v_booking.tourist_id <> v_caller_id THEN
        RAISE EXCEPTION 'Not authorized to cancel this booking' USING ERRCODE = '42501';
    END IF;

    IF v_booking.status IN ('cancelled', 'declined', 'expired', 'completed') THEN
        RAISE EXCEPTION 'Booking is already %, cannot cancel', v_booking.status USING ERRCODE = 'P0001';
    END IF;

    IF v_booking.departure_id IS NOT NULL THEN
        UPDATE public.package_departures
        SET booked_guests = GREATEST(booked_guests - v_booking.guest_count, 0),
            status = CASE WHEN status = 'sold_out' THEN 'scheduled' ELSE status END,
            updated_at = now()
        WHERE id = v_booking.departure_id;

    ELSIF v_booking.service_id IS NOT NULL THEN
        -- Same pooled-capacity release approximation as release_expired_bookings above.
        v_to_release := v_booking.guest_count;
        FOR v_row IN
            SELECT id, booked_capacity
            FROM public.service_inventory
            WHERE service_id = v_booking.service_id AND available_date = v_booking.booking_date
            ORDER BY start_time NULLS FIRST
            FOR UPDATE
        LOOP
            EXIT WHEN v_to_release <= 0;
            v_take := LEAST(v_to_release, v_row.booked_capacity);
            IF v_take > 0 THEN
                UPDATE public.service_inventory
                SET booked_capacity = booked_capacity - v_take
                WHERE id = v_row.id;
                v_to_release := v_to_release - v_take;
            END IF;
        END LOOP;
    END IF;

    UPDATE public.bookings SET status = 'cancelled', updated_at = now()
    WHERE id = p_booking_id
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_booking FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_booking TO authenticated;

COMMIT;

-- ===================================================================================================
-- pg_cron scheduling -- NOT included above because enabling a new extension is a bigger-blast-radius
-- change than the functions themselves; run this separately once you've confirmed pg_cron is
-- available on this project's plan (Database > Extensions in the Supabase dashboard, or the SQL
-- below). Idempotent: safe to re-run, replaces any existing job with this name instead of creating
-- a duplicate.
-- ===================================================================================================
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
--
-- DO $$
-- BEGIN
--   PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'release-expired-bookings';
-- EXCEPTION WHEN undefined_table THEN NULL; -- cron.job doesn't exist yet on a fresh pg_cron install
-- END $$;
--
-- SELECT cron.schedule(
--   'release-expired-bookings',
--   '* * * * *', -- every minute
--   $$ SELECT public.release_expired_bookings(); $$
-- );
