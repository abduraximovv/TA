"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface AnalyticsData {
  bookingsByStatus: { status: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  topServices: { title: string; bookings: number }[];
  totalReviews: number;
  avgRating: number;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabaseAdmin = getAdminClient();

  const [{ data: bookings }, { data: profiles }, { data: reviews }] = await Promise.all([
    supabaseAdmin.from("bookings").select("status, service_id"),
    supabaseAdmin.from("user_profiles").select("role"),
    supabaseAdmin.from("reviews").select("rating"),
  ]);

  const statusCounts = new Map<string, number>();
  const serviceBookingCounts = new Map<string, number>();
  for (const b of bookings ?? []) {
    statusCounts.set(b.status, (statusCounts.get(b.status) ?? 0) + 1);
    if (b.service_id) {
      serviceBookingCounts.set(b.service_id, (serviceBookingCounts.get(b.service_id) ?? 0) + 1);
    }
  }

  const roleCounts = new Map<string, number>();
  for (const p of profiles ?? []) {
    roleCounts.set(p.role, (roleCounts.get(p.role) ?? 0) + 1);
  }

  let topServices: { title: string; bookings: number }[] = [];
  const topServiceIds = Array.from(serviceBookingCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  if (topServiceIds.length > 0) {
    const { data: services } = await supabaseAdmin.from("services").select("id, title").in("id", topServiceIds);
    const titleById = new Map((services ?? []).map((s) => [s.id, s.title]));
    topServices = topServiceIds.map((id) => ({
      title: titleById.get(id) ?? "Unknown service",
      bookings: serviceBookingCounts.get(id) ?? 0,
    }));
  }

  const ratings = (reviews ?? []).map((r) => r.rating).filter((r): r is number => typeof r === "number");
  const avgRating = ratings.length > 0 ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2)) : 0;

  const statusOrder = ["pending", "accepted", "declined", "completed", "cancelled"];
  const roleOrder = ["tourist", "provider", "agency", "admin"];

  return {
    bookingsByStatus: statusOrder.map((status) => ({ status, count: statusCounts.get(status) ?? 0 })),
    usersByRole: roleOrder.map((role) => ({ role, count: roleCounts.get(role) ?? 0 })),
    topServices,
    totalReviews: ratings.length,
    avgRating,
  };
}
