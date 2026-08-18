-- slot_engine_and_departures.sql
--
-- Part A: time-slot overlap enforcement on the EXISTING service_inventory table (see
-- 20260816000000_service_inventory.sql). The product decision here is deliberate: extend
-- service_inventory rather than introduce a parallel service_slots table, so there is exactly
-- one capacity system in this schema instead of two that could disagree with each other.
--
-- Part B: package_departures -- a genuinely new concept (fixed, capacity-limited departure
-- dates for an agency package/itinerary). Nothing like this exists today: PackageBookingModal
-- currently lets a tourist book ANY date freely with zero capacity concept.
--
-- Part C: process_multi_item_booking -- one atomic RPC that can book a mix of services and
-- package departures in a single transaction, so a multi-item cart either fully succeeds or
-- fully rolls back (the whole reason to prefer this over firing N separate REST calls). Includes
-- a global cross-table lock-order sweep (kept consistent with the pre-existing
-- create_booking_with_capacity_check's own lock order), a follow-up re-gather sweep that closes
-- the gather-then-lock race window, a per-request item cap, malformed-intent guards, and a
-- draft-itinerary booking guard, all per review hardening (see inline comments below).
-- ---------------------------------------------------------------------------------------------

-- =================================================================================================
-- PART A: service_inventory time-slot overlap constraint
-- =================================================================================================

-- Needed for the EXCLUDE USING gist constraint below: gist itself has no native equality operator
-- class for uuid/date, only for range/geometric types. btree_gist supplies "btree-compatible"
-- operator classes for uuid/date so they can be combined with the tsrange && operator inside one
-- multicolumn gist index/exclusion constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.service_inventory ADD COLUMN end_time time; -- NULL = all-day / not time-slotted, same convention as start_time

-- Data-cleanup pass, required before either new constraint below can be added safely: end_time
-- has just been added and is NULL on every pre-existing row, so any legacy row that already has a
-- non-null start_time would fail the pair check below outright, and would feed a NULL upper bound
-- into the exclusion constraint's tsrange() (an unbounded range that collides with everything else
-- for that service+date). Per this table's own header comment, booking time-of-day isn't even
-- passed from the client today, so no legacy start_time value represents a real, product-facing
-- time slot yet -- null it out so such rows fall back to the all-day/unslotted convention (both
-- columns NULL) instead of tripping either constraint below. This is the "null out start_time on
-- legacy rows" cleanup option, chosen over backfilling end_time since there is no non-arbitrary
-- duration to backfill it with.
UPDATE public.service_inventory SET start_time = NULL WHERE start_time IS NOT NULL AND end_time IS NULL;

-- start_time/end_time must be set as a pair: a real time-slot row needs both to define a range,
-- an all-day/unslotted row (start_time IS NULL, per the original table comment) must leave
-- end_time NULL too so it never gets swept into the overlap check below.
--
-- Added NOT VALID and validated as a separate step below: ADD CONSTRAINT ... NOT VALID skips the
-- initial full-table scan against existing rows (so this statement itself can never abort the
-- migration on unexpected pre-existing data, even on top of the cleanup pass above), while still
-- enforcing the constraint against every new/updated row immediately. VALIDATE CONSTRAINT then
-- performs the after-the-fact check of existing rows as its own explicit step.
ALTER TABLE public.service_inventory
    ADD CONSTRAINT service_inventory_slot_pair_check
    CHECK ((start_time IS NULL) = (end_time IS NULL)) NOT VALID;

ALTER TABLE public.service_inventory VALIDATE CONSTRAINT service_inventory_slot_pair_check;

-- Prevents two rows for the SAME service+date from claiming overlapping exact time ranges (e.g.
-- 10:00-11:00 and 10:30-11:30 for the same tour on the same day). '[)' (inclusive start,
-- exclusive end) is used so back-to-back slots like 10:00-11:00 and 11:00-12:00 do NOT count as
-- overlapping. Deliberately scoped to `WHERE start_time IS NOT NULL` (equivalently end_time IS
-- NOT NULL, per the pair check above) -- all-day/unslotted rows carry no time range to compare
-- and, per the header comment on the original table, Postgres already permits more than one such
-- row for a service+date (capacity is summed across them), so they must stay outside this
-- constraint entirely rather than colliding with each other or with real slots.
--
-- Unlike the CHECK constraint above, this EXCLUDE constraint cannot be declared NOT VALID --
-- Postgres only accepts that clause for CHECK and FOREIGN KEY constraints; an exclusion
-- constraint's enforcement mechanism IS its GiST index, and building that index necessarily scans
-- and covers every existing row, so there is no equivalent "add now, validate later" split for
-- it. The cleanup pass above (rather than NOT VALID) is what keeps this synchronous ADD
-- CONSTRAINT safe against pre-existing data.
ALTER TABLE public.service_inventory
    ADD CONSTRAINT service_inventory_no_time_overlap
    EXCLUDE USING gist (
        service_id WITH =,
        available_date WITH =,
        tsrange(available_date + start_time, available_date + end_time, '[)') WITH &&
    )
    WHERE (start_time IS NOT NULL);

-- No changes to service_inventory's RLS policies -- the existing public-read /
-- provider-owns-service-write policies from 20260816000000_service_inventory.sql already cover
-- this column (RLS is row-scoped, not column-scoped) and are correct as-is.

-- =================================================================================================
-- PART B: package_departures
-- =================================================================================================

CREATE TABLE public.package_departures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id uuid NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    max_guests int NOT NULL CHECK (max_guests >= 0),
    booked_guests int NOT NULL DEFAULT 0 CHECK (booked_guests >= 0),
    -- 'sold_out' is a derived-but-persisted convenience flag (see process_multi_item_booking,
    -- which flips it automatically once booked_guests reaches max_guests) rather than something
    -- computed on every read, so a plain "status = 'scheduled'" filter is enough for callers.
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sold_out', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT package_departures_date_range_check CHECK (end_date >= start_date),
    CONSTRAINT package_departures_capacity_check CHECK (booked_guests <= max_guests)
);

-- Matches service_inventory's own idx_service_inventory_date: the lookup this table exists to
-- serve is "departures for itinerary X, soonest first / within a date range".
CREATE INDEX idx_package_departures_itinerary_date ON public.package_departures (itinerary_id, start_date);

ALTER TABLE public.package_departures ENABLE ROW LEVEL SECURITY;

-- No auto-updating trigger on updated_at -- same convention as service_inventory and every other
-- table in this schema; app code sets it manually if it ever needs to.

-- Idempotent DO-block pattern (mirrors 20260816010000_package_showcase.sql / the
-- 20260723040000_reviews_public_read.sql it cites) so this migration can be safely re-run.
--
-- Also gated on the parent itinerary's status, matching the exact convention already established
-- in 20260816010000_package_showcase.sql ("Non-draft itineraries are publicly readable" /
-- "Items of non-draft itineraries are publicly readable", both gated on `status <> 'draft'`): an
-- agency can create package_departures rows for a draft itinerary while still configuring it
-- (schedule dates before hitting publish), and without this join those rows -- start_date,
-- end_date, max_guests, booked_guests -- would be publicly visible before the package goes live.
DO $$ BEGIN
    CREATE POLICY "Anyone can view non-cancelled departures"
    ON public.package_departures FOR SELECT
    USING (
        status <> 'cancelled'
        AND itinerary_id IN (SELECT id FROM public.itineraries WHERE status <> 'draft')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Same ownership-via-join pattern as itinerary_items' "Owners can read/write their own itinerary
-- items" policy in 20260723000000_stage2_core.sql. Deliberately left unfiltered by draft status
-- (unlike the public policy above) -- owners must still see/manage their own draft-stage
-- departures.
DO $$ BEGIN
    CREATE POLICY "Agencies can manage departures for their own itineraries"
    ON public.package_departures FOR ALL
    USING (itinerary_id IN (SELECT id FROM public.itineraries WHERE agency_id = auth.uid()))
    WITH CHECK (itinerary_id IN (SELECT id FROM public.itineraries WHERE agency_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =================================================================================================
-- PART C: process_multi_item_booking
--
-- Single SECURITY DEFINER entry point for booking a cart that mixes service intents and package-
-- departure intents in one all-or-nothing transaction. SECURITY DEFINER for the same reason as
-- create_booking_with_capacity_check: it needs to lock/update service_inventory and
-- package_departures rows the calling tourist has no direct UPDATE grant on, while still
-- inserting into bookings as that tourist -- tourist_id comes from auth.uid() inside the
-- function, never trusted from the caller. Because SECURITY DEFINER bypasses RLS entirely, this
-- function re-checks anything RLS would otherwise have gated (e.g. the parent itinerary's draft
-- status for a package_departure intent -- see pass 3 below) rather than relying on the calling
-- role's policies.
--
-- Returns SETOF public.bookings (not jsonb): every inserted row is a real public.bookings row,
-- so returning the table's own composite type keeps the RPC's result shape identical to (and
-- reusable with) existing PostgREST/Supabase client typing for bookings, with no hand-written
-- jsonb_build_object shape to keep in sync as the bookings table evolves.
-- =================================================================================================
CREATE OR REPLACE FUNCTION public.process_multi_item_booking(
    p_intents jsonb
)
RETURNS SETOF public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tourist_id uuid := auth.uid();
    v_idx int;
    v_intent jsonb;
    v_kind text;
    v_guest_count int;

    -- Cross-table, cross-intent lock plan. Each element is {"tbl": "inventory" | "departure",
    -- "id": uuid, ...}. Inventory elements additionally carry service_id/available_date/
    -- start_time so pass 2 can sort them the same way create_booking_with_capacity_check does
    -- (see the locking-order comment below). See the locking-order comment below for why this is
    -- built up front instead of locking rows as each intent is processed.
    v_lock_targets jsonb := '[]'::jsonb;
    v_lock_row RECORD;

    -- Pass-2b bookkeeping (closes the gather-then-lock race -- see the comment block above pass
    -- 2b below). v_locked_inventory_ids tracks every service_inventory row id this transaction
    -- has locked so far (across pass 2 and any completed pass-2b sweep); v_service_date_pairs
    -- holds the distinct service_id+booking_date pairs from the cart's service intents that
    -- pass 2b re-gathers against.
    v_locked_inventory_ids uuid[] := ARRAY[]::uuid[];
    v_service_date_pairs jsonb;
    v_iter int;
    v_new_lock_count int;

    -- service-intent working variables
    v_service_id uuid;
    v_booking_date date;
    v_provider_id uuid;
    v_row RECORD;
    v_has_inventory boolean;
    v_any_blocked boolean;
    v_total_remaining int;
    v_to_allocate int;
    v_take int;

    -- package_departure-intent working variables
    v_departure_id uuid;
    v_departure RECORD;
    v_itinerary_status text;
    v_new_booked int;
    v_new_status text;

    -- Booking rows to insert are queued here and only written in a single batched INSERT after
    -- every intent in the whole array has passed validation (see step 6 in the migration task /
    -- the comment above the final INSERT for why this is still safe to do per-intent capacity-
    -- wise even though the INSERT itself is deferred).
    v_booking_payloads jsonb := '[]'::jsonb;
BEGIN
    IF v_tourist_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
    END IF;

    IF p_intents IS NULL OR jsonb_typeof(p_intents) <> 'array' OR jsonb_array_length(p_intents) = 0 THEN
        RAISE EXCEPTION 'p_intents must be a non-empty JSON array' USING ERRCODE = '22023';
    END IF;

    -- Bound worst-case lock contention/duration a single (even legitimately authenticated) caller
    -- can force this SECURITY DEFINER function into: nothing else here limits how many rows one
    -- call can end up locking in one transaction.
    IF jsonb_array_length(p_intents) > 50 THEN
        RAISE EXCEPTION 'Too many items in one booking request (max 50)' USING ERRCODE = '22023';
    END IF;

    -- -------------------------------------------------------------------------------------------
    -- Pass 1: resolve every intent to the specific row id(s) it will need to lock, WITHOUT
    -- locking anything yet. For a package_departure intent that's just its own departure_id; for
    -- a service intent it's whatever service_inventory rows currently exist for that
    -- service_id+booking_date (there can be several -- see the greedy-allocation comment in
    -- 20260816000000_service_inventory.sql). This pass also rejects obviously malformed intents
    -- (wrong/missing shape) before anything is locked.
    -- -------------------------------------------------------------------------------------------
    FOR v_idx, v_intent IN
        SELECT (t.ordinality - 1)::int, t.value
        FROM jsonb_array_elements(p_intents) WITH ORDINALITY AS t(value, ordinality)
        ORDER BY t.ordinality
    LOOP
        -- A bare string/number/array/etc element would otherwise make v_intent->>'kind' silently
        -- return NULL, falling through to a confusing "unknown kind \"\"" error below instead of
        -- clearly naming the real problem.
        IF jsonb_typeof(v_intent) <> 'object' THEN
            RAISE EXCEPTION 'Item %: expected a JSON object, got %', v_idx, jsonb_typeof(v_intent)
                USING ERRCODE = '22023';
        END IF;

        v_kind := v_intent->>'kind';

        IF v_kind = 'service' THEN
            IF v_intent->>'service_id' IS NULL OR v_intent->>'booking_date' IS NULL OR v_intent->>'guest_count' IS NULL THEN
                RAISE EXCEPTION 'Item %: service intents require service_id, booking_date, guest_count', v_idx
                    USING ERRCODE = '22023';
            END IF;

            v_lock_targets := v_lock_targets || coalesce(
                (SELECT jsonb_agg(jsonb_build_object(
                     'tbl', 'inventory',
                     'id', si.id,
                     'service_id', si.service_id,
                     'available_date', si.available_date,
                     'start_time', si.start_time
                 ))
                 FROM public.service_inventory si
                 WHERE si.service_id = (v_intent->>'service_id')::uuid
                   AND si.available_date = (v_intent->>'booking_date')::date),
                '[]'::jsonb
            );

        ELSIF v_kind = 'package_departure' THEN
            IF v_intent->>'departure_id' IS NULL OR v_intent->>'guest_count' IS NULL THEN
                RAISE EXCEPTION 'Item %: package_departure intents require departure_id, guest_count', v_idx
                    USING ERRCODE = '22023';
            END IF;

            v_lock_targets := v_lock_targets || jsonb_build_object('tbl', 'departure', 'id', (v_intent->>'departure_id')::uuid);

        ELSE
            RAISE EXCEPTION 'Item %: unknown kind "%" (expected "service" or "package_departure")', v_idx, v_kind
                USING ERRCODE = '22023';
        END IF;

        IF (v_intent->>'guest_count')::int < 1 THEN
            RAISE EXCEPTION 'Item %: guest_count must be at least 1', v_idx USING ERRCODE = '22023';
        END IF;
    END LOOP;

    -- Distinct service_id+booking_date pairs among the cart's service intents, gathered once here
    -- so pass 2b's re-gather sweep below doesn't need to re-walk p_intents on every iteration.
    SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object(
               'service_id', elem->>'service_id',
               'booking_date', elem->>'booking_date'
           )), '[]'::jsonb)
    INTO v_service_date_pairs
    FROM jsonb_array_elements(p_intents) elem
    WHERE elem->>'kind' = 'service';

    -- -------------------------------------------------------------------------------------------
    -- Pass 2: lock every resolved row, across BOTH tables, in one consistent global order before
    -- touching anything else.
    --
    -- Why this matters: if we instead locked rows per-intent in array order, two concurrent
    -- multi-item bookings that happen to share two rows (e.g. cart A = [service X, service Y],
    -- cart B = [service Y, service X]) could each lock their first row and then block waiting for
    -- the other's first row -- a classic lock-ordering deadlock. Postgres's deadlock detector
    -- would eventually kill one of them, but that's an avoidable failure under normal concurrent
    -- load, not just a rare edge case, once carts can contain more than one item. Locking every
    -- row this transaction will ever need, all up front, in the SAME deterministic order that
    -- every other call of this function also uses, means two transactions can never be waiting on
    -- each other in a cycle: whichever one reaches the lower-ordered row first proceeds, and the
    -- other simply queues behind it for that one row.
    --
    -- Inventory rows are sorted by (service_id, available_date, start_time NULLS FIRST, id) --
    -- NOT bare id -- because the pre-existing, still-live create_booking_with_capacity_check (see
    -- 20260816000000_service_inventory.sql, still called for every single-item service booking)
    -- locks the rows for one service_id+available_date group in `ORDER BY start_time NULLS
    -- FIRST`. Sorting by id instead would make this function's relative lock order within a
    -- service+date group unrelated to that older function's order (ids are gen_random_uuid()),
    -- so a concurrent single-item call and a multi-item call touching the same two rows could
    -- lock them in opposite order and deadlock -- exactly the failure class this sweep exists to
    -- eliminate, except failing to defend against the older RPC it has to coexist with in
    -- production. Matching its ORDER BY exactly (id only breaks ties within an identical
    -- start_time, which create_booking_with_capacity_check doesn't otherwise order, so it's safe
    -- to add here too) closes that gap. package_departures rows have no pre-existing lock-order
    -- convention elsewhere in the schema to match, so sorting those by id alone is sufficient.
    --
    -- DISTINCT is used because the same row can legitimately appear twice in v_lock_targets (e.g.
    -- two intents in the same cart both target the same service_id+booking_date); locking the
    -- same row twice in one transaction is a harmless no-op re-lock, but there's no reason to do
    -- it twice.
    -- -------------------------------------------------------------------------------------------
    FOR v_lock_row IN
        SELECT DISTINCT
            (elem->>'id')::uuid AS id,
            (elem->>'service_id')::uuid AS service_id,
            (elem->>'available_date')::date AS available_date,
            (elem->>'start_time')::time AS start_time
        FROM jsonb_array_elements(v_lock_targets) elem
        WHERE elem->>'tbl' = 'inventory'
        ORDER BY service_id, available_date, start_time NULLS FIRST, id
    LOOP
        PERFORM 1 FROM public.service_inventory WHERE id = v_lock_row.id FOR UPDATE;
        v_locked_inventory_ids := array_append(v_locked_inventory_ids, v_lock_row.id);
    END LOOP;

    FOR v_lock_row IN
        SELECT DISTINCT (elem->>'id')::uuid AS id
        FROM jsonb_array_elements(v_lock_targets) elem
        WHERE elem->>'tbl' = 'departure'
        ORDER BY id
    LOOP
        PERFORM 1 FROM public.package_departures WHERE id = v_lock_row.id FOR UPDATE;
    END LOOP;

    -- -------------------------------------------------------------------------------------------
    -- Pass 2b: close the pass1-to-pass2 gather/lock race. Pass 1 gathered candidate
    -- service_inventory row ids WITHOUT locking anything; pass 2 then locked exactly that
    -- resolved set. In the window between those two passes, a third party (e.g. the provider
    -- adding a new slot) could insert a brand-new service_inventory row for a service_id+date
    -- already in this cart -- a row that was never part of pass 2's sorted lock sweep. Left
    -- alone, that straggler row would only get FOR UPDATE'd later in pass 3, at a position
    -- determined by cart/array order rather than the global sort, reintroducing the exact
    -- array-order deadlock the sweep above exists to prevent (two concurrent carts each picking
    -- up straggler rows for the same two service+date groups in opposite array order).
    --
    -- Each sweep below gathers ALL not-yet-locked straggler rows across EVERY distinct
    -- service_id+booking_date pair in the cart into ONE combined result set -- a single query
    -- joining v_service_date_pairs against service_inventory -- and locks that combined set in
    -- ONE (service_id, available_date, start_time NULLS FIRST, id) order, mirroring pass 2's own
    -- structure exactly. This matters because a per-pair loop (locking one pair's stragglers
    -- fully before moving to the next pair) would only guarantee ordering WITHIN each pair, not
    -- ACROSS pairs: the order in which pairs themselves are visited would come from
    -- v_service_date_pairs's own jsonb_agg(DISTINCT ...) construction, which carries no ORDER BY
    -- and so is an implementation detail of jsonb comparison, not something this function can
    -- prove anything about. For a cart spanning multiple service+date groups, two concurrent
    -- transactions could then visit those groups in opposite orders and deadlock on their
    -- straggler rows -- exactly the failure class pass 2's single global sweep exists to rule
    -- out for the rows it locks, so pass 2b has to gather-then-sort-then-lock as one combined
    -- set, the same shape, rather than sort-then-lock separately per pair.
    --
    -- Repeat: a row inserted after this sweep started but before it finished locking everything
    -- would itself be a new straggler. Capped at 5 iterations as a hard safety bound -- in
    -- practice this converges after at most one extra iteration, since once a row is locked by
    -- this transaction no one else can insert a colliding (service_id, available_date,
    -- start_time) row without first waiting on this transaction to commit or roll back (the
    -- original table's own UNIQUE(service_id, available_date, start_time) still applies).
    -- -------------------------------------------------------------------------------------------
    v_iter := 0;
    LOOP
        v_iter := v_iter + 1;
        v_new_lock_count := 0;

        FOR v_lock_row IN
            SELECT DISTINCT
                si.id AS id,
                si.service_id AS service_id,
                si.available_date AS available_date,
                si.start_time AS start_time
            FROM jsonb_array_elements(v_service_date_pairs) AS pair
            JOIN public.service_inventory si
              ON si.service_id = (pair->>'service_id')::uuid
             AND si.available_date = (pair->>'booking_date')::date
            WHERE NOT (si.id = ANY (v_locked_inventory_ids))
            ORDER BY si.service_id, si.available_date, si.start_time NULLS FIRST, si.id
        LOOP
            PERFORM 1 FROM public.service_inventory WHERE id = v_lock_row.id FOR UPDATE;
            v_locked_inventory_ids := array_append(v_locked_inventory_ids, v_lock_row.id);
            v_new_lock_count := v_new_lock_count + 1;
        END LOOP;

        EXIT WHEN v_new_lock_count = 0 OR v_iter >= 5;
    END LOOP;

    -- -------------------------------------------------------------------------------------------
    -- Pass 3: validate each intent against the now-locked rows and, for the ones that pass,
    -- update service_inventory/package_departures capacity IMMEDIATELY (not deferred) and queue
    -- the booking row to insert.
    --
    -- Capacity mutations cannot be deferred to after this loop the way the final bookings INSERT
    -- is: if two intents in the SAME cart target the same service_id+booking_date (or the same
    -- departure_id), the second intent's validation must see the first intent's consumption, or
    -- both could independently pass a capacity check that only holds for one of them alone.
    -- Applying each intent's UPDATE inside this same transaction, before moving on to the next
    -- intent, is what makes that work -- Postgres MVCC guarantees a later statement in the same
    -- transaction always sees that transaction's own prior writes. Only the bookings table INSERT
    -- itself is deferred to a single batched statement after this loop (see below), since nothing
    -- about ITS ordering affects capacity correctness.
    --
    -- IMPORTANT: do not wrap this loop's body (or any individual intent's logic) in its own
    -- BEGIN/EXCEPTION block. The entire point of this RPC over firing separate REST calls per
    -- item is that the whole cart is one atomic transaction: a RAISE EXCEPTION anywhere below
    -- aborts this ENTIRE function and rolls back every row this call has touched so far,
    -- automatically, as standard Postgres/PL/pgSQL behavior. Catching an individual intent's
    -- exception here to let the other intents through would silently turn this into "best effort,
    -- partial success" and break that guarantee.
    --
    -- Re-selecting rows here (rather than FOR UPDATE'ing them the first time) is safe because
    -- every row this loop touches was already locked in pass 2/2b -- a plain read of a row this
    -- transaction already holds a lock on cannot observe a concurrent change from anywhere else.
    -- The service-intent loops below still re-issue FOR UPDATE (mirroring
    -- create_booking_with_capacity_check exactly), which is a harmless no-op re-lock for rows
    -- pass 2/2b already locked and the only way any row from a service+date NOT present anywhere
    -- in v_service_date_pairs (there is none, by construction) could ever get locked.
    -- -------------------------------------------------------------------------------------------
    FOR v_idx, v_intent IN
        SELECT (t.ordinality - 1)::int, t.value
        FROM jsonb_array_elements(p_intents) WITH ORDINALITY AS t(value, ordinality)
        ORDER BY t.ordinality
    LOOP
        IF jsonb_typeof(v_intent) <> 'object' THEN
            RAISE EXCEPTION 'Item %: expected a JSON object, got %', v_idx, jsonb_typeof(v_intent)
                USING ERRCODE = '22023';
        END IF;

        v_kind := v_intent->>'kind';
        v_guest_count := (v_intent->>'guest_count')::int;

        IF v_kind = 'service' THEN
            v_service_id := (v_intent->>'service_id')::uuid;
            v_booking_date := (v_intent->>'booking_date')::date;

            SELECT provider_id INTO v_provider_id FROM public.services WHERE id = v_service_id;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Item %: service % not found', v_idx, v_service_id USING ERRCODE = 'P0002';
            END IF;

            -- Sum remaining capacity across every inventory row for this service/date (see
            -- create_booking_with_capacity_check for the full rationale -- reused verbatim here).
            v_has_inventory := false;
            v_any_blocked := false;
            v_total_remaining := 0;
            FOR v_row IN
                SELECT id, total_capacity, booked_capacity, is_blocked
                FROM public.service_inventory
                WHERE service_id = v_service_id AND available_date = v_booking_date
                ORDER BY start_time NULLS FIRST
                FOR UPDATE
            LOOP
                v_has_inventory := true;
                v_any_blocked := v_any_blocked OR v_row.is_blocked;
                v_total_remaining := v_total_remaining + (v_row.total_capacity - v_row.booked_capacity);
            END LOOP;

            IF v_has_inventory THEN
                IF v_any_blocked THEN
                    RAISE EXCEPTION 'Item %: this date is not available for service %', v_idx, v_service_id
                        USING ERRCODE = 'P0001';
                END IF;
                IF v_total_remaining < v_guest_count THEN
                    RAISE EXCEPTION 'Item %: not enough capacity left for service % on % (% requested, % remaining)',
                        v_idx, v_service_id, v_booking_date, v_guest_count, v_total_remaining
                        USING ERRCODE = 'P0001';
                END IF;

                -- Same greedy earliest-slot-first spend as create_booking_with_capacity_check,
                -- applied immediately (see pass-3 header comment on why it can't be deferred).
                v_to_allocate := v_guest_count;
                FOR v_row IN
                    SELECT id, total_capacity, booked_capacity
                    FROM public.service_inventory
                    WHERE service_id = v_service_id AND available_date = v_booking_date
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

            v_booking_payloads := v_booking_payloads || jsonb_build_object(
                'tourist_id', v_tourist_id,
                'service_id', v_service_id,
                'itinerary_id', NULL,
                'provider_id', v_provider_id,
                'status', 'pending',
                'booking_date', v_booking_date,
                'guest_count', v_guest_count,
                'special_requests', v_intent->>'special_requests',
                'passenger_manifest', v_intent->'passenger_manifest',
                'dietary_preferences', v_intent->>'dietary_preferences',
                'pickup_location', v_intent->>'pickup_location',
                'total_price', GREATEST(coalesce((v_intent->>'total_price')::numeric, 0), 0),
                'currency', coalesce(v_intent->>'currency', 'UZS')
            );

        ELSE -- 'package_departure' (already validated as one of the two known kinds in pass 1)
            v_departure_id := (v_intent->>'departure_id')::uuid;

            SELECT id, itinerary_id, start_date, max_guests, booked_guests, status
            INTO v_departure
            FROM public.package_departures
            WHERE id = v_departure_id
            FOR UPDATE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Item %: departure % not found', v_idx, v_departure_id USING ERRCODE = 'P0002';
            END IF;

            IF v_departure.status <> 'scheduled' THEN
                RAISE EXCEPTION 'Item %: departure % is not open for booking (status %)', v_idx, v_departure_id, v_departure.status
                    USING ERRCODE = 'P0001';
            END IF;

            -- Same itineraries join this branch already needed for provider_id, extended to also
            -- carry status. package_departures' own public SELECT policy (Part B above) already
            -- excludes draft-itinerary departures, but this function is SECURITY DEFINER and
            -- bypasses RLS entirely, so a tourist who discovers/guesses a draft departure_id
            -- could otherwise still complete a paid booking against an unpublished package.
            -- Checked BEFORE the capacity UPDATE below so a draft-itinerary departure's
            -- booked_guests is never touched by a rejected attempt.
            SELECT agency_id, status INTO v_provider_id, v_itinerary_status
            FROM public.itineraries WHERE id = v_departure.itinerary_id;

            IF v_itinerary_status = 'draft' THEN
                RAISE EXCEPTION 'Item %: package is not yet published', v_idx USING ERRCODE = 'P0001';
            END IF;

            v_new_booked := v_departure.booked_guests + v_guest_count;
            IF v_new_booked > v_departure.max_guests THEN
                RAISE EXCEPTION 'Item %: not enough capacity left for departure % (% requested, % remaining)',
                    v_idx, v_departure_id, v_guest_count, (v_departure.max_guests - v_departure.booked_guests)
                    USING ERRCODE = 'P0001';
            END IF;

            -- Flip to 'sold_out' the moment this booking exactly fills the departure, same
            -- immediate-mutation reasoning as the service branch above.
            v_new_status := CASE WHEN v_new_booked = v_departure.max_guests THEN 'sold_out' ELSE 'scheduled' END;
            UPDATE public.package_departures
            SET booked_guests = v_new_booked, status = v_new_status
            WHERE id = v_departure_id;

            v_booking_payloads := v_booking_payloads || jsonb_build_object(
                'tourist_id', v_tourist_id,
                'service_id', NULL,
                'itinerary_id', v_departure.itinerary_id,
                'provider_id', v_provider_id,
                'status', 'pending',
                'booking_date', v_departure.start_date, -- bookings.booking_date is NOT NULL and single-valued; the departure's start_date is the closest fit
                'guest_count', v_guest_count,
                'special_requests', v_intent->>'special_requests',
                'passenger_manifest', v_intent->'passenger_manifest',
                'dietary_preferences', v_intent->>'dietary_preferences',
                'pickup_location', v_intent->>'pickup_location',
                'total_price', GREATEST(coalesce((v_intent->>'total_price')::numeric, 0), 0),
                'currency', coalesce(v_intent->>'currency', 'UZS')
            );
        END IF;
    END LOOP;

    -- Every intent in the array has now passed validation and had its capacity change applied.
    -- Insert every booking row in one batched statement and return exactly what was inserted.
    RETURN QUERY
    INSERT INTO public.bookings (
        tourist_id, service_id, itinerary_id, provider_id, status, booking_date, guest_count,
        special_requests, passenger_manifest, dietary_preferences, pickup_location,
        total_price, currency
    )
    SELECT
        x.tourist_id, x.service_id, x.itinerary_id, x.provider_id, x.status, x.booking_date, x.guest_count,
        x.special_requests, x.passenger_manifest, x.dietary_preferences, x.pickup_location,
        x.total_price, x.currency
    FROM jsonb_to_recordset(v_booking_payloads) AS x(
        tourist_id uuid, service_id uuid, itinerary_id uuid, provider_id uuid, status public.booking_status,
        booking_date date, guest_count int, special_requests text, passenger_manifest jsonb,
        dietary_preferences text, pickup_location text, total_price numeric, currency text
    )
    RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.process_multi_item_booking FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_multi_item_booking TO authenticated;
