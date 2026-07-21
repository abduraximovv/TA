"use client";

import React, { useEffect } from "react";
import { useAuth } from "@repo/auth";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui";
import { LogOut, Home, User as UserIcon, Settings, Shield, Bell, HelpCircle } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "../../components/BottomNav";

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#F9FAFB] pb-24">
      {/* Top App Bar - Matching Dashboard */}
      <header className="bg-[#1E6F8A] text-white pt-12 pb-20 px-6 rounded-b-3xl shadow-sm relative">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6 -mt-12 space-y-6 relative z-10">
        
        {/* Profile Card */}
        <Card className="p-6 bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-inner">
            <UserIcon className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.user_metadata?.full_name || "Traveler"}</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">{user.email}</p>
          <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-[#D4A843]/10 text-[#D4A843]">
            Verified Tourist
          </div>
        </Card>

        {/* Actions List */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <Card className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                  <Home className="w-5 h-5 text-[#1E6F8A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Back to Landing Page</h3>
                  <p className="text-xs text-gray-500">Return to the main discovery view</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Security & Privacy</h3>
                <p className="text-xs text-gray-500">Manage password and data</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mr-4">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Help & Support</h3>
                <p className="text-xs text-gray-500">Contact us or read FAQs</p>
              </div>
            </div>
          </Card>

          <Card 
            onClick={handleSignOut}
            className="p-4 bg-white border border-red-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer mt-6"
          >
            <div className="flex items-center text-red-600">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mr-4">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Log Out</h3>
            </div>
          </Card>
        </div>

      </div>

      <BottomNav />
    </main>
  );
}
