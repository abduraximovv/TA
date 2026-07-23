"use client";

import React, { useEffect } from "react";
import { useAuth } from "@repo/auth";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui";
import { LogOut, Home, User as UserIcon, Settings, Shield, Bell, HelpCircle } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "../../components/BottomNav";
import { MyBookingsList } from "@/components/booking/MyBookingsList";

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
      <main className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-sand-50 pb-24">
      {/* Top App Bar - Matching Dashboard */}
      <header className="bg-primary text-white pt-12 pb-20 px-6 md:px-12 lg:px-24 rounded-b-3xl shadow-sm relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-pattern-prof" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 0L100 50L50 100L0 50Z" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-pattern-prof)" />
          </svg>
        </div>
        <div className="flex justify-between items-center relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Profile</h1>
          <button className="p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6 md:px-12 lg:px-24 -mt-12 space-y-6 relative z-10 max-w-4xl mx-auto w-full">
        
        {/* Profile Card */}
        <Card className="p-6 bg-white border border-gray-100 shadow-card rounded-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-sand-100 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-inner border-4 border-white">
            <UserIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-dark-graphite">{user.user_metadata?.full_name || "Traveler"}</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">{user.email}</p>
          <div className="mt-4 inline-flex items-center px-5 py-2 rounded-full text-[11px] font-bold tracking-wide uppercase bg-secondary/10 text-secondary">
            Verified Tourist
          </div>
        </Card>

        <MyBookingsList />

        <div className="space-y-3 mt-8">
          <h3 className="font-bold text-dark-graphite text-lg mb-2">Account Options</h3>
          <Link href="/" className="block">
            <Card className="p-4 md:p-5 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary-100 transition-colors">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-graphite">Back to Main Page</h3>
                  <p className="text-xs text-gray-500 font-medium">Return to the landing view</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-4 md:p-5 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mr-4 group-hover:bg-gray-100 transition-colors">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-graphite">Security & Privacy</h3>
                <p className="text-xs text-gray-500 font-medium">Manage password and data</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-5 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mr-4 group-hover:bg-gray-100 transition-colors">
                <HelpCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-graphite">Help & Support</h3>
                <p className="text-xs text-gray-500 font-medium">Contact us or read FAQs</p>
              </div>
            </div>
          </Card>

          <Card 
            onClick={handleSignOut}
            className="p-4 md:p-5 bg-white border border-red-100 shadow-sm rounded-xl flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer mt-8 group"
          >
            <div className="flex items-center text-error">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Log Out</h3>
            </div>
          </Card>
        </div>

      </div>
    </main>
  );
}
