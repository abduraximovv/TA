BEGIN;

-- package_departures.start_date/end_date are plain `date` (confirmed against both this repo's
-- migration and live production data) -- there was never any way to store or display an exact
-- departure time, and agencies have no way to set one yet. Adds start_time/end_time as nullable
-- columns, matching service_inventory's own established convention exactly (NULL = no specific
-- time set / all-day) rather than inventing a different one.
--
-- Purely additive: no existing RPC (create_package_booking, process_multi_item_booking,
-- release_expired_bookings, cancel_booking) reads or needs time-of-day to do its job -- capacity
-- checks operate on the date alone -- so none of them change here. This is display-side data for
-- the tourist-facing booking widget; nothing currently populates it, so every existing departure
-- will read back with both columns NULL until an agency-side "set departure time" UI exists.
ALTER TABLE public.package_departures ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE public.package_departures ADD COLUMN IF NOT EXISTS end_time time;

-- Mirrors service_inventory_slot_pair_check: a real time-of-day needs both ends of the range set
-- together; an all-day/unset departure must leave both NULL rather than just one. Safe as a plain
-- (not NOT VALID) ADD CONSTRAINT here -- both new columns start NULL on every existing row, so
-- there's no pre-existing data that could violate it.
ALTER TABLE public.package_departures
    ADD CONSTRAINT package_departures_time_pair_check
    CHECK ((start_time IS NULL) = (end_time IS NULL));

COMMIT;
