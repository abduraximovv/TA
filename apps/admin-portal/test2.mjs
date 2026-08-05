import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: profiles, error: pErr } = await supabaseAdmin
    .from("user_profiles")
    .select("id, full_name, phone, role, is_verified, created_at")
    .in("role", ["provider", "agency"]);

  const { data: verifications, error: vErr } = await supabaseAdmin
    .from("provider_verifications")
    .select("*");

  const { data: authUsers, error: aErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(authUsers.users.map((u) => [u.id, u.email ?? null]));

  const verMap = new Map((verifications ?? []).map((v) => [v.user_id, v]));

  const rows = (profiles ?? []).map((p) => {
    const v = verMap.get(p.id);
    const email = emailById.get(p.id) || v?.email || "—";
    const business_name = v?.business_name || p.full_name || "Business Account";

    let status = "pending";
    if (v?.status) {
      status = v.status;
    } else if (p.is_verified) {
      status = "approved";
    }

    return {
      id: v?.id || p.id,
      user_id: p.id,
      business_name,
      email,
      phone: p.phone || v?.phone || null,
      role: p.role,
      status,
      created_at: v?.created_at || p.created_at,
    };
  });

  const pending = rows.filter(r => r.status === 'pending');
  console.log("ALL ROWS COUNT:", rows.length);
  console.log("PENDING COUNT:", pending.length);
  console.log("PENDING ROWS:", JSON.stringify(pending, null, 2));
}

check();
