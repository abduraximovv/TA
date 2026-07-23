-- Seed Data for Stage 2: Packages & Discovery
-- Run this in your Supabase SQL Editor

-- 1. Ensure we have an Agency and a Provider user in users table
-- We'll use dummy UUIDs for them
INSERT INTO auth.users (id, email)
VALUES 
  ('a1b2c3d4-0002-4000-8000-000000000002', 'provider@test.com'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'agency@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role, is_active, is_verified) VALUES
  ('a1b2c3d4-0002-4000-8000-000000000002', 'provider@test.com', 'provider', true, true),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'agency@test.com', 'agency', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (user_id, full_name, phone) VALUES
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Rustam Local Guide', '+998901234567'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Silk Road Adventures', '+998901234568')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Insert Services
INSERT INTO public.services (id, provider_id, title, description, category, price, currency, duration_minutes, max_guests, is_available, city, region, rating_avg, rating_count, image_url)
VALUES
  (
    'c1d2e3f4-0001-4000-8000-000000000001',
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Traditional Tandir Bread Baking',
    'Learn to bake traditional Uzbek bread in a clay tandir oven with master baker Rustam. Includes hands-on experience and fresh bread.',
    'masterclass',
    150000,
    'UZS',
    120,
    8,
    true,
    'Samarkand',
    'Samarkand Region',
    4.8,
    12,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200'
  ),
  (
    'c1d2e3f4-0002-4000-8000-000000000002',
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Desert Camel Riding Experience',
    'A 2-hour camel ride through the Kyzylkum Desert with a local Bedouin guide. Includes traditional tea ceremony.',
    'adventure',
    300000,
    'UZS',
    120,
    6,
    true,
    'Nurata',
    'Navoi Region',
    4.9,
    8,
    'https://images.unsplash.com/photo-1541364501234-7096e2ccb898?q=80&w=1200'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert an Itinerary (Package)
INSERT INTO public.itineraries (id, agency_id, title, description, start_date, end_date, status, total_price, currency)
VALUES
  (
    'e1f2g3h4-0001-4000-8000-000000000001',
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Golden Triangle: Samarkand, Bukhara, Khiva',
    'Explore the three legendary cities of the Silk Road in this comprehensive 7-day tour. Includes guided visits to Registan, Ark Fortress, and Ichan Kala.',
    '2026-09-01',
    '2026-09-07',
    'active',
    4500000,
    'UZS'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Itinerary Items
INSERT INTO public.itinerary_items (id, itinerary_id, service_id, title, scheduled_date, start_time, duration_minutes, sort_order, price)
VALUES
  (
    'f1g2h3i4-0001-4000-8000-000000000001',
    'e1f2g3h4-0001-4000-8000-000000000001',
    'c1d2e3f4-0001-4000-8000-000000000001', -- Link to Tandir Baking
    'Morning Bread Baking Class',
    '2026-09-02',
    '09:00:00',
    120,
    1,
    150000
  ),
  (
    'f1g2h3i4-0002-4000-8000-000000000002',
    'e1f2g3h4-0001-4000-8000-000000000001',
    null,
    'Guided Tour of Registan Square',
    '2026-09-02',
    '14:00:00',
    180,
    2,
    0
  ),
  (
    'f1g2h3i4-0003-4000-8000-000000000003',
    'e1f2g3h4-0001-4000-8000-000000000001',
    'c1d2e3f4-0002-4000-8000-000000000002', -- Link to Camel Riding
    'Desert Excursion & Camel Ride',
    '2026-09-04',
    '16:00:00',
    120,
    1,
    300000
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Add a couple of dummy reviews for the service and itinerary
INSERT INTO public.reviews (id, tourist_id, service_id, itinerary_id, booking_id, rating, comment, created_at)
VALUES
  (
    'd1e2f3g4-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001', -- Assuming this tourist exists
    'c1d2e3f4-0001-4000-8000-000000000001',
    null,
    'b1c2d3e4-0001-4000-8000-000000000001', -- Dummy booking id
    5,
    'Amazing experience! The bread was delicious.',
    now()
  ),
  (
    'd1e2f3g4-0002-4000-8000-000000000002',
    'a1b2c3d4-0001-4000-8000-000000000001',
    null,
    'e1f2g3h4-0001-4000-8000-000000000001',
    'b1c2d3e4-0002-4000-8000-000000000002',
    5,
    'Best trip of my life. Highly recommended!',
    now()
  )
ON CONFLICT (id) DO NOTHING;
