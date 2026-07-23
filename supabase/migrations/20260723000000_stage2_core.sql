-- Enums
CREATE TYPE booking_status AS ENUM ('pending','accepted','declined','completed','cancelled');
CREATE TYPE itinerary_status AS ENUM ('draft','active','completed');
CREATE TYPE notification_type AS ENUM ('booking_request','booking_accepted','booking_declined','review_received','system');

-- Itineraries
CREATE TABLE public.itineraries (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references auth.users(id),
  title text not null,
  description text,
  start_date date,
  end_date date,
  status itinerary_status default 'draft',
  total_price numeric(12,2) default 0,
  currency text default 'UZS',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Itinerary Items
CREATE TABLE public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid references public.itineraries(id) on delete cascade,
  service_id uuid references public.services(id),
  title text,
  price numeric(12,2),
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Bookings
CREATE TABLE public.bookings (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid references auth.users(id) not null,
  service_id uuid references public.services(id),
  itinerary_id uuid references public.itineraries(id),
  provider_id uuid references auth.users(id),
  status booking_status default 'pending',
  booking_date date not null,
  guest_count int default 1,
  special_requests text,
  passenger_manifest jsonb,
  dietary_preferences text,
  pickup_location text,
  total_price numeric(12,2),
  currency text default 'UZS',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  CONSTRAINT check_booking_target CHECK (num_nonnulls(service_id, itinerary_id) = 1)
);

-- Booking Status History
CREATE TABLE public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  old_status booking_status,
  new_status booking_status not null,
  changed_by uuid references auth.users(id),
  notes text,
  changed_at timestamptz default now()
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid references auth.users(id) not null,
  service_id uuid references public.services(id),
  itinerary_id uuid references public.itineraries(id),
  booking_id uuid references public.bookings(id) not null unique,
  rating int not null CHECK (rating BETWEEN 1 AND 5),
  comment text,
  response text,
  response_at timestamptz,
  created_at timestamptz default now()
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  body text not null,
  type notification_type not null,
  action_url text,
  is_read bool default false,
  created_at timestamptz default now()
);

-- RLS enablement
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Itineraries RLS
CREATE POLICY "Owners can read/write their own itineraries"
ON public.itineraries FOR ALL
USING (agency_id = auth.uid());

-- Itinerary Items RLS
CREATE POLICY "Owners can read/write their own itinerary items"
ON public.itinerary_items FOR ALL
USING (itinerary_id IN (SELECT id FROM public.itineraries WHERE agency_id = auth.uid()));

-- Bookings RLS
CREATE POLICY "Tourists can read/write their own bookings"
ON public.bookings FOR ALL
USING (tourist_id = auth.uid());

CREATE POLICY "Providers/Agencies can read/write their own bookings"
ON public.bookings FOR ALL
USING (provider_id = auth.uid());

-- Booking Status History RLS
CREATE POLICY "Tourists can read/write their own booking history"
ON public.booking_status_history FOR ALL
USING (booking_id IN (SELECT id FROM public.bookings WHERE tourist_id = auth.uid()));

CREATE POLICY "Providers/Agencies can read/write their own booking history"
ON public.booking_status_history FOR ALL
USING (booking_id IN (SELECT id FROM public.bookings WHERE provider_id = auth.uid()));

-- Reviews RLS
CREATE POLICY "Tourists can read/write their own reviews"
ON public.reviews FOR ALL
USING (tourist_id = auth.uid());

CREATE POLICY "Providers/Agencies can read/write reviews for their bookings"
ON public.reviews FOR ALL
USING (booking_id IN (SELECT id FROM public.bookings WHERE provider_id = auth.uid()));

-- Notifications RLS
CREATE POLICY "Users can read/write their own notifications"
ON public.notifications FOR ALL
USING (user_id = auth.uid());

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings, public.notifications;

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('service-photos', 'service-photos', true);

CREATE POLICY "Owners can upload their own service photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'service-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can update their own service photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'service-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete their own service photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'service-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read service photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'service-photos');
