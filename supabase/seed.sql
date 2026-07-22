-- ============================================
-- Seed Data for Landing Page: Visit Uzbekistan
-- ============================================

-- 1. DESTINATIONS (Featured cities + rural regions)
INSERT INTO public.destinations (name, slug, description, region, image_url, latitude, longitude, service_count, is_featured, display_order) VALUES
('Samarkand', 'samarkand', 'The jewel of the Silk Road. Home to Registan Square, Bibi-Khanym Mosque, and centuries of living history.', 'Samarkand Region', 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80', 39.6548, 66.9749, 18, true, 1),
('Bukhara', 'bukhara', 'A living museum of Islamic architecture. Walk through bazaars that have traded spices and silk for a millennium.', 'Bukhara Region', 'https://images.unsplash.com/photo-1565107778791-76e4e3e0f795?w=800&q=80', 39.7747, 64.4286, 14, true, 2),
('Khiva', 'khiva', 'Step inside the walled city of Ichan-Kala, a UNESCO World Heritage Site frozen in time.', 'Khorezm Region', 'https://images.unsplash.com/photo-1590080875897-6f26e981d28c?w=800&q=80', 41.3775, 60.3619, 9, true, 3),
('Tashkent', 'tashkent', 'The modern capital blending Soviet grandeur, ancient mosques, and a buzzing contemporary art scene.', 'Tashkent', 'https://images.unsplash.com/photo-1624453384498-835c08627c3b?w=800&q=80', 41.2995, 69.2401, 22, true, 4),
('Fergana Valley', 'fergana-valley', 'The heart of Uzbek craftsmanship. Discover ceramic workshops in Rishtan and silk weaving in Margilan.', 'Fergana Region', 'https://images.unsplash.com/photo-1504803900752-c2051699d0e8?w=800&q=80', 40.3842, 71.7889, 7, true, 5),
('Nukus', 'nukus', 'Gateway to the Aral Sea and home to the Savitsky Museum — one of the world''s great hidden art collections.', 'Karakalpakstan', 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&q=80', 42.4628, 59.6003, 4, false, 6),
('Surkhandarya', 'surkhandarya', 'Ancient Buddhist sites, dramatic mountain scenery, and the warmest hospitality in Central Asia.', 'Surkhandarya Region', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 38.2114, 67.8314, 5, false, 7),
('Jizzakh', 'jizzakh', 'Gateway to the Zaamin Mountains. Perfect for horseback riding, hiking, and connecting with pastoral nomadic traditions.', 'Jizzakh Region', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80', 40.1158, 67.8422, 3, false, 8)
ON CONFLICT (slug) DO NOTHING;

-- 2. SERVICES (Mix of urban + rural providers)
INSERT INTO public.services (title, description, category, price, currency, image_url, avg_rating, reviews_count, location, is_rural_provider, provider_name, duration_display, is_featured) VALUES
-- Classic urban experiences
('Registan Square Guided Tour', 'Expert-led walking tour of Samarkand''s iconic Registan Square with historical commentary and photography tips.', 'experience', 150000, 'UZS', 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&q=80', 4.90, 127, 'Samarkand', false, 'Silk Road Heritage Tours', '3 Hours', true),
('Bukhara Old City Night Walk', 'Magical evening stroll through Bukhara''s illuminated madrasas, minarets, and hidden caravanserais.', 'experience', 120000, 'UZS', 'https://images.unsplash.com/photo-1565107778791-76e4e3e0f795?w=600&q=80', 4.85, 89, 'Bukhara', false, 'Bukhara Living History', '2.5 Hours', true),
('Chorsu Bazaar Food Tour', 'Taste your way through Tashkent''s legendary bazaar: non bread, dried fruits, and sizzling kebabs.', 'food', 200000, 'UZS', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80', 4.80, 64, 'Tashkent', false, 'Tashkent Foodie Walks', '3 Hours', true),

-- RURAL PROVIDERS — key differentiator
('Authentic Ceramics Workshop', 'Learn traditional blue Rishtan ceramics from master craftsman Rustam Usmanov — 7th generation potter. Hand-paint your own plate to take home.', 'experience', 250000, 'UZS', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80', 4.95, 43, 'Rishtan, Fergana Valley', true, 'Rustam Ceramics Workshop', '4 Hours', true),
('Silk Weaving Masterclass', 'Watch ikat silk being hand-dyed and woven using methods unchanged for centuries. Try the loom yourself in Margilan''s famous Yodgorlik factory.', 'experience', 180000, 'UZS', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80', 4.88, 37, 'Margilan, Fergana Valley', true, 'Yodgorlik Silk Workshop', '3 Hours', true),
('Mountain Guesthouse & Hiking', 'Stay in a traditional stone guesthouse in the Baysun mountains. Includes guided hike to ancient cave paintings and homemade dinner.', 'stay', 400000, 'UZS', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', 4.92, 28, 'Boysun, Surkhandarya', true, 'Baysun Mountain Lodge', 'Overnight + Day', true),
('Horseback Tour of Zaamin', 'Ride through alpine meadows and juniper forests with local horsemen. Includes traditional kumiss (fermented mare''s milk) tasting.', 'experience', 350000, 'UZS', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&q=80', 4.78, 19, 'Zaamin, Jizzakh', true, 'Zaamin Horse Adventures', '6 Hours', true),
('Aral Sea Yurt Camp Experience', 'Sleep in a traditional yurt on the shore of the receding Aral Sea. Witness one of Earth''s great environmental stories firsthand.', 'stay', 500000, 'UZS', 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=600&q=80', 4.70, 12, 'Moynaq, Karakalpakstan', true, 'Aral Yurt Camp', '2 Days / 1 Night', false),
('Traditional Plov Cooking Class', 'Cook the national dish with a local family in their courtyard. Learn the secrets of the perfect Samarkand plov from scratch.', 'food', 180000, 'UZS', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', 4.87, 56, 'Samarkand', true, 'Plov Master Karim', '3 Hours', true);

-- 3. EVENTS (Festivals and cultural events)
INSERT INTO public.events (title, description, location, image_url, start_date, end_date, event_type, is_featured) VALUES
('Silk & Spices Festival', 'Annual celebration of Bukhara''s Silk Road heritage. Live music, artisan markets, fashion shows, and traditional cuisine.', 'Bukhara', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80', '2026-09-15', '2026-09-20', 'festival', true),
('Navruz Spring Festival', 'The ancient Persian New Year celebration. Witness sumalak cooking, buzkashi matches, and citywide festivities across Uzbekistan.', 'Nationwide', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80', '2027-03-21', '2027-03-23', 'festival', true),
('Sharq Taronalari Music Festival', 'International music festival held every two years in the heart of Registan Square. Musicians from 60+ countries perform under the stars.', 'Samarkand', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80', '2027-08-25', '2027-08-30', 'festival', true),
('Boysun Bahori Spring Festival', 'UNESCO-recognized folk festival in the mountains of Surkhandarya. Traditional dance, music, and rituals passed down for centuries.', 'Boysun, Surkhandarya', 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600&q=80', '2027-04-10', '2027-04-12', 'festival', true),
('Contemporary Art Week Tashkent', 'Tashkent''s emerging contemporary art scene on display. Gallery openings, installations, and talks across the capital.', 'Tashkent', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&q=80', '2026-11-01', '2026-11-07', 'exhibition', false),
('Rishtan Ceramics Fair', 'Annual gathering of Fergana Valley''s finest ceramic artists. Watch live demonstrations and purchase unique handmade pieces.', 'Rishtan, Fergana Valley', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80', '2026-10-05', '2026-10-07', 'fair', true);
