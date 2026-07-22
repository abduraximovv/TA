"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@repo/auth";
import { Card, Button, LoadingPulse, StatTile, Badge } from "@repo/ui";
import { getSupabase } from "@repo/database";
import { Package, Star, MessageSquare, ArrowRight } from "lucide-react";

interface UserProfile {
  full_name: string | null;
  phone: string | null;
  role: string;
}

interface Stats {
  activeServices: number;
  avgRating: number;
  totalReviews: number;
}

export default function Dashboard() {
  const { session, isVerified } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ activeServices: 0, avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      const supabase = getSupabase();

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("full_name, phone, role")
        .eq("id", session.user.id)
        .single();
      if (profileData) setProfile(profileData as UserProfile);

      const { data: services } = await supabase
        .from("services")
        .select("avg_rating, reviews_count")
        .eq("provider_id", session.user.id)
        .returns<{ avg_rating: number; reviews_count: number }[]>();

      if (services && services.length > 0) {
        const totalReviews = services.reduce((sum, s) => sum + (s.reviews_count ?? 0), 0);
        const weightedRating = services.reduce((sum, s) => sum + (s.avg_rating ?? 0) * (s.reviews_count ?? 0), 0);
        setStats({
          activeServices: services.length,
          avgRating: totalReviews > 0 ? Number((weightedRating / totalReviews).toFixed(1)) : 0,
          totalReviews,
        });
      }
      setLoading(false);
    }
    load();
  }, [session]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingPulse className="scale-150 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" data-testid="dashboard-page">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's how your business is doing.</p>
        </div>
        <Badge variant={isVerified ? "success" : "warning"} className="text-sm px-3 py-1.5">
          {isVerified ? "Verified" : "Pending Verification"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatTile label="Active Services" value={stats.activeServices} icon={<Package className="w-5 h-5" />} />
        <StatTile label="Average Rating" value={stats.avgRating || "—"} icon={<Star className="w-5 h-5" />} />
        <StatTile label="Total Reviews" value={stats.totalReviews} icon={<MessageSquare className="w-5 h-5" />} />
      </div>

      <Card className="p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage your listings</h2>
            <p className="text-sm text-gray-500 mt-1">Add new tours, experiences, or stays for travelers to book.</p>
          </div>
          <Link href="/services">
            <Button className="flex items-center gap-2">
              Go to Services
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-gray-500 uppercase tracking-wider text-xs font-semibold mb-1">Full Name</span>
            <span className="text-gray-900">{profile?.full_name || "Not provided"}</span>
          </div>
          <div>
            <span className="block text-gray-500 uppercase tracking-wider text-xs font-semibold mb-1">Phone</span>
            <span className="text-gray-900">{profile?.phone || "Not provided"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
