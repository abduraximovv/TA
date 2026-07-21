-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- e.g., 'tour', 'gastronomy', 'artisan'
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'UZS',
    image_url TEXT,
    avg_rating NUMERIC(3, 2) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow public read access to services
CREATE POLICY "Allow public read access on services"
    ON public.services FOR SELECT
    USING (true);
