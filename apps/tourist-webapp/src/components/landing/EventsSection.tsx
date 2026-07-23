"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import type { Event } from "@repo/database";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

interface Props {
  events: Event[];
}

export function EventsSection({ events }: Props) {
  if (!events.length) return null;

  return (
    <section className="py-section md:py-section-lg bg-dark-forest text-white">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mb-8 md:mb-12"
        >
          <p className="text-secondary text-[11px] font-semibold uppercase tracking-[3px] mb-2">
            What&apos;s On
          </p>
          <h2 className="text-3xl md:text-[42px] font-serif font-bold tracking-tight leading-tight">
            Upcoming Events
          </h2>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = startDate.getDate();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        },
      }}
      className="group"
    >
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={
              event.image_url ||
              "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80"
            }
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white text-dark-graphite rounded-md px-3 py-2 text-center shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary leading-none mb-0.5">
              {month}
            </p>
            <p className="text-xl font-bold leading-none">{day}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-1 text-[11px] text-white/50 font-medium mb-2">
            <MapPin className="w-3 h-3" />
            {event.location}
          </div>

          <h3 className="text-white font-bold text-lg tracking-tight mb-3 line-clamp-2 flex-1">
            {event.title}
          </h3>

          <p className="text-white/50 text-[13px] leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>

          <button className="inline-flex items-center text-secondary text-sm font-semibold gap-1 group/btn hover:gap-2 transition-all mt-auto">
            Learn More
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
