-- Seed initial locations (from previous steps if needed)
INSERT INTO public.locations (name, latitude, longitude, category, address, is_verified)
VALUES 
('Registan Square', 39.6542, 66.9750, 'landmark', 'Registan St, Samarkand', true),
('Bukhara Old City', 39.7747, 64.4286, 'landmark', 'Bukhara', true)
ON CONFLICT DO NOTHING;

-- Seed initial services for the Landing Page "Experience Discovery" section
INSERT INTO public.services (title, description, category, price, currency, image_url, avg_rating, reviews_count)
VALUES 
(
  'Bukhara Artisan Tour', 
  'Discover the ancient crafting secrets of Bukhara masters.', 
  'artisan', 
  250000, 
  'UZS', 
  'https://images.unsplash.com/photo-1601614917406-896db0638dd1?q=80&w=800', 
  4.9, 
  128
),
(
  'Khiva Night Walk', 
  'Experience the magic of Ichan Kala illuminated under the stars.', 
  'tour', 
  180000, 
  'UZS', 
  'https://images.unsplash.com/photo-1584988776657-695c02dc2cb3?q=80&w=800', 
  4.9, 
  85
),
(
  'Samarkand Gastronomy', 
  'A culinary journey through the famous plov centers and local spices.', 
  'gastronomy', 
  320000, 
  'UZS', 
  'https://images.unsplash.com/photo-1616785641775-db6710b784a9?q=80&w=800', 
  4.9, 
  210
);
