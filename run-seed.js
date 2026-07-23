const { execSync } = require('child_process');

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://foatmzdgdidvtzryqrsv.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_fCMl9bW5Qy7nnR0RzQP3cw_a2F8yApG';

try {
  console.log("Running seed-users.js...");
  execSync('node seed-users.js', { stdio: 'inherit' });
} catch (e) {
  console.error("Failed seed users", e);
}
