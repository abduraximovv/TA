-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create the enum for location categories
CREATE TYPE public.location_category AS ENUM (
    'sos',
    'toilet',
    'cultural',
    'festival',
    'pharmacy',
    'atm',
    'wifi',
    'water'
);

-- 3. Create the locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category public.location_category NOT NULL,
    coordinates geography(POINT, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create a GIST index on coordinates for fast spatial queries
CREATE INDEX IF NOT EXISTS locations_coordinates_idx 
ON public.locations USING GIST (coordinates);

-- 5. Enable Row-Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policy: Anyone can read locations
CREATE POLICY "Locations are publicly readable" 
ON public.locations FOR SELECT 
USING (true);

-- 7. Create an RPC function to fetch locations within a radius
-- This function takes lat, lng, and radius in meters and returns matching locations
CREATE OR REPLACE FUNCTION public.get_locations_in_radius(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    category public.location_category,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.description,
        l.category,
        ST_Y(l.coordinates::geometry) AS lat,
        ST_X(l.coordinates::geometry) AS lng,
        ST_Distance(l.coordinates, ST_Point(p_lng, p_lat)::geography) AS distance_meters
    FROM public.locations l
    WHERE ST_DWithin(
        l.coordinates,
        ST_Point(p_lng, p_lat)::geography,
        p_radius_meters
    )
    ORDER BY distance_meters ASC;
END;
$$;
