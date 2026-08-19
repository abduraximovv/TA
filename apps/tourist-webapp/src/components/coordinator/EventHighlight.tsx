"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PartyPopper, MapPin, Ticket } from "lucide-react";
import type { AIEventSearchResult } from "@repo/types";

const FALLBACK = "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80";

function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
  const startLabel = start.toLocaleDateString("en-US", opts);
  if (startIso === endIso) return startLabel;
  return `${startLabel} – ${end.toLocaleDateString("en-US", opts)}`;
}

/** Visual card flagging a genuinely date+region-overlapping local event on a specific day of the
 *  itinerary (see matchEvents.ts -- this only ever renders for a real overlap, never a "you might
 *  also like" suggestion). Deliberately distinct gold/festive styling from both ActivityCard (the
 *  AI-picked services) and the teal Agency Package cards, since this isn't a bookable slot -- it's
 *  a heads-up about something already happening near the tourist during their trip. */
export function EventHighlight({ event }: { event: AIEventSearchResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mb-4"
      style={{
        padding: 12,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(197,168,128,0.12), rgba(197,168,128,0.04))",
        border: "1px solid rgba(197,168,128,0.35)",
      }}
    >
      <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 56, height: 56, borderRadius: 12 }}>
        <Image src={event.image_url ?? FALLBACK} alt={event.title} fill className="object-cover" sizes="56px" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <PartyPopper style={{ width: 12, height: 12, color: "#C5A880", flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#A68B63", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Happening during your trip
          </span>
        </div>
        <p className="truncate" style={{ fontSize: 13.5, fontWeight: 700, color: "#0A2320", fontFamily: "'Playfair Display', serif" }}>
          {event.title}
        </p>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span style={{ fontSize: 11, color: "rgba(10,35,32,0.6)", fontWeight: 600 }}>
            {formatDateRange(event.start_date, event.end_date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin style={{ width: 10, height: 10, color: "#006B70" }} />
            <span style={{ fontSize: 11, color: "rgba(10,35,32,0.6)", fontWeight: 600 }}>{event.location}</span>
          </span>
        </div>
      </div>
      {event.ticket_url && (
        <a
          href={event.ticket_url}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-active flex-shrink-0 flex items-center gap-1"
          style={{ padding: "6px 10px", borderRadius: 10, background: "#0A2320", color: "#F9F8F5" }}
        >
          <Ticket style={{ width: 11, height: 11 }} />
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>Tickets</span>
        </a>
      )}
    </motion.div>
  );
}
