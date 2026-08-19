BEGIN;

-- Prerequisites for the package-booking hold/release/cancel system added in
-- 20260821030000_booking_hold_rpcs.sql. Split into its own migration/transaction deliberately:
-- Postgres forbids using a newly-added enum label in the SAME transaction that added it
-- (ALTER TYPE ... ADD VALUE only takes effect for later transactions), so the functions that
-- reference 'pending_payment'/'expired' below cannot live in this file.

-- 'pending_payment': a package-departure booking that has reserved seats but not yet been paid
-- for (see create_package_booking) -- distinct from the existing 'pending' (used by
-- create_booking_with_capacity_check / process_multi_item_booking for bookings a provider still
-- needs to manually accept/decline; those are untouched by this migration and never expire).
-- 'expired': terminal state for a 'pending_payment' hold that release_expired_bookings() timed
-- out, kept distinct from 'cancelled' so the two are reportable separately (a tourist actively
-- backing out vs. simply never completing payment are different signals).
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'expired';

-- Precisely identifies which package_departures row a booking holds seats against.
-- process_multi_item_booking's own package_departure handling only ever stamps itinerary_id
-- (never departure_id) on the bookings row it inserts -- harmless today since it never produces
-- 'pending_payment' bookings, so release_expired_bookings() (which only ever touches
-- status = 'pending_payment' rows) never needs to resolve departure_id for anything that RPC
-- created. Without this column there would be no reliable way to tell which departure to credit
-- capacity back to when an itinerary has more than one scheduled departure.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS departure_id uuid REFERENCES public.package_departures(id);

CREATE INDEX IF NOT EXISTS idx_bookings_departure_id ON public.bookings (departure_id) WHERE departure_id IS NOT NULL;

COMMIT;
