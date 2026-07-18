INSERT INTO public.locations (name, description, category, coordinates) VALUES
('Registan Square', 'The heart of the ancient city of Samarkand', 'cultural', ST_SetSRID(ST_MakePoint(66.9749, 39.6548), 4326)),
('Gur-e-Amir Mausoleum', 'Tomb of the Asian conqueror Timur', 'cultural', ST_SetSRID(ST_MakePoint(66.9686, 39.6483), 4326)),
('Bibi-Khanym Mosque', 'One of the most important monuments of Samarkand', 'cultural', ST_SetSRID(ST_MakePoint(66.9806, 39.6606), 4326)),
('Shah-i-Zinda', 'Necropolis in the north-eastern part of Samarkand', 'cultural', ST_SetSRID(ST_MakePoint(66.9875, 39.6631), 4326)),
('Siab Bazaar', 'The largest bazaar in Samarkand', 'food', ST_SetSRID(ST_MakePoint(66.9819, 39.6619), 4326)),
('Samarkand SOS Clinic', 'Emergency medical services', 'sos', ST_SetSRID(ST_MakePoint(66.9600, 39.6500), 4326)),
('Public Toilet', 'Near Registan', 'toilet', ST_SetSRID(ST_MakePoint(66.9730, 39.6540), 4326)),
('Pharmacy N1', '24/7 Pharmacy', 'pharmacy', ST_SetSRID(ST_MakePoint(66.9700, 39.6520), 4326)),
('NBU ATM', 'National Bank of Uzbekistan ATM', 'atm', ST_SetSRID(ST_MakePoint(66.9760, 39.6560), 4326)),
('Free WiFi Zone', 'Registan free wifi point', 'wifi', ST_SetSRID(ST_MakePoint(66.9750, 39.6550), 4326)),
('Drinking Water Fountain', 'Clean drinking water', 'water', ST_SetSRID(ST_MakePoint(66.9745, 39.6545), 4326));
