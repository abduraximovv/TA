"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@repo/auth";
import { Card, Button, LoadingPulse } from "@repo/ui";
import { getSupabase } from "@repo/database";

interface UserProfile {
  full_name: string;
  phone: string;
  role: string;
}

export default function Dashboard() {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("full_name, phone, role")
        .eq("id", session.user.id)
        .single();
        
      if (!error && data) {
        setProfile(data as UserProfile);
      }
      setLoading(false);
    }
    
    if (session) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50" data-testid="dashboard-page">
      <h1 className="text-3xl font-bold text-primary mb-8">Provider Dashboard</h1>
      
      <Card className="p-8 w-full max-w-lg mb-8 bg-white shadow-sm rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Your Profile</h2>
        
        {loading ? (
          <LoadingPulse className="h-8 w-8 text-[#1E6F8A]" />
        ) : profile ? (
          <div className="flex flex-col gap-4 text-gray-700">
            <div>
              <span className="font-semibold block text-sm text-gray-500 uppercase tracking-wider">Role</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#1E6F8A] text-white">
                Local {profile.role}
              </span>
            </div>
            <div>
              <span className="font-semibold block text-sm text-gray-500 uppercase tracking-wider">Full Name</span>
              <span className="text-lg">{profile.full_name || "Not provided"}</span>
            </div>
            <div>
              <span className="font-semibold block text-sm text-gray-500 uppercase tracking-wider">Phone</span>
              <span className="text-lg">{profile.phone || "Not provided"}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Profile data could not be loaded.</p>
        )}
      </Card>
      
      <Button variant="secondary" onClick={() => signOut()}>
        Log Out
      </Button>
    </div>
  );
}
