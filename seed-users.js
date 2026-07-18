const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjQxMzk3NSwiZXhwIjoxOTMyMTczOTc1fQ.fUAC2N122C-BvG5gA1a6L1iN8G5oG4iGq0Q2C1R4h6o';

const users = [
  { email: 'tourist@test.com', role: 'tourist' },
  { email: 'provider@test.com', role: 'provider' },
  { email: 'agency@test.com', role: 'agency' },
  { email: 'admin@test.com', role: 'admin' },
];

const password = 'Abdurohman2007@';

async function seedUsers() {
  console.log('Seeding test users...');
  
  for (const u of users) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: u.email,
        password: password,
        data: {
          role: u.role,
          full_name: `Test ${u.role}`
        }
      })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error(`Error creating ${u.email}:`, data.msg || data.message || JSON.stringify(data));
    } else {
      console.log(`Successfully created: ${u.email} (Role: ${u.role})`);
    }
  }
  
  console.log('Finished seeding.');
}

seedUsers();
