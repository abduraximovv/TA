const SUPABASE_URL = 'https://foatmzdgdidvtzryqrsv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_fBMQImv_BzaGIibJF73Quw_XvxKTe2X';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY! Please run the script with the key exported.");
  process.exit(1);
}

const users = [
  { email: 'tourist@uzb.test', role: 'tourist' },
  { email: 'provider@uzb.test', role: 'provider' },
  { email: 'agency@uzb.test', role: 'agency' },
  { email: 'admin@uzb.test', role: 'admin' },
];

const password = 'Abdurohman2007@';

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
