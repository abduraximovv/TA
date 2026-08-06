-- The footer's newsletter signup was UI-only (local state, nothing persisted). Same trust model
-- as contact_messages: anyone can subscribe without an account, nobody can read the list back
-- through the public API -- it's an admin-only mailing list, read/managed via the service_role
-- key. The "pause/resume" toggle in the admin app only flips is_active; no email sending exists
-- yet, so this is purely a UI-level status flag for now.
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to the newsletter"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON public.newsletter_subscribers(created_at DESC);
