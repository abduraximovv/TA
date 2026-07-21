const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:Abdurohman2007%40@db.foatmzdgdidvtzryqrsv.supabase.co:5432/postgres';

async function updateImages() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database!");

    const updateSql = `
      UPDATE public.services SET image_url = 'https://picsum.photos/seed/' || id || '/800/600'
      WHERE category IN ('artisan', 'tour', 'gastronomy');
    `;
    console.log("Updating image URLs...");
    await client.query(updateSql);
    console.log("Images updated successfully.");

  } catch (err) {
    console.error("Database execution error:", err);
  } finally {
    await client.end();
  }
}

updateImages();
