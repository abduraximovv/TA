-- Stores both the /contact page form and the sticky "Feedback" popup submissions. Anyone can
-- submit (no account required — most visitors filling this out won't be logged in), but nobody
-- can read it back through the public API; it's a write-only inbox until an admin surface exists,
-- read via the service_role key which bypasses RLS entirely.
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  type text NOT NULL DEFAULT 'contact' CHECK (type IN ('contact', 'feedback')),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5),
  page_source text,
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact or feedback message"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
