"use client";

import React from "react";
import Image from "next/image";
import { Send } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="py-8 bg-white">
      <div className="section-container">
        <div className="bg-[#1877F2] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg">
          {/* Decorative background image */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 md:opacity-60 pointer-events-none mix-blend-overlay">
            <Image
              src="https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=600"
              alt="Palm Trees"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 w-full md:w-1/2 mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
              Get Exclusive Offers <br className="hidden md:block" />& Travel Inspiration
            </h2>
            <p className="text-white/80 text-sm">
              Subscribe to our newsletter
            </p>
          </div>

          <div className="relative z-10 w-full md:w-1/2 max-w-md">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white rounded-full py-4 pl-6 pr-14 text-sm font-medium text-dark-graphite focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-dark text-white rounded-full w-10 flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 -ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
