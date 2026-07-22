-- Migration: Add destinations and events tables for Landing Page
-- Also extend services with location and rural provider fields

-- 1. Create destinations table
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    region TEXT,
    image_url TEXT,
    hero_image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    service_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are publicly readable" ON public.destinations FOR SELECT USING (true);

-- 2. Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    destination_id UUID REFERENCES public.destinations(id),
    image_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    event_type TEXT DEFAULT 'festival',
    is_featured BOOLEAN DEFAULT false,
    ticket_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are publicly readable" ON public.events FOR SELECT USING (true);

-- 3. Add fields to services for landing page use
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_rural_provider BOOLEAN DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS provider_name TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS duration_display TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON public.destinations(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(is_featured, start_date);
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_services_rating ON public.services(avg_rating DESC NULLS LAST);
