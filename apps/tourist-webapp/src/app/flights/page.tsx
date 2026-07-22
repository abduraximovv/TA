"use client";

import React from "react";
import { Plane, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FlightsPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-sand-50 p-6">
      <div className="bg-white rounded-3xl p-10 md:p-16 max-w-2xl w-full text-center shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
          <Plane className="w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-dark-graphite mb-4">Flights</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          We are setting up our flight search engine to provide you with the best prices on airline tickets. Stay tuned!
        </p>
        <Link 
          href="/" 
          className="bg-primary hover:bg-primary-dark text-white font-bold rounded-full px-8 py-3.5 inline-flex items-center gap-2 transition-colors"
        >
          Go Back Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
