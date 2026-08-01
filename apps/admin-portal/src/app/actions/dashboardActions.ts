"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// RLS on user_profiles/bookings/services scopes rows to their owner (tourist_id/provider_id =
// auth.uid()), with no admin bypass policy -- an anon-key client authenticated as the admin user
// would silently get zero rows back for these platform-wide aggregates. Service role is required,
// same pattern as verificationActions.ts / destinationActions.ts.
function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export interface PlatformStats {
  totalTourists: number;
  newTouristsThisWeek: number;
  pendingVerifications: number;
  totalBookings: number;
  newBookingsThisWeek: number;
  totalGmv: number;
  verifiedProviders: number;
  newVerifiedProvidersThisWeek: number;
  revenueLast7Days: { label: string; total: number }[];
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabaseAdmin = getAdminClient();
  const weekAgo = daysAgoIso(7);

  const [
    { count: totalTourists },
    { count: newTouristsThisWeek },
    { count: pendingVerifications },
    { count: totalBookings },
    { count: newBookingsThisWeek },
    { count: verifiedProviders },
    { count: newVerifiedProvidersThisWeek },
    { data: completedBookings },
  ] = await Promise.all([
    supabaseAdmin.from("user_profiles").select("id", { count: "exact", head: true }).eq("role", "tourist"),
    supabaseAdmin.from("user_profiles").select("id", { count: "exact", head: true }).eq("role", "tourist").gte("created_at", weekAgo),
    supabaseAdmin.from("provider_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabaseAdmin.from("provider_verifications").select("id", { count: "exact", head: true }).eq("status", "approved").eq("role", "provider"),
    supabaseAdmin.from("provider_verifications").select("id", { count: "exact", head: true }).eq("status", "approved").eq("role", "provider").gte("updated_at", weekAgo),
    supabaseAdmin.from("bookings").select("total_price, created_at").eq("status", "completed").gte("created_at", daysAgoIso(7)),
  ]);

  const totalGmv = (completedBookings ?? []).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueByDay = new Map<string, number>();
  for (const b of completedBookings ?? []) {
    const day = dayLabels[new Date(b.created_at).getDay()];
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + (Number(b.total_price) || 0));
  }
  const revenueLast7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = dayLabels[d.getDay()];
    return { label, total: revenueByDay.get(label) ?? 0 };
  });

  return {
    totalTourists: totalTourists ?? 0,
    newTouristsThisWeek: newTouristsThisWeek ?? 0,
    pendingVerifications: pendingVerifications ?? 0,
    totalBookings: totalBookings ?? 0,
    newBookingsThisWeek: newBookingsThisWeek ?? 0,
    totalGmv,
    verifiedProviders: verifiedProviders ?? 0,
    newVerifiedProvidersThisWeek: newVerifiedProvidersThisWeek ?? 0,
    revenueLast7Days,
  };
}
