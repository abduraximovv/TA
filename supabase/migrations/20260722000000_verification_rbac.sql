-- Trust Bridge: identity foundation + unified B2B verification pipeline.
--
-- The repo's own supabase/migrations/20240101000000_init.sql was never actually applied to
-- the live project (confirmed: only `agency_requests` and `services` exist in public schema
-- today), so this migration also lays down the `user_role` enum, `public.user_profiles`
-- (1:1 extension of auth.users), and its auto-provisioning trigger before adding
-- verification on top of it. `public.agency_requests` is left untouched (not dropped) so no
-- historical data is lost, but nothing writes to it going forward — it's superseded by the
-- new unified `provider_verifications` table (role discriminator covers both agency+provider).

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('tourist', 'provider', 'agency', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Identity table: public.user_profiles (this app's "users" table; auth.users is Supabase-managed)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'tourist',
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Profiles are readable by everyone" ON public.user_profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Auto-provision a profile row for every future signup (mirrors raw_user_meta_data.role,
--    i.e. the same user_metadata the register/login flows already set).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'tourist'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Back-fill profiles for accounts that already exist (the trigger above only fires on future inserts).
INSERT INTO public.user_profiles (id, full_name, role)
SELECT id, raw_user_meta_data->>'full_name', COALESCE((raw_user_meta_data->>'role')::public.user_role, 'tourist')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Tourists and admins don't go through verification; back-fill them as verified so existing
-- logins aren't retroactively locked out by the new middleware guard.
UPDATE public.user_profiles
  SET is_verified = true
  WHERE role IN ('tourist', 'admin');

-- 4. Unified verification requests table
CREATE TABLE IF NOT EXISTS public.provider_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL CHECK (role IN ('provider', 'agency')),
    business_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    status public.verification_status NOT NULL DEFAULT 'pending',
    documents_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS provider_verifications_status_idx ON public.provider_verifications (status);

ALTER TABLE public.provider_verifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own verification request"
  ON public.provider_verifications FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own verification request"
  ON public.provider_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can select all verification requests"
  ON public.provider_verifications FOR SELECT
  USING (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update all verification requests"
  ON public.provider_verifications FOR UPDATE
  USING (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Realtime: let the /auth/pending screen subscribe to its own row for instant unblock on approval.
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_verifications;
