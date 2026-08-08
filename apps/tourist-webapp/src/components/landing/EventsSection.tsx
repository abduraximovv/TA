"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Event } from "@repo/database";
import { EventCard } from "@/components/events/EventCard";

interface Props {
  events: Event[];
}

const FALLBACK_EVENTS: Event[] = [
  {
    id: "evt-1",
    slug: null,
    title: "Sharq Taronalari Music Festival",
    description: null,
    location: "Samarkand",
    destination_id: null,
    event_type: "Culture",
    start_date: "2026-08-24",
    end_date: "2026-08-28",
    image_url: "https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=900",
    ticket_url: null,
    is_featured: true,
    latitude: null,
    longitude: null,
  },
  {
    id: "evt-2",
    slug: null,
    title: "Navruz Spring Festival",
    description: null,
    location: "Tashkent",
    destination_id: null,
    event_type: "Tradition",
    start_date: "2026-03-21",
    end_date: "2026-03-21",
    image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=900",
    ticket_url: null,
    is_featured: true,
    latitude: null,
    longitude: null,
  },
  {
    id: "evt-3",
    slug: null,
    title: "Bukhara Silk & Spice Festival",
    description: null,
    location: "Bukhara",
    destination_id: null,
    event_type: "Bazaar",
    start_date: "2026-05-16",
    end_date: "2026-05-18",
    image_url: "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=900",
    ticket_url: null,
    is_featured: true,
    latitude: null,
    longitude: null,
  },
];

export function EventsSection({ events }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cards = events.length > 0 ? events : FALLBACK_EVENTS;

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "clamp(56px, 10vw, 88px) 0", background: "#0A2320" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 40,
          paddingLeft: "var(--section-padding-x)",
          paddingRight: "var(--section-padding-x)",
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
              fontSize: "var(--text-h2)",
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            What&rsquo;s On
          </div>
        </div>
        <Link
          href="/events"
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
            paddingLeft: "var(--section-padding-x)",
            paddingRight: "var(--section-padding-x)",
            scrollPaddingLeft: "var(--section-padding-x)",
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          {cards.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ flexShrink: 0 }}
            >
              <EventCard event={evt} theme="dark" width="clamp(200px, 55vw, 340px)" />
            </motion.div>
          ))}
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
    </section>
  );
}
