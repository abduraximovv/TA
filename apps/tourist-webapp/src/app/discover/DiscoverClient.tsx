"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Compass, ArrowRight, Star, Clock } from "lucide-react";
import type { Service, Location } from "@repo/database";
import { formatDuration } from "@repo/database";

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

interface DiscoverClientProps {
  services: Service[];
  locations: Location[];
}

export function DiscoverClient({ services, locations }: DiscoverClientProps) {
  return (
    <main className="flex flex-col min-h-screen pt-24 pb-24 bg-sand-50 selection:bg-primary/20">
      <div className="section-container">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-dark-graphite mb-4">
            Discover <span className="text-primary">Uzbekistan</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Find verified experiences and essential locations.
          </p>
        </motion.header>

        {/* Services Grid */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-16"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-end justify-between mb-8"
          >
            <h2 className="text-2xl font-bold text-dark-graphite flex items-center tracking-tight">
              <Compass className="w-6 h-6 text-accent mr-2" />
              Curated Experiences
            </h2>
          </motion.div>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="w-full h-40 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[1.5rem] bg-white">
              <Compass className="w-8 h-8 text-gray-300 mb-2" />
              <span className="text-gray-400 text-sm font-medium">
                No experiences available yet.
              </span>
            </div>
          )}
        </motion.section>

        {/* Locations Summary */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            className="flex items-end justify-between mb-8"
          >
            <h2 className="text-2xl font-bold text-dark-graphite flex items-center tracking-tight">
              <MapPin className="w-6 h-6 text-primary mr-2" />
              Essential Hubs
            </h2>
            <Link
              href="/map"
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1 group"
            >
              Open Map{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.length > 0 ? (
              locations.map((loc) => (
                <motion.div
                  key={loc.id}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className="transition-transform"
                >
                  <div className="p-4 flex items-center border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 ${
                        loc.category === "sos"
                          ? "bg-red-50 text-red-500"
                          : loc.category === "pharmacy"
                          ? "bg-green-50 text-green-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-dark-graphite text-base tracking-tight mb-0.5 line-clamp-1">
                        {loc.name}
                      </h3>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                        {loc.category.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full p-8 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[1.5rem] bg-white">
                <span className="text-gray-400 text-sm font-medium">
                  No locations found.
                </span>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}

// ─── Service Card ───────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
  const duration = formatDuration(service.duration_minutes);
  const locationText = [service.city, service.region]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="transition-transform h-full"
    >
      <Link href={`/service/${service.id}`} className="block group h-full">
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-card transition-all duration-300 h-full flex flex-col p-3">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
            <Image
              src={
                service.image_url ||
                "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&q=80"
              }
              alt={service.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />

            {/* Top Right Rating */}
            {service.rating_avg > 0 && (
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-dark-graphite flex items-center shadow-sm">
                <Star className="w-3.5 h-3.5 text-accent fill-accent mr-1" />
                {service.rating_avg.toFixed(1)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-2 pb-2 flex flex-col flex-1">
            <div className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-1.5">
              {service.category}
            </div>

            <h3 className="text-dark-graphite font-bold text-lg leading-snug tracking-tight mb-1 truncate">
              {service.title}
            </h3>

            {/* Meta: duration & location — only show if real data exists */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mb-4">
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </span>
              )}
              {locationText && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {locationText}
                </span>
              )}
              {service.rating_count > 0 && (
                <span>
                  {service.rating_count} review
                  {service.rating_count !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
              <span className="text-dark-graphite font-black text-lg leading-none">
                {new Intl.NumberFormat("uz-UZ").format(service.price)}{" "}
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-0.5">
                  {service.currency}
                </span>
              </span>

              <span className="bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl px-5 py-2.5 transition-colors">
                Book Now
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
