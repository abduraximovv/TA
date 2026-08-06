"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, Compass, CalendarDays, ArrowRight } from "lucide-react";
import type { Destination, DestinationReviewWithAuthor, Service, Event } from "@repo/database";
import { DestinationOpinionForm } from "@/components/destinations/DestinationOpinionForm";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
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

interface DiscoverDetailClientProps {
  destination: Destination;
  opinions: DestinationReviewWithAuthor[];
  experiences: Service[];
  events: Event[];
  isLoggedIn: boolean;
}

function formatEventDate(start: string, end: string | null) {
  const s = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${s} — ${e}`;
}

export function DiscoverDetailClient({ destination, opinions, experiences, events, isLoggedIn }: DiscoverDetailClientProps) {
  const heroImage =
    destination.hero_image_url || destination.image_url || "https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=1800";

  const ratedOpinions = opinions.filter((o) => o.rating != null);
  const avgRating = ratedOpinions.length
    ? ratedOpinions.reduce((sum, o) => sum + (o.rating as number), 0) / ratedOpinions.length
    : null;

  const mapPin: MapPinData[] =
    destination.latitude != null && destination.longitude != null
      ? [
          {
            name: destination.name,
            lat: destination.latitude,
            lng: destination.longitude,
            featured: true,
            image: destination.image_url,
            description: destination.region,
          },
        ]
      : [];

  return (
    <main className="min-h-screen bg-[#F9F8F5] pb-24 text-[#0A2320]">
      {/* Immersive Hero */}
      <div className="relative h-[70vh] min-h-[560px] w-full bg-[#0A2320]">
        <img src={heroImage} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        {/* Top scrim -- keeps the back button/breadcrumb legible even on a bright sky/stone photo. */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

        <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex items-center gap-4 z-10">
          <Link
            href="/discover"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Breadcrumb light items={[{ label: "Destinations", href: "/discover" }, { label: destination.name }]} style={{ padding: 0 }} />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-[1200px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              {destination.region && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white font-mono mb-6">
                  <MapPin className="w-3 h-3" /> {destination.region}
                </div>
              )}
              <h1 className="text-5xl md:text-7xl font-serif font-semibold text-white leading-[1.05] tracking-tight max-w-4xl mb-6">
                {destination.name}
              </h1>
              {destination.description && (
                <p className="text-white/80 text-lg max-w-2xl font-sans leading-relaxed">{destination.description}</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* Left Column (Main Content) */}
          <motion.div className="w-full lg:w-[62%]" initial="hidden" animate="visible" variants={fadeUp}>
            {/* Real stat highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pb-12 border-b border-[#0A2320]/10 mb-12">
              <div className="flex flex-col gap-2">
                <Compass className="w-6 h-6 text-[#C5A880]" />
                <div>
                  <div className="font-semibold text-lg">{experiences.length}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">Experiences</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <CalendarDays className="w-6 h-6 text-[#C5A880]" />
                <div>
                  <div className="font-semibold text-lg">{events.length}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">Upcoming Events</div>
                </div>
              </div>
              {avgRating != null && (
                <div className="flex flex-col gap-2">
                  <Star className="w-6 h-6 text-[#C5A880] fill-[#C5A880]" />
                  <div>
                    <div className="font-semibold text-lg">{avgRating.toFixed(1)}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">
                      {opinions.length} Opinion{opinions.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* The Story */}
            {destination.body && (
              <div className="mb-16">
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-6">The Story</h2>
                <p className="text-gray-600 leading-relaxed text-[16px] font-sans whitespace-pre-line">{destination.body}</p>
              </div>
            )}

            {/* Real experiences located here */}
            {experiences.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-serif font-semibold text-[#0A2320]">Experiences Here</h2>
                  <Link href="/experiences" className="text-sm font-semibold text-[#006B70] flex items-center gap-1 hover:gap-2 transition-all">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {experiences.slice(0, 6).map((exp) => (
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

            {/* Real upcoming events located here */}
            {events.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-6">Upcoming Events</h2>
                <div className="flex flex-col gap-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="flex gap-5 bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm">
                      {ev.image_url && (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                          <Image src={ev.image_url} alt={ev.title} fill className="object-cover" sizes="96px" />
                        </div>
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <div className="font-mono text-[10px] text-[#C1592A] font-bold uppercase tracking-widest mb-1">
                          {formatEventDate(ev.start_date, ev.end_date)}
                        </div>
                        <h3 className="font-serif text-[17px] font-bold text-[#0A2320] leading-snug mb-1 truncate">{ev.title}</h3>
                        {ev.description && <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2">{ev.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {destination.gallery_images && destination.gallery_images.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-6">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {destination.gallery_images.map((url, i) => (
                    <div
                      key={i}
                      className={`relative rounded-2xl overflow-hidden bg-[#EFEDE7] ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
                    >
                      <Image src={url} alt={`${destination.name} photo ${i + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visitor Opinions */}
            <div>
              <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-8">
                What Visitors Say {opinions.length > 0 && `(${opinions.length})`}
              </h2>

              <div className="mb-8">
                <DestinationOpinionForm destinationId={destination.id} destinationSlug={destination.slug} isLoggedIn={isLoggedIn} />
              </div>

              {opinions.length === 0 ? (
                <p className="text-gray-500 text-[15px]">No opinions yet — be the first to share your experience.</p>
              ) : (
                <div className="space-y-6">
                  {opinions.map((op) => (
                    <div key={op.id} className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0A2320] text-white flex items-center justify-center font-serif font-semibold">
                            {(op.author_name || "A")[0]}
                          </div>
                          <span className="font-semibold text-[#0A2320]">{op.author_name ?? "Anonymous"}</span>
                        </div>
                        {op.rating != null && (
                          <div className="flex gap-1">
                            {Array.from({ length: op.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-[#C5A880] fill-[#C5A880]" />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed text-[15px] mt-4">{op.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column (Sticky) */}
          <div className="w-full lg:w-[38%] lg:sticky lg:top-32 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-black/5 border border-gray-100/50">
              <h3 className="text-xl font-serif font-semibold text-[#0A2320] mb-6">Plan Your Visit</h3>
              <div className="space-y-4 text-[14px] font-sans mb-8">
                {destination.region && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Region</span>
                    <span className="font-semibold text-[#0A2320]">{destination.region}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Experiences available</span>
                  <span className="font-semibold text-[#0A2320]">{experiences.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Upcoming events</span>
                  <span className="font-semibold text-[#0A2320]">{events.length}</span>
                </div>
              </div>
              <Link
                href="/experiences"
                className="w-full bg-[#0A2320] text-white h-14 rounded-full font-sans font-medium hover:bg-black transition-colors flex items-center justify-center"
              >
                Browse Experiences
              </Link>
            </div>

            {mapPin.length > 0 && (
              <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100/50">
                <div style={{ height: 260, position: "relative", zIndex: 0 }}>
                  <DestinationsMap pins={mapPin} hovered={destination.name} onHoverPin={() => {}} />
                </div>
                <div className="p-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0A2320]">On the Map</span>
                  <Link href="/map" className="text-xs font-bold text-[#006B70] flex items-center gap-1 hover:gap-2 transition-all">
                    Open Full Map <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
