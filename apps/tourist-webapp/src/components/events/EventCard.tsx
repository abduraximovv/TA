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
    <div
      className="event-card"
      style={{
        width,
        borderRadius: 20,
        background: dark ? "#0A2320" : "#FFFFFF",
        border: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #EFEDE7",
        boxShadow: dark ? "0 20px 40px -24px rgba(0,0,0,0.5)" : "0 8px 24px -12px rgba(10,35,32,0.12)",
        padding: 16,
        opacity: isPast ? 0.6 : 1,
      }}
    >
      <div style={{ position: "relative", height: imageHeight, borderRadius: 14, overflow: "hidden" }}>
        <Image
          src={event.image_url || "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=900"}
          alt={event.title}
          fill
          className="object-cover event-card-img"
          sizes={typeof width === "number" ? `${width}px` : "(max-width: 768px) 100vw, 340px"}
        />
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
          <div>
            {start.day} / {start.month} / {start.year}
          </div>
          {end && (end.day !== start.day || end.month !== start.month) && (
            <div style={{ color: "rgba(249,248,245,0.6)" }}>
              {end.day} / {end.month} / {end.year}
            </div>
          )}
        </div>
        {isPast && (
          <div
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "rgba(0,0,0,0.6)",
              borderRadius: 999,
              padding: "5px 12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#F9F8F5",
            }}
          >
            Concluded
          </div>
        )}
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
              color: "#006B70",
              marginBottom: 10,
              fontFamily: "'Inter', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {event.location || "Uzbekistan"} | {event.event_type}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: dark ? "#FFFFFF" : "#0A2320",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.title}
          </div>
        </div>
        <Link
          href={href}
          className="btn-pill-primary"
          style={{ textDecoration: "none", fontSize: 13.5, padding: "10px 22px", marginTop: 16, display: "inline-flex" }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
