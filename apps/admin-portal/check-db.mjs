import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: profiles } = await supabase.from('user_profiles').select('*').in('role', ['agency', 'provider']);
  console.log("PROFILES:", JSON.stringify(profiles, null, 2));

  const { data: verifications } = await supabase.from('provider_verifications').select('*');
  console.log("VERIFICATIONS:", JSON.stringify(verifications, null, 2));
}

check();
