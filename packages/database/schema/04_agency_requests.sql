-- 04_agency_requests.sql

-- Drop the table and recreate it just in case it exists without full policies
DROP TABLE IF EXISTS public.agency_requests CASCADE;

CREATE TABLE public.agency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for agency_requests
ALTER TABLE public.agency_requests ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated (public) users to insert new requests
CREATE POLICY "Anyone can insert agency requests" 
ON public.agency_requests 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to select all requests (using JWT claim)
CREATE POLICY "Admins can select agency requests" 
ON public.agency_requests 
FOR SELECT 
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can update agency requests
CREATE POLICY "Admins can update agency requests" 
ON public.agency_requests 
FOR UPDATE 
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
