"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, CalendarDays, ArrowRight, Ticket } from "lucide-react";
import type { Event, Destination, Service } from "@repo/database";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { EventCard } from "@/components/events/EventCard";
import type { MapPinData } from "@/components/landing/DestinationsMap";

const DestinationsMap = dynamic(() => import("@/components/landing/DestinationsMap").then((m) => m.DestinationsMap), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,35,32,0.4)", fontSize: 12 }}>
      Loading map…
    </div>
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

interface Props {
  event: Event;
  destination: Destination | null;
  nearbyExperiences: Service[];
  moreEvents: Event[];
}

function formatDateRange(start: string, end: string | null) {
  const s = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  if (!end || end === start) return s;
  const sameMonth = new Date(start).getMonth() === new Date(end).getMonth();
  const startShort = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: sameMonth ? undefined : "long" });
  const endFull = new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `${startShort} — ${endFull}`;
}

function daysUntil(dateStr: string) {
  const ms = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function EventDetailClient({ event, destination, nearbyExperiences, moreEvents }: Props) {
  const heroImage = event.image_url || "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=1800";
  const days = daysUntil(event.start_date);
  const today = new Date().toISOString().split("T")[0];
  const hasEnded = (event.end_date || event.start_date) < today;
  const isLive = !hasEnded && days <= 0;

  const mapPin: MapPinData[] =
    event.latitude != null && event.longitude != null
      ? [{ name: event.title, lat: event.latitude, lng: event.longitude, featured: true, image: event.image_url, description: event.location }]
      : [];

  return (
    <main className="min-h-screen bg-[#F9F8F5] pb-24 text-[#0A2320]">
      {/* Immersive Hero */}
      <div className="relative h-[65vh] min-h-[520px] w-full bg-[#0A2320]">
        <img src={heroImage} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

        <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex items-center gap-4 z-10">
          <Link
            href="/events"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Breadcrumb light items={[{ label: "Events", href: "/events" }, { label: event.title }]} style={{ padding: 0 }} />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-[1200px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006B70] rounded-full text-xs font-bold uppercase tracking-wider text-white font-mono">
                  <CalendarDays className="w-3 h-3" /> {formatDateRange(event.start_date, event.end_date)}
                </div>
                {isLive ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Happening now
                  </div>
                ) : hasEnded ? (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white/70 font-mono">
                    Concluded
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Starts in {days} day{days !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-semibold text-white leading-[1.05] tracking-tight max-w-4xl mb-4">{event.title}</h1>
              {event.location && (
                <div className="flex items-center gap-2 text-white/80 text-base font-sans">
                  <MapPin className="w-4 h-4" /> {event.location}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* Left Column */}
          <motion.div className="w-full lg:w-[62%]" initial="hidden" animate="visible" variants={fadeUp}>
            {event.description && (
              <div className="mb-16">
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-6">About this Event</h2>
                <p className="text-gray-600 leading-relaxed text-[16px] font-sans whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {mapPin.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-6">Where It's Happening</h2>
                <div className="rounded-[24px] overflow-hidden border border-gray-100" style={{ height: 320, position: "relative", zIndex: 0 }}>
                  <DestinationsMap pins={mapPin} hovered={event.title} onHoverPin={() => {}} />
                </div>
              </div>
            )}

            {nearbyExperiences.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-serif font-semibold text-[#0A2320]">Other Experiences Nearby</h2>
                  <Link href="/experiences" className="text-sm font-semibold text-[#006B70] flex items-center gap-1 hover:gap-2 transition-all">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {nearbyExperiences.slice(0, 6).map((exp) => (
                    <Link key={exp.id} href={`/service/${exp.id}`} style={{ textDecoration: "none" }}>
                      <div className="flex flex-col gap-3 cursor-pointer group">
                        <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-[#EFEDE7]">
                          <Image
                            src={exp.image_url || "https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=800"}
                            alt={exp.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1024px) 33vw, 240px"
                          />
                        </div>
                        <div className="flex flex-col gap-1 px-1">
                          <div className="font-mono text-[10px] text-[#006B70] font-semibold uppercase tracking-widest">{exp.category}</div>
                          <h3 className="font-serif text-[16px] font-bold text-[#0A2320] leading-[1.3] line-clamp-2">{exp.title}</h3>
                          <div className="mt-1 font-mono text-[13px] font-bold text-[#0A2320]">
                            {(Number(exp.price) || 0).toLocaleString("en-US").replace(/,/g, " ")} {exp.currency}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column (Sticky) */}
          <div className="w-full lg:w-[38%] lg:sticky lg:top-32 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-black/5 border border-gray-100/50">
              <h3 className="text-xl font-serif font-semibold text-[#0A2320] mb-6">Event Details</h3>
              <div className="space-y-4 text-[14px] font-sans mb-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500 shrink-0">Dates</span>
                  <span className="font-semibold text-[#0A2320] text-right">{formatDateRange(event.start_date, event.end_date)}</span>
                </div>
                {event.location && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-500 shrink-0">Location</span>
                    <span className="font-semibold text-[#0A2320] text-right">{event.location}</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500 shrink-0">Category</span>
                  <span className="font-semibold text-[#0A2320] text-right">{event.event_type}</span>
                </div>
              </div>
              {event.ticket_url ? (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#006B70] text-white h-14 rounded-full font-sans font-medium hover:bg-[#00565a] transition-colors flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" /> Get Tickets
                </a>
              ) : (
                <div className="w-full bg-[#F9F8F5] border border-gray-200 text-gray-500 h-14 rounded-full font-sans text-sm flex items-center justify-center text-center px-4">
                  Ticket details coming soon
                </div>
              )}
            </div>

            {destination && (
              <Link href={`/discover/${destination.slug}`} style={{ textDecoration: "none" }}>
                <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100/50 flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                    <Image src={destination.image_url || heroImage} alt={destination.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-[#006B70] font-semibold uppercase tracking-widest mb-1">Part of</div>
                    <div className="font-serif text-[16px] font-bold text-[#0A2320] truncate">{destination.name}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0A2320]/40 ml-auto shrink-0" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {moreEvents.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[#0A2320]/10">
            <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-8">More Upcoming Events</h2>
            <div className="flex gap-6 flex-wrap">
              {moreEvents.map((e) => (
                <EventCard key={e.id} event={e} width={340} imageHeight={220} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
