"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@repo/ui";
import { Map, MessageSquare, Compass, Bell } from "lucide-react";
import { useAuth } from "@repo/auth";

export default function TouristDashboard() {
  const { user } = useAuth();

  return (
    <main className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Top App Bar */}
      <header className="bg-[#1E6F8A] text-white pt-12 pb-6 px-6 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-blue-100 font-medium tracking-wide">Dashboard</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {user ? `Hello, ${user.user_metadata?.full_name?.split(" ")[0] || "Traveler"}` : "Welcome"}
            </h1>
          </div>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="w-full bg-white text-gray-900 rounded-xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all font-medium"
          />
          <Compass className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6 mt-8 space-y-8">
        
        {/* Core Tools */}
        <section>
          <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4">Core Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/map" className="block outline-none group">
              <Card className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(30,111,138,0.08)] transition-all duration-300 hover:-translate-y-1 h-36 rounded-2xl">
                <div className="w-14 h-14 bg-blue-50/50 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#1E6F8A]/10 transition-colors">
                  <Map className="w-7 h-7 text-[#1E6F8A]" />
                </div>
                <span className="font-semibold text-gray-900 text-sm">Survival Map</span>
              </Card>
            </Link>

            <Link href="/translator" className="block outline-none group">
              <Card className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(30,111,138,0.08)] transition-all duration-300 hover:-translate-y-1 h-36 rounded-2xl">
                <div className="w-14 h-14 bg-blue-50/50 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#1E6F8A]/10 transition-colors">
                  <MessageSquare className="w-7 h-7 text-[#1E6F8A]" />
                </div>
                <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">Translator</span>
              </Card>
            </Link>
          </div>
        </section>

        {/* Featured Destinations */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase">Trending Areas</h2>
            <button className="text-sm font-semibold text-[#1E6F8A] hover:underline">See all</button>
          </div>
          
          <div className="space-y-4">
            <Link href="/map?lat=39.6542&lng=66.9597" className="block outline-none group">
              <Card className="relative overflow-hidden h-40 rounded-2xl border-none shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-end p-6">
                <div className="absolute inset-0 bg-[#1E6F8A] opacity-[0.85] transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 w-full flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-bold text-2xl tracking-tight mb-1">Samarkand</h3>
                    <p className="text-white/80 text-sm font-medium">12 active services</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Compass className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/map?lat=39.7747&lng=64.4286" className="block outline-none group">
              <Card className="relative overflow-hidden h-40 rounded-2xl border-none shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-end p-6">
                <div className="absolute inset-0 bg-[#D4A843] opacity-[0.85] transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 w-full flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-bold text-2xl tracking-tight mb-1">Bukhara</h3>
                    <p className="text-white/80 text-sm font-medium">8 active services</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Compass className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
