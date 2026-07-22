"use client";

import React, { useState } from "react";
import { Plane, Building2, Package, Map, Calendar, User, Search } from "lucide-react";

export function SearchWidget() {
  const [activeTab, setActiveTab] = useState("flights");

  const tabs = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "hotels", label: "Hotels", icon: Building2 },
    { id: "packages", label: "Packages", icon: Package },
    { id: "activities", label: "Activities", icon: Map },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 w-full max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-50 hover:text-dark-graphite"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto flex-1">
          {/* From */}
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[11px] text-gray-500 font-semibold uppercase mb-1">From</span>
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-gray-400" />
              <input type="text" defaultValue="New York (NYC)" className="w-full text-sm font-bold text-dark-graphite focus:outline-none" />
            </div>
          </div>

          {/* To */}
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[11px] text-gray-500 font-semibold uppercase mb-1">To</span>
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-gray-400" />
              <input type="text" defaultValue="Paris, France" className="w-full text-sm font-bold text-dark-graphite focus:outline-none" />
            </div>
          </div>

          {/* Dates */}
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Check-in - Check-out</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input type="text" defaultValue="May 20 - May 27" className="w-full text-sm font-bold text-dark-graphite focus:outline-none" />
            </div>
          </div>

          {/* Travelers */}
          <div className="border border-gray-200 rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Travelers</span>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <input type="text" defaultValue="2 Adults, 1 Child" className="w-full text-sm font-bold text-dark-graphite focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button className="w-full lg:w-auto bg-primary hover:bg-primary-dark text-white rounded-xl py-4 px-8 font-bold flex items-center justify-center gap-2 transition-colors h-[64px]">
          <Search className="w-5 h-5" />
          Search Now
        </button>
      </div>
    </div>
  );
}
