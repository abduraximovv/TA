"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { SearchWidget } from "./SearchWidget";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-sand-50 pb-20 md:pb-32 lg:pb-16 pt-6">
      <div className="section-container relative">
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden">
          {/* Background Image */}
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"
            alt="Beautiful Mountains Landscape"
            fill
            priority
            className="object-cover"
            quality={85}
            sizes="100vw"
          />
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

          {/* Hero Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 z-10 flex flex-col justify-center p-8 md:p-16 max-w-3xl"
          >
            {/* Main Heading */}
            <motion.h1
              variants={fadeUp}
              className="text-[40px] md:text-[64px] font-bold text-white leading-[1.1] tracking-tight mb-4"
            >
              Explore the World <br />
              Create <span className="font-cursive text-secondary text-[56px] md:text-[80px] leading-[0.8] ml-2">Memories</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-white/90 text-lg font-medium max-w-md leading-relaxed mb-8"
            >
              Discover amazing places at exclusive prices and unforgettable experiences.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <a
                href="#destinations"
                className="bg-primary hover:bg-primary-dark text-white rounded-full px-6 py-3.5 font-bold flex items-center justify-center gap-2 transition-colors"
              >
                Explore Destinations <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/packages"
                className="bg-white text-dark-graphite hover:bg-gray-100 rounded-full px-8 py-3.5 font-bold transition-colors text-center"
              >
                View Packages
              </a>
            </motion.div>

            {/* Trusted By */}
            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-2 border-white" alt="User 1" />
                <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 rounded-full border-2 border-white" alt="User 2" />
                <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 rounded-full border-2 border-white" alt="User 3" />
                <img src="https://i.pravatar.cc/100?img=4" className="w-10 h-10 rounded-full border-2 border-white" alt="User 4" />
              </div>
              <p className="text-white text-sm font-medium">Trusted by 250,000+ happy travelers</p>
            </motion.div>
          </motion.div>

          {/* Floating Special Offer Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
            className="hidden md:flex absolute top-16 right-16 bg-white rounded-2xl p-4 shadow-2xl flex-col items-center gap-1 z-20"
          >
            <div className="flex items-center gap-1 text-accent font-bold text-sm">
              <Star className="w-4 h-4 fill-accent" /> Special Offer
            </div>
            <p className="text-dark-graphite text-xs font-semibold">Get up to</p>
            <p className="text-3xl font-black text-primary leading-none my-1">30% OFF</p>
            <p className="text-gray-500 text-xs font-medium">On all bookings</p>
          </motion.div>
        </div>

        {/* Search Widget Positioned Overlapping */}
        <div className="relative z-30 -mt-20 md:-mt-16 px-4 md:px-12">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
