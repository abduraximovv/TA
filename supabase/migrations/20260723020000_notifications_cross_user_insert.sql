-- notifications are inherently cross-user (a provider/agency creates one for a tourist on
-- accept/decline, a tourist creates one for a business on review, etc.), but the original policy
-- from the shared-contract migration only allowed `user_id = auth.uid()`, which blocks every
-- real use case except a user notifying themselves. Adding this alongside the existing policy
-- (permissive policies are OR'd) rather than replacing it, so SELECT/UPDATE/DELETE stay
-- self-scoped and only INSERT opens up.
DO $$ BEGIN
  CREATE POLICY "Authenticated users can create notifications for others"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
