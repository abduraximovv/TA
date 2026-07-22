"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plane, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Destination } from "@repo/database";

interface Props {
  destinations: Destination[];
}

export function DestinationsSection({ destinations }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!destinations.length) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="destinations" className="py-16 md:py-24 bg-white">
      <div className="section-container">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-graphite tracking-tight">
              Popular Destinations
            </h2>
            <Plane className="w-5 h-5 text-primary rotate-45" />
          </div>
          <Link
            href="/discover"
            className="hidden md:flex items-center text-primary text-sm font-semibold hover:gap-2 gap-1 transition-all group"
          >
            View All Destinations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Buttons */}
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scrollable Area */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-5 snap-x-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          >
            {destinations.map((dest, i) => (
              <div key={dest.id} className="snap-start shrink-0 w-[260px] md:w-[280px]">
                <DestinationCard destination={dest} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View All */}
        <div className="md:hidden mt-6 text-center">
          <Link
            href="/discover"
            className="inline-flex items-center text-primary text-sm font-bold gap-1"
          >
            View All Destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function DestinationCard({
  destination,
  index,
}: {
  destination: Destination;
  index: number;
}) {
  // Generate a random discount for UI purposes (mocking the design)
  const discounts = ["-30%", "-25%", "-20%", "-35%", "-15%"];
  const discount = discounts[index % discounts.length];
  
  // Mock price and rating based on index
  const price = 499 + (index * 100);
  const rating = (4.5 + (index % 5) * 0.1).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/discover?destination=${destination.slug}`} className="block group">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer">
          {/* Image */}
          <Image
            src={destination.image_url || "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&q=80"}
            alt={destination.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 260px, 280px"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 opacity-80" />

          {/* Discount Badge */}
          <div className="absolute top-4 left-4 bg-secondary text-white text-[11px] font-bold px-2 py-1 rounded-md">
            {discount}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-white">
            <h3 className="font-bold text-xl md:text-2xl mb-1">
              {destination.name}{destination.region ? `, ${destination.region}` : ''}
            </h3>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-medium">
                Starting from <span className="font-bold">${price}</span>
              </p>
              
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                <span className="text-sm font-bold">{rating}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
