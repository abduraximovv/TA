-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Enums
CREATE TYPE public.user_role AS ENUM ('tourist', 'provider', 'agency', 'admin');
CREATE TYPE public.location_category AS ENUM ('sos', 'toilet', 'cultural', 'festival', 'pharmacy', 'atm', 'wifi', 'water', 'food', 'stay');
CREATE TYPE public.service_category AS ENUM ('food', 'stay', 'experience', 'transport');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'confirmed', 'completed', 'cancelled');

-- 3. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'tourist',
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category public.location_category NOT NULL,
    coordinates geography(POINT, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS locations_coordinates_idx ON public.locations USING GIST (coordinates);

-- 5. Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category public.service_category NOT NULL,
    price_usd NUMERIC(10,2),
    duration_minutes INT,
    max_guests INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.booking_status NOT NULL DEFAULT 'pending',
    booking_date DATE NOT NULL,
    guest_count INT NOT NULL DEFAULT 1,
    total_price_usd NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are readable by everyone" ON public.user_profiles FOR SELECT USING (true); -- Public profiles

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locations are publicly readable" ON public.locations FOR SELECT USING (true);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are publicly readable" ON public.services FOR SELECT USING (true);
CREATE POLICY "Providers can manage own services" ON public.services FOR ALL USING (auth.uid() = provider_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = tourist_id OR auth.uid() = provider_id);
CREATE POLICY "Tourists can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = tourist_id);
CREATE POLICY "Providers can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = provider_id);

-- 8. Functions & Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'tourist'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_locations_in_radius(
    p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION, p_radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID, name TEXT, description TEXT, category public.location_category,
    lat DOUBLE PRECISION, lng DOUBLE PRECISION, distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY SELECT 
        l.id, l.name, l.description, l.category,
        ST_Y(l.coordinates::geometry) AS lat, ST_X(l.coordinates::geometry) AS lng,
        ST_Distance(l.coordinates, ST_Point(p_lng, p_lat)::geography) AS distance_meters
    FROM public.locations l
    WHERE ST_DWithin(l.coordinates, ST_Point(p_lng, p_lat)::geography, p_radius_meters)
    ORDER BY distance_meters ASC;
END;
$$;
