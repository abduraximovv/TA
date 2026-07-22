const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
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

const users = [
  { email: 'tourist@uzb.test', role: 'tourist' },
  { email: 'provider@uzb.test', role: 'provider' },
  { email: 'agency@uzb.test', role: 'agency' },
  { email: 'admin@uzb.test', role: 'admin' },
];

const password = process.env.SEED_TEST_PASSWORD || 'ChangeMe123!';

async function seedAdminUsers() {
  console.log('Seeding test users using Supabase Admin API (Bypassing Rate Limits)...');

  for (const u of users) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        email: u.email,
        password: password,
        user_metadata: {
          role: u.role,
          full_name: `Test ${u.role}`
        },
        email_confirm: true // Auto-confirm the email so they can login instantly!
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`Error creating ${u.email}:`, data.msg || data.message || JSON.stringify(data));
    } else {
      console.log(`Successfully created: ${u.email} (Role: ${u.role})`);
    }
  }

  console.log('Finished seeding users.');
}

seedAdminUsers();
