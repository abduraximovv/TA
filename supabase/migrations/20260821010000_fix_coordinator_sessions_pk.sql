-- PUT /api/v1/ai/coordinator-session (the SafronCoordinator auto-save that lets a tourist
-- resume their in-progress trip plan) was failing on every save with:
--   42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
--
-- coordinator_sessions.user_id was created as PRIMARY KEY in 20260819000000_coordinator_sessions.sql,
-- which should already satisfy .upsert(..., { onConflict: "user_id" }). Live `supabase migration
-- list` shows an untracked migration (20260821000000) was applied directly to production and is
-- not present anywhere in this repo's migration history, so its exact contents are unknown --
-- but its effect on this table is externally observable: the constraint the app code depends on
-- is gone. Rather than guess what that migration did or attempt to reconcile migration history,
-- this idempotently guarantees the one constraint actually required, tolerating either starting
-- state (constraint missing, or somehow already present).
--
-- Turned out to be worse than a missing constraint: a first attempt at the ADD CONSTRAINT below
-- failed with a real duplicate-key violation, meaning whatever that untracked migration did also
-- let more than one row accumulate per user_id (only possible once uniqueness stopped being
-- enforced). Deduplicate first -- keep each user's most-recently-updated row (their actual
-- current draft; falls back to ctid as a deterministic tie-breaker on an exact updated_at match),
-- discard the rest -- or the constraint still can't be added afterward.
DELETE FROM public.coordinator_sessions cs
USING (
  SELECT user_id, ctid,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, ctid DESC) AS rn
  FROM public.coordinator_sessions
) ranked
WHERE cs.ctid = ranked.ctid
  AND ranked.rn > 1;

DO $$
BEGIN
  ALTER TABLE public.coordinator_sessions ADD CONSTRAINT coordinator_sessions_user_id_key UNIQUE (user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
