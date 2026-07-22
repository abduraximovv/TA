"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Map, Navigation } from "lucide-react";

export function MapTeaser() {
  return (
    <section className="py-section md:py-section-lg bg-sand-50 relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          {/* Content (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-left"
          >
            <p className="text-primary text-[11px] font-semibold uppercase tracking-[3px] mb-3">
              Interactive Map
            </p>
            <h2 className="text-3xl md:text-[42px] font-serif font-bold text-dark-graphite tracking-tight leading-tight mb-6">
              Navigate the Silk Road
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Discover hidden gems, essential amenities, and curated routes on our interactive map. Find exactly what you need, wherever your journey takes you.
            </p>
            
            <Link
              href="/map"
              className="btn-pill-primary px-8 py-4 inline-flex gap-2"
            >
              <Map className="w-5 h-5" />
              Open Interactive Map
            </Link>
          </motion.div>

          {/* Visual (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative"
          >
            {/* Abstract Map Representation */}
            <div className="relative aspect-square md:aspect-[4/3] bg-white rounded-2xl shadow-card border border-gray-100 p-4 md:p-8 overflow-hidden group">
              {/* Decorative grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Path line SVG */}
              <svg className="absolute inset-0 w-full h-full text-primary/20 stroke-current stroke-2 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 20,80 Q 40,20 80,40 T 90,10" strokeDasharray="5,5" />
              </svg>

              {/* Pulsing markers */}
              <div className="absolute top-[30%] left-[40%] text-primary">
                <div className="w-4 h-4 bg-primary rounded-full absolute z-10 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                <div className="w-8 h-8 bg-primary/30 rounded-full absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-marker" />
              </div>
              
              <div className="absolute top-[60%] left-[20%] text-secondary">
                <div className="w-3 h-3 bg-secondary rounded-full absolute z-10 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                <div className="w-6 h-6 bg-secondary/30 rounded-full absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-marker" style={{ animationDelay: '1s' }} />
              </div>
              
              <div className="absolute top-[20%] left-[80%] text-accent">
                <div className="w-3 h-3 bg-accent rounded-full absolute z-10 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
                <div className="w-6 h-6 bg-accent/30 rounded-full absolute -translate-x-1/2 -translate-y-1/2 animate-pulse-marker" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Hover Navigation icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/40 backdrop-blur-[2px]">
                <div className="w-16 h-16 bg-white rounded-full shadow-card flex items-center justify-center text-primary transform scale-90 group-hover:scale-100 transition-transform duration-500 delay-100">
                  <Navigation className="w-6 h-6" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
