"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Plane, ArrowRight } from "lucide-react";
import type { Service } from "@repo/database";

interface Props {
  experiences: Service[];
}

export function ExperiencesSection({ experiences }: Props) {
  if (!experiences.length) return null;

  // We'll use the first experience as the "Top Deal" and the rest as normal cards
  const topDeal = experiences[0];
  const otherDeals = experiences.slice(1, 4); // Take next 3

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Top Deal Card (Spans 1 col on mobile/tablet, 1 col on desktop but distinct styling) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="bg-[#0F5AC2] rounded-3xl p-8 h-full text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer">
              {/* Globe/Plane decorative background */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-50 group-hover:scale-110 transition-transform duration-700">
                <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400" alt="Globe" fill className="object-cover rounded-full mix-blend-overlay" />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-30">
                <Plane className="w-24 h-24" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl font-black leading-tight mb-2">
                  Top Deals<br />This Week
                </h2>
                <p className="text-white/80 text-sm mb-6">
                  Limited time offers<br />Don&apos;t miss out!
                </p>
                <Link
                  href={`/service/${topDeal.id}`}
                  className="bg-white text-dark-graphite font-bold rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  Grab Deals <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Other Deals Grid (Spans 3 cols on desktop) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {otherDeals.map((exp, i) => (
              <DealCard key={exp.id} experience={exp} index={i} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function DealCard({
  experience,
  index,
}: {
  experience: Service;
  index: number;
}) {
  const badges = [
    { text: "Best Seller", color: "bg-primary" },
    { text: "Hot Deal", color: "bg-secondary" },
    { text: "New Offer", color: "bg-purple-500" },
  ];
  const badge = badges[index % badges.length];
  
  // Mock duration and old price
  const duration = "5 Days / 4 Nights";
  const currentPrice = experience.price || 629;
  const oldPrice = Math.round(currentPrice * 1.4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/service/${experience.id}`}
        className="block group h-full"
      >
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-card transition-all duration-300 h-full flex flex-col p-3">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
            <Image
              src={
                experience.image_url ||
                "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&q=80"
              }
              alt={experience.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />

            {/* Top Left Badge */}
            <div className={`absolute top-3 left-3 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${badge.color}`}>
              {badge.text}
            </div>
          </div>

          {/* Content */}
          <div className="px-2 pb-2 flex flex-col flex-1">
            <h3 className="text-dark-graphite font-bold text-lg leading-snug tracking-tight mb-1 truncate">
              {experience.title}
            </h3>
            
            <p className="text-xs text-gray-500 font-medium mb-4">
              {duration}
            </p>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm line-through font-semibold">${oldPrice}</span>
                <span className="text-dark-graphite font-black text-lg">${currentPrice}</span>
              </div>
              
              <span className="text-primary text-xs font-bold hover:underline">
                View Details
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
