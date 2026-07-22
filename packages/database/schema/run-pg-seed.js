const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const projectRef = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
const connectionString = `postgresql://postgres:${encodeURIComponent(env.DATABASE_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres`;

async function runSeed() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database!");

    // 1. Read and execute 03_services.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, '03_services.sql'), 'utf8');
    console.log("Creating services table...");
    await client.query(schemaSql);
    console.log("Table 'services' created or already exists.");

    // 2. Read and execute seed.sql
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    console.log("Inserting seed data...");
    await client.query(seedSql);
    console.log("Seed data inserted successfully.");

  } catch (err) {
    console.error("Database execution error:", err);
  } finally {
    await client.end();
  }
}

runSeed();
