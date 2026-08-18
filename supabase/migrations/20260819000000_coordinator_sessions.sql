-- Server-side persistence for the SafronCoordinator AI trip-planning UI (/coordinator). Today,
-- every mount of that page unconditionally wipes msgs/days/packages/snappedPackage/etc back to
-- empty (see the "reset on open" useEffect in SafronCoordinator.tsx) -- navigating away and back
-- loses the whole in-progress plan. This table lets a signed-in tourist resume exactly where
-- they left off, from any device.
--
-- One row per user (PK on user_id, not a generated id) -- there is no session-list/switcher UI,
-- SafronCoordinator only ever shows ONE active planning session at a time, so "the current draft"
-- is the natural unit to persist, upserted in place rather than accumulating a history of rows.
--
-- `state` is a single jsonb blob rather than a normalized schema: the actual shape (chat
-- messages, a day-by-day itinerary, matched packages, which one is snapped in, selected slot
-- ids, guest count) is UI-state-shaped, not a queryable/reportable business entity -- nothing
-- outside this one page ever needs to join against it. A JSON snapshot is the simplest thing
-- that's actually correct here; see apps/tourist-webapp/src/app/api/v1/ai/coordinator-session/
-- route.ts for the exact fields written into it.
CREATE TABLE public.coordinator_sessions (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    state jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coordinator_sessions ENABLE ROW LEVEL SECURITY;

-- Fully private -- this is someone's in-progress trip draft, not content anyone else (not even
-- other tourists) should ever read. No public/anon policy at all, unlike most tables in this
-- schema.
CREATE POLICY "Users can manage their own coordinator session"
ON public.coordinator_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
