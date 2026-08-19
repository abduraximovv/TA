"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@repo/auth";
import { getSupabaseBrowserClient } from "@repo/database";

interface UserProfile {
  full_name: string | null;
  phone: string | null;
  role: string;
}

interface Stats {
  activeListings: number;
  avgRating: number;
  totalReviews: number;
  pendingBookings: number;
}

export default function Dashboard() {
  const { session, isVerified } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ activeListings: 0, avgRating: 0, totalReviews: 0, pendingBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      const supabase = getSupabaseBrowserClient();

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("full_name, phone, role")
        .eq("id", session.user.id)
        .single();
      if (profileData) setProfile(profileData as UserProfile);

      const { data: itineraries } = await supabase
        .from("itineraries")
        .select("id")
        .eq("agency_id", session.user.id)
        .returns<{ id: string }[]>();

      const itineraryIds = (itineraries ?? []).map((i) => i.id);

      let avgRating = 0;
      let totalReviews = 0;
      if (itineraryIds.length > 0) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .in("itinerary_id", itineraryIds)
          .returns<{ rating: number }[]>();
        if (reviews && reviews.length > 0) {
          totalReviews = reviews.length;
          avgRating = Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1));
        }
      }

      const { count: pendingCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("provider_id", session.user.id)
        .eq("status", "pending");

      setStats({
        activeListings: itineraryIds.length,
        avgRating,
        totalReviews,
        pendingBookings: pendingCount ?? 0,
      });
      setLoading(false);
    }
    load();
  }, [session]);

  const statCards = [
    { label: 'Active Itineraries / Packages', value: stats.activeListings.toString(), delta: '+1 this week' },
    { label: 'Average Provider Rating', value: stats.avgRating > 0 ? stats.avgRating.toString() : '—', delta: `${stats.totalReviews} total reviews` },
    { label: 'Pending Bookings', value: stats.pendingBookings.toString(), delta: stats.pendingBookings > 0 ? 'Needs attention' : 'All clear' },
  ];

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Agency';

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(10,35,32,0.5)" }}>Loading data...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F9F8F5", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ height: 76, flexShrink: 0, background: "#FFFFFF", borderBottom: "1px solid #E5E3DD", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(10,35,32,0.55)" }}>
          <span>Agency Portal</span>
          <span style={{ color: "rgba(10,35,32,0.3)" }}>/</span>
          <span style={{ color: "#0A2320", fontWeight: 600 }}>Dashboard</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(10,35,32,0.045)", backdropFilter: "blur(8px)", border: "1px solid rgba(10,35,32,0.07)", borderRadius: 100, padding: "9px 16px", width: 280 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.6px solid rgba(10,35,32,0.4)", flexShrink: 0 }}></div>
            <div style={{ fontSize: 13.5, color: "rgba(10,35,32,0.4)" }}>Search itineraries, providers…</div>
          </div>
          <div style={{ width: 1, height: 28, background: "#E5E3DD" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", background: "#0A2320", color: "#C5A880", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600 }}>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0A2320" }}>{profile?.full_name || "Agency Admin"}</div>
              <div style={{ fontSize: 11.5, color: "rgba(10,35,32,0.5)" }}>{isVerified ? "Verified Agency" : "Pending Verification"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#0A2320", marginBottom: 4 }}>
              Welcome back, {firstName}
            </div>
            <div style={{ fontSize: 14, color: "rgba(10,35,32,0.55)" }}>Here's what's happening across your itineraries today.</div>
          </div>
          
          <Link href="/packages" style={{ textDecoration: 'none' }}>
            <button style={{ background: '#006B70', color: '#FFFFFF', padding: '10px 18px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              Manage Itineraries →
            </button>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: "#FFFFFF", borderRadius: 8, padding: 22, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)" }}>
              <div style={{ fontSize: 13, color: "rgba(10,35,32,0.55)", marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 600, color: "#0A2320" }}>{s.value}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#006B70", marginTop: 8 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 8, padding: 28, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)", minHeight: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#0A2320", fontFamily: "'Playfair Display', serif" }}>
            Agency Profile Details
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(10,35,32,0.5)", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Full Name</div>
              <div style={{ fontSize: 14, color: "#0A2320" }}>{profile?.full_name || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(10,35,32,0.5)", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Phone Contact</div>
              <div style={{ fontSize: 14, color: "#0A2320" }}>{profile?.phone || "Not provided"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
