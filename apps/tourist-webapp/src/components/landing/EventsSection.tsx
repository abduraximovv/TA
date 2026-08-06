"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import type { Event } from "@repo/database";

interface Props {
  events: Event[];
}

const FALLBACK_EVENTS = [
  {
    id: "evt-1",
    title: "Sharq Taronalari Music Festival",
    location: "Samarkand",
    event_type: "Culture",
    start_date: "2026-08-24",
    end_date: "2026-08-28",
    image_url:
      "https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=900",
    ticket_url: "/discover",
  },
  {
    id: "evt-2",
    title: "Navruz Spring Festival",
    location: "Tashkent",
    event_type: "Tradition",
    start_date: "2026-03-21",
    end_date: "2026-03-21",
    image_url:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=900",
    ticket_url: "/discover",
  },
  {
    id: "evt-3",
    title: "Bukhara Silk & Spice Festival",
    location: "Bukhara",
    event_type: "Bazaar",
    start_date: "2026-05-16",
    end_date: "2026-05-18",
    image_url:
      "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=900",
    ticket_url: "/discover",
  },
];

function formatDateBadge(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  return { day, month, year };
}

export function EventsSection({ events }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cards = events.length > 0 ? events : FALLBACK_EVENTS;

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "88px 0", background: "#0A2320" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 40,
          paddingLeft: 56,
          paddingRight: 56,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#C5A880",
              marginBottom: 12,
            }}
          >
            Uzbekistan Calendar
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            What&rsquo;s On
          </div>
        </div>
        <Link
          href="/discover"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#C5A880",
            textDecoration: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          View full calendar →
        </Link>
      </div>

      <div style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          className="scrollbar-hide snap-x-cards"
          style={{
            display: "flex",
            gap: 20,
            paddingTop: 16,
            paddingBottom: 28,
            paddingLeft: 56,
            paddingRight: 56,
            scrollPaddingLeft: 56,
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          {cards.map((evt, i) => {
            const start = formatDateBadge(evt.start_date);
            const end = evt.end_date ? formatDateBadge(evt.end_date) : null;
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ flexShrink: 0, width: 400 }}
              >
                <div
                  className="event-card"
                  style={{
                    borderRadius: 20,
                    background: "#0A2320",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 20px 40px -24px rgba(0,0,0,0.5)",
                    padding: 16,
                  }}
                >
                  <div style={{ position: "relative", height: 340, borderRadius: 14, overflow: "hidden" }}>
                    <Image
                      src={evt.image_url || FALLBACK_EVENTS[0].image_url}
                      alt={evt.title}
                      fill
                      className="object-cover event-card-img"
                      sizes="400px"
                    />
                    {/* Stacked date badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 18,
                        left: 18,
                        background: "rgba(10,35,32,0.75)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: "#F9F8F5",
                        lineHeight: 1.7,
                      }}
                    >
                      <div>{start.day} / {start.month} / {start.year}</div>
                      {end && (end.day !== start.day || end.month !== start.month) && (
                        <div style={{ color: "rgba(249,248,245,0.6)" }}>
                          {end.day} / {end.month} / {end.year}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "20px 8px 6px" }}>
                    <div style={{ height: 104, overflow: "hidden" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12.5,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#C5A880",
                          marginBottom: 10,
                          fontFamily: "'Inter', sans-serif",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <MapPin size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {evt.location || "Uzbekistan"} | {evt.event_type}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 22,
                          fontWeight: 600,
                          color: "#FFFFFF",
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {evt.title}
                      </div>
                    </div>
                    <Link
                      href={evt.ticket_url || "/discover"}
                      className="btn-pill-primary"
                      style={{ textDecoration: "none", fontSize: 13.5, padding: "10px 22px", marginTop: 16, display: "inline-flex" }}
                    >
                      {evt.ticket_url ? "Buy Tickets" : "Visit Website"}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={() => scrollBy(420)}
          aria-label="Next events"
          className="carousel-arrow"
          style={{ position: "absolute", right: 24, top: "34%" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <style>{`
        .event-card-img { transition: transform 0.7s ease-out; }
        .event-card:hover .event-card-img { transform: scale(1.05); }
      `}</style>
    </section>
  );
}
