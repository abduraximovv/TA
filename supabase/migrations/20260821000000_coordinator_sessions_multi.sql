-- Evolves coordinator_sessions from "exactly one row per user" (the single in-progress draft
-- from the previous migration) into a real multi-session chat history: the tourist can have many
-- saved planning sessions, switch between them, and delete individual ones -- ChatGPT-style
-- "New Chat" + history list, rather than only ever resuming one resumable draft.
--
-- Uses ADD COLUMN ... DEFAULT gen_random_uuid() (and DEFAULT now() for created_at) rather than a
-- plain nullable ADD COLUMN + separate backfill: Postgres evaluates a volatile DEFAULT per
-- existing row when the column is added (not just for future inserts), so any pre-existing
-- single-draft rows from the prior migration get a real, distinct id/created_at here for free.
-- The UPDATE statements below are pure defensive insurance in case this migration is ever
-- re-run against a partially-migrated database, not the primary mechanism.
ALTER TABLE public.coordinator_sessions
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE public.coordinator_sessions SET id = gen_random_uuid() WHERE id IS NULL;
UPDATE public.coordinator_sessions SET created_at = updated_at WHERE created_at IS NULL;

ALTER TABLE public.coordinator_sessions ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.coordinator_sessions ALTER COLUMN created_at SET NOT NULL;

-- Swap the primary key from user_id (enforced "one row per user") to id (many rows per user).
-- The auto-generated constraint name from the original `user_id uuid PRIMARY KEY` declaration is
-- coordinator_sessions_pkey (Postgres's standard <table>_pkey naming for an inline PRIMARY KEY).
-- Dropping it does NOT touch the separate `REFERENCES auth.users(id) ON DELETE CASCADE` foreign
-- key on user_id (a distinct constraint object) or user_id's NOT NULL -- both stay intact, so
-- every session row is still required to belong to a user and still cascade-deletes with them.
ALTER TABLE public.coordinator_sessions DROP CONSTRAINT IF EXISTS coordinator_sessions_pkey;
ALTER TABLE public.coordinator_sessions ADD CONSTRAINT coordinator_sessions_pkey PRIMARY KEY (id);

-- user_id is no longer indexed for free via being the PK -- add it back explicitly, ordered by
-- updated_at DESC to match the one query this index actually needs to serve well: "this user's
-- sessions, most recently active first" for the history list.
CREATE INDEX IF NOT EXISTS idx_coordinator_sessions_user_updated ON public.coordinator_sessions (user_id, updated_at DESC);

-- The existing RLS policy (auth.uid() = user_id) already works correctly for a multi-row-per-user
-- table unchanged -- it was never written to assume row-per-user uniqueness. Re-declared here
-- idempotently only as defensive insurance, not because anything about it needs to change.
DO $$ BEGIN
  CREATE POLICY "Users can manage their own coordinator session"
  ON public.coordinator_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
