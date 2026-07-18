const SUPABASE_URL = 'https://foatmzdgdidvtzryqrsv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_fBMQImv_BzaGIibJF73Quw_XvxKTe2X';
const SUPABASE_ANON_KEY = 'sb_publishable_fCMl9bW5Qy7nnR0RzQP3cw_a2F8yApG';

const users = [
  { email: 'tourist@uzb.test', role: 'tourist' },
  { email: 'provider@uzb.test', role: 'provider' },
  { email: 'agency@uzb.test', role: 'agency' },
  { email: 'admin@uzb.test', role: 'admin' },
];

const password = 'Abdurohman2007@';

async function runAuthDebug() {
  console.log("==========================================");
  console.log("🔍 SUPABASE AUTHENTICATION DEBUG SCRIPT 🔍");
  console.log("==========================================\n");

  console.log(`📡 Connecting to Supabase Project: ${SUPABASE_URL}\n`);

  // STEP 1: CREATE USERS VIA ADMIN API
  console.log("--- STEP 1: CREATING/VERIFYING USERS ---");
  for (const u of users) {
    try {
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
          user_metadata: { role: u.role, full_name: `Test ${u.role}` },
          email_confirm: true
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.msg?.includes("already exists") || data.message?.includes("already exists")) {
          console.log(`✅ User ${u.email} already exists. Skipping creation.`);
        } else {
          console.log(`❌ Failed to create ${u.email}: ${JSON.stringify(data)}`);
        }
      } else {
        console.log(`✅ Successfully created new user: ${u.email} (Role: ${u.role})`);
      }
    } catch (err) {
      console.log(`❌ Network Error while creating ${u.email}: ${err.message}`);
    }
  }

  // STEP 2: TEST LOGIN FLOW
  console.log("\n--- STEP 2: TESTING LOGIN FLOW ---");
  console.log(`Attempting to sign in as ${users[0].email}...`);
  
  try {
    const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: users[0].email,
        password: password
      })
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      console.log(`❌ LOGIN FAILED: ${JSON.stringify(loginData)}`);
      console.log("\n💡 HOW TO FIX THIS ERROR:");
      if (loginData.error_description?.includes("Invalid login credentials")) {
        console.log("- The password or email is wrong. Ensure no typos exist.");
      } else if (loginData.error_description?.includes("Email not confirmed")) {
        console.log("- Your Supabase project requires Email Confirmation. Go to Supabase Dashboard -> Authentication -> Providers -> Email, and turn OFF 'Confirm email'.");
      }
    } else {
      console.log(`✅ LOGIN SUCCESSFUL!`);
      console.log(`🔑 Access Token Received: ${loginData.access_token.substring(0, 20)}...`);
      console.log(`👤 User Role Metadata: ${JSON.stringify(loginData.user.user_metadata)}`);
      console.log("\n🚀 EVERYTHING IS WORKING PERFECTLY.");
      console.log("You can now go to http://localhost:3003/auth/login and log in with the Tourist App UI!");
    }
  } catch (err) {
    console.log(`❌ Network Error while logging in: ${err.message}`);
    console.log("- Are you connected to the internet? Is your VPN blocking Supabase?");
  }
}

runAuthDebug();
