"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Event } from "@repo/database";

interface Props {
  event: Event;
  /** Fixed pixel width for horizontal-scroll rows, or "100%" to fill a grid cell. */
  width?: number | string;
  imageHeight?: number;
  /**
   * "light" (default) matches every other content page's white card idiom (Discover, Packages,
   * Experiences). "dark" is only for the homepage's "What's On" strip, which has its own dark
   * full-bleed section background to sit against.
   */
  theme?: "light" | "dark";
}

function formatDateBadge(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  return { day, month, year };
}

/** Shared event card -- used on the homepage "What's On" carousel and the /events collection page. */
export function EventCard({ event, width = 400, imageHeight = 340, theme = "light" }: Props) {
  const start = formatDateBadge(event.start_date);
  const end = event.end_date ? formatDateBadge(event.end_date) : null;
  const href = event.slug ? `/events/${event.slug}` : "/events";
  const isPast = event.end_date ? event.end_date < new Date().toISOString().split("T")[0] : false;
  const dark = theme === "dark";

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block", width }}>
      <div
        className="event-card"
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          aspectRatio: "3/4",
          cursor: "pointer",
          opacity: isPast ? 0.6 : 1,
        }}
      >
        <Image
          src={event.image_url || "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=900"}
          alt={event.title}
          fill
          className="object-cover event-card-img transition-transform duration-700 hover:scale-105"
          sizes={typeof width === "number" ? `${width}px` : "(max-width: 768px) 50vw, 340px"}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(10,35,32,0.9) 0%, rgba(10,35,32,0.3) 45%, transparent 65%)",
          }}
        />
        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-[#0A2320]/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-lg font-mono leading-relaxed">
          <div>{start.day} / {start.month}</div>
          {end && (end.day !== start.day || end.month !== start.month) && (
            <div className="text-white/50">{end.day} / {end.month}</div>
          )}
        </div>
        {/* Past badge */}
        {isPast && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
            Concluded
          </div>
        )}
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif text-[16px] md:text-[20px] font-bold text-white leading-tight mb-1 line-clamp-2">
            {event.title}
          </h3>
          <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
            {event.location || "Uzbekistan"}
          </div>
        </div>
      </div>
    </Link>
  );
}
