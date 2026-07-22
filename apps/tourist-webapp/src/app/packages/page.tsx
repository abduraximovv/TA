"use client";

import React from "react";
import { Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PackagesPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-sand-50 p-6">
      <div className="bg-white rounded-3xl p-10 md:p-16 max-w-2xl w-full text-center shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
          <Package className="w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-dark-graphite mb-4">Tour Packages</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          We are currently crafting exclusive travel packages. Check back soon for amazing deals on curated trips!
        </p>
        <Link 
          href="/discover" 
          className="bg-primary hover:bg-primary-dark text-white font-bold rounded-full px-8 py-3.5 inline-flex items-center gap-2 transition-colors"
        >
          Explore Destinations <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
