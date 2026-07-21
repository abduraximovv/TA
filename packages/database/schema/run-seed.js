const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

console.log("URL:", env.NEXT_PUBLIC_SUPABASE_URL);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Checking if services table exists by trying to select from it...");
  const { data: checkData, error: checkError } = await supabase.from('services').select('id').limit(1);
  
  if (checkError && checkError.code === '42P01') {
    console.error("FATAL: The 'services' table DOES NOT EXIST in the remote database.");
    console.error("The Supabase JS client cannot execute raw DDL (CREATE TABLE) commands.");
    process.exit(1);
  }

  if (checkError) {
    console.error("Error checking table:", checkError);
  } else {
    console.log("Table exists! Inserting seed data...");
  }

  const servicesToInsert = [
    {
      title: 'Bukhara Artisan Tour', 
      description: 'Discover the ancient crafting secrets of Bukhara masters.', 
      category: 'artisan', 
      price: 250000, 
      currency: 'UZS', 
      image_url: 'https://images.unsplash.com/photo-1601614917406-896db0638dd1?q=80&w=800', 
      avg_rating: 4.9, 
      reviews_count: 128
    },
    {
      title: 'Khiva Night Walk', 
      description: 'Experience the magic of Ichan Kala illuminated under the stars.', 
      category: 'tour', 
      price: 180000, 
      currency: 'UZS', 
      image_url: 'https://images.unsplash.com/photo-1584988776657-695c02dc2cb3?q=80&w=800', 
      avg_rating: 4.9, 
      reviews_count: 85
    },
    {
      title: 'Samarkand Gastronomy', 
      description: 'A culinary journey through the famous plov centers and local spices.', 
      category: 'gastronomy', 
      price: 320000, 
      currency: 'UZS', 
      image_url: 'https://images.unsplash.com/photo-1616785641775-db6710b784a9?q=80&w=800', 
      avg_rating: 4.9, 
      reviews_count: 210
    }
  ];

  const { data, error } = await supabase.from('services').insert(servicesToInsert).select();
  
  if (error) {
    console.error("Error inserting data:", error);
    process.exit(1);
  }

  console.log("Successfully inserted seed data:", data.length, "rows.");
}

seed();
