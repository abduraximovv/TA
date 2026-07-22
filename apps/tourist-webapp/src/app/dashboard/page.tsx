"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@repo/ui";
import { Map, MessageSquare, Compass, Bell } from "lucide-react";
import { useAuth } from "@repo/auth";

export default function TouristDashboard() {
  const { user } = useAuth();

  return (
    <main className="flex flex-col min-h-screen bg-sand-50 pb-20">
      {/* Top App Bar */}
      <header className="bg-primary text-white pt-12 pb-6 px-6 md:px-12 lg:px-24 rounded-b-3xl shadow-sm relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-pattern-dash" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 0L100 50L50 100L0 50Z" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-pattern-dash)" />
          </svg>
        </div>
        
        <div className="flex justify-between items-center mb-6 relative z-10 max-w-4xl mx-auto">
          <div>
            <p className="text-sm text-primary-50 font-semibold uppercase tracking-[3px] mb-1">Dashboard</p>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              {user ? `Hello, ${user.user_metadata?.full_name?.split(" ")[0] || "Traveler"}` : "Welcome"}
            </h1>
          </div>
          <button className="p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="w-full bg-white text-dark-graphite rounded-xl py-4 pl-12 pr-4 shadow-navbar focus:outline-none focus:ring-2 focus:ring-secondary transition-all font-medium"
          />
          <Compass className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6 md:px-12 lg:px-24 mt-8 space-y-8 max-w-5xl mx-auto w-full">
        
        {/* Core Tools */}
        <section>
          <h2 className="text-[11px] font-bold tracking-[2px] text-gray-400 uppercase mb-4">Core Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/map" className="block outline-none group">
              <Card className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-36 rounded-2xl">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                  <Map className="w-7 h-7 text-primary" />
                </div>
                <span className="font-semibold text-dark-graphite text-sm">Interactive Map</span>
              </Card>
            </Link>

            <Link href="/translator" className="block outline-none group">
              <Card className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-36 rounded-2xl">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                  <MessageSquare className="w-7 h-7 text-primary" />
                </div>
                <span className="font-semibold text-dark-graphite text-sm whitespace-nowrap">Translator</span>
              </Card>
            </Link>
          </div>
        </section>

        {/* Featured Destinations */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[11px] font-bold tracking-[2px] text-gray-400 uppercase">Trending Areas</h2>
            <Link href="/discover" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">See all</Link>
          </div>
          
          <div className="space-y-4 md:grid md:grid-cols-2 md:space-y-0 md:gap-4">
            <Link href="/map?lat=39.6542&lng=66.9597" className="block outline-none group">
              <Card className="relative overflow-hidden h-44 rounded-2xl border-none shadow-card flex items-end p-6">
                <div className="absolute inset-0 bg-primary opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Pattern overlay */}
                <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <svg width="150" height="150" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2"/></svg>
                </div>
                <div className="relative z-10 w-full flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-serif font-bold text-3xl tracking-tight mb-1">Samarkand</h3>
                    <p className="text-white/80 text-sm font-medium">18 active services</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Compass className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/map?lat=39.7747&lng=64.4286" className="block outline-none group">
              <Card className="relative overflow-hidden h-44 rounded-2xl border-none shadow-card flex items-end p-6">
                <div className="absolute inset-0 bg-secondary opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <svg width="150" height="150" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2"/></svg>
                </div>
                <div className="relative z-10 w-full flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-serif font-bold text-3xl tracking-tight mb-1">Bukhara</h3>
                    <p className="text-white/80 text-sm font-medium">14 active services</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Compass className="w-6 h-6" />
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
