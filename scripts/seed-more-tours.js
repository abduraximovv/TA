const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY! Please set them in .env.");
  process.exit(1);
}

const tours = [
  {
    title: 'Extreme Chimgan Heliskiing',
    description: 'Experience untouched powder in the Tien Shan mountains. Includes helicopter drops and expert guides.',
    category: 'experience',
    price: 4500000,
    currency: 'UZS',
    image_url: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=1200&q=80',
    avg_rating: 4.95,
    reviews_count: 12,
  },
  {
    title: 'Khiva Ancient Walls Evening Walk',
    description: 'Walk the illuminated 10-meter high mud walls of Ichan-Kala, tracing the footsteps of the Khans.',
    category: 'experience',
    price: 100000,
    currency: 'UZS',
    image_url: 'https://images.unsplash.com/photo-1590080875897-6f26e981d28c?w=1200&q=80',
    avg_rating: 4.88,
    reviews_count: 45,
  },
  {
    title: 'Bukhara Culinary Masterclass: Somsa & Shashlik',
    description: 'Learn to bake traditional Bukharian somsa in a real tandoor oven, followed by a feast.',
    category: 'food',
    price: 250000,
    currency: 'UZS',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
    avg_rating: 4.92,
    reviews_count: 88,
  },
  {
    title: 'Zaamin National Park Hiking & Camping',
    description: 'Discover the "Uzbek Switzerland". Hike through dense juniper forests and camp under the stars.',
    category: 'experience',
    price: 500000,
    currency: 'UZS',
    image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=80',
    avg_rating: 4.85,
    reviews_count: 24,
  },
];

async function seedTours() {
  console.log('Seeding more tours using Supabase REST API...');

  for (const tour of tours) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(tour)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`Error creating tour:`, data.message || JSON.stringify(data));
    } else {
      console.log(`Successfully created tour: ${tour.title}`);
    }
  }

  console.log('Finished seeding tours.');
}

seedTours();
