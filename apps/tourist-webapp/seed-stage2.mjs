import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://foatmzdgdidvtzryqrsv.supabase.co';
const supabaseKey = 'sb_publishable_fCMl9bW5Qy7nnR0RzQP3cw_a2F8yApG';


const password = 'Abdurohman2007@';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Stage 2 Data...");

  // 1. Login as Provider to create services
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'provider@test.com',
    password: password,
  });

  if (authErr || !authData.user) {
    console.error("Failed to login as provider. Did you run seed-users.js? Error:", authErr);
    return;
  }
  
  const providerId = authData.user.id;
  console.log("Logged in as provider:", providerId);

  // Clean old services (optional, but good for testing)
  await supabase.from('services').delete().eq('provider_id', providerId);

  // Create Services
  const services = [
    {
      title: 'Traditional Tandir Bread Baking',
      description: 'Learn to bake traditional Uzbek bread in a clay tandir oven with master baker Rustam. Includes hands-on experience and fresh bread.',
      category: 'masterclass',
      price: 150000,
      currency: 'UZS',
      duration_minutes: 120,
      max_guests: 8,
      is_available: true,
      city: 'Samarkand',
      region: 'Samarkand Region',
      rating_avg: 4.8,
      rating_count: 12,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200'
    },
    {
      title: 'Desert Camel Riding Experience',
      description: 'A 2-hour camel ride through the Kyzylkum Desert with a local Bedouin guide. Includes traditional tea ceremony.',
      category: 'adventure',
      price: 300000,
      currency: 'UZS',
      duration_minutes: 120,
      max_guests: 6,
      is_available: true,
      city: 'Nurata',
      region: 'Navoi Region',
      rating_avg: 4.9,
      rating_count: 8,
      image_url: 'https://images.unsplash.com/photo-1541364501234-7096e2ccb898?q=80&w=1200'
    }
  ];

  const { data: insertedServices, error: sErr } = await supabase
    .from('services')
    .insert(services)
    .select();

  if (sErr) {
    console.error("Error inserting services:", sErr);
    return;
  }

  console.log("Inserted services:", insertedServices.map(s => s.title));

  // 2. Login as Agency to create an itinerary
  const { data: agencyAuth, error: agencyErr } = await supabase.auth.signInWithPassword({
    email: 'agency@test.com',
    password: password,
  });

  if (agencyErr || !agencyAuth.user) {
    console.error("Failed to login as agency:", agencyErr);
    return;
  }

  const agencyId = agencyAuth.user.id;
  console.log("Logged in as agency:", agencyId);

  // Clean old itineraries
  await supabase.from('itineraries').delete().eq('agency_id', agencyId);

  // Create Itinerary
  const { data: itinerary, error: iErr } = await supabase
    .from('itineraries')
    .insert({
      title: 'Golden Triangle: Samarkand, Bukhara, Khiva',
      description: 'Explore the three legendary cities of the Silk Road in this comprehensive 7-day tour. Includes guided visits to Registan, Ark Fortress, and Ichan Kala.',
      start_date: '2026-09-01',
      end_date: '2026-09-07',
      status: 'active',
      total_price: 4500000,
      currency: 'UZS'
    })
    .select()
    .single();

  if (iErr) {
    console.error("Error inserting itinerary:", iErr);
    return;
  }

  console.log("Inserted itinerary:", itinerary.title);

  // Create Itinerary Items linking to the services we just created
  const items = [
    {
      itinerary_id: itinerary.id,
      service_id: insertedServices[0].id,
      title: 'Morning Bread Baking Class',
      scheduled_date: '2026-09-02',
      start_time: '09:00:00',
      duration_minutes: 120,
      sort_order: 1,
      price: 150000
    },
    {
      itinerary_id: itinerary.id,
      service_id: insertedServices[1].id,
      title: 'Desert Excursion & Camel Ride',
      scheduled_date: '2026-09-04',
      start_time: '16:00:00',
      duration_minutes: 120,
      sort_order: 1,
      price: 300000
    }
  ];

  const { error: iiErr } = await supabase
    .from('itinerary_items')
    .insert(items);

  if (iiErr) {
    console.error("Error inserting itinerary items:", iiErr);
    return;
  }

  console.log("Inserted itinerary items linking to services.");
  console.log("✅ Seed complete! You should now see data on /discover and /packages.");
}

seed();
