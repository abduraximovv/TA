"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Event } from "@repo/database";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PageHero } from "@/components/PageHero";
import { EventCard } from "@/components/events/EventCard";
import { Footer } from "@/components/landing/Footer";

interface Props {
  events: Event[];
}

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function daysUntil(dateStr: string) {
  const ms = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function EventsClient({ events }: Props) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // Real, derived from the actual events passed in -- never a hardcoded list.
  const eventTypes = useMemo(() => Array.from(new Set(events.map((e) => e.event_type).filter(Boolean))).sort(), [events]);
  const cities = useMemo(
    () => Array.from(new Set(events.map((e) => (e.location || "").split(",")[0].trim()).filter(Boolean))).sort(),
    [events]
  );

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (activeType && e.event_type !== activeType) return false;
      if (activeCity && !(e.location || "").startsWith(activeCity)) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${e.title} ${e.location || ""} ${e.event_type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, activeType, activeCity, query]);

  const upcoming = filtered.filter((e) => (e.end_date || e.start_date) >= today).sort((a, b) => a.start_date.localeCompare(b.start_date));
  const past = filtered.filter((e) => (e.end_date || e.start_date) < today).sort((a, b) => b.start_date.localeCompare(a.start_date));

  const soonest = upcoming[0] || events.sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
  const heroImage = soonest?.image_url || "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=2000";
  const daysToSoonest = soonest ? daysUntil(soonest.start_date) : null;

  return (
    <main className="min-h-screen bg-sand-50 font-sans">
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "120px 24px 96px" }}>
        <Breadcrumb items={[{ label: "Events" }]} style={{ marginBottom: 20 }} />

        <div style={{ position: "relative" }}>
          <PageHero
            title="Events & Festivals"
            eyebrow="Uzbekistan Calendar"
            image={heroImage}
            alt="Events in Uzbekistan"
            style={{ marginBottom: 40 }}
            hideMosaicStrip
          />
          {soonest && daysToSoonest != null && daysToSoonest >= 0 && (
            <div
              style={{
                position: "absolute",
                top: 32,
                right: 32,
                background: "rgba(0,107,112,0.92)",
                backdropFilter: "blur(8px)",
                borderRadius: 999,
                padding: "10px 20px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "#FFFFFF",
              }}
            >
              {daysToSoonest === 0 ? "Starts today" : daysToSoonest === 1 ? "Starts tomorrow" : `Next event in ${daysToSoonest} days`}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto scrollbar-hide flex-nowrap md:flex-wrap pb-4 md:pb-0 [&>*]:shrink-0">
          <div style={{ position: "relative" }}>
            <Search size={16} color="rgba(10,35,32,0.4)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search events"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: "12px 16px 12px 40px",
                borderRadius: 12,
                border: "1px solid transparent",
                background: "#FFFFFF",
                fontSize: 14,
                width: 240,
                outline: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            />
          </div>

          <button
            onClick={() => setActiveType(null)}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              background: activeType === null ? "#006B70" : "#FFFFFF",
              color: activeType === null ? "#FFFFFF" : "#0A2320",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All Types
          </button>
          {eventTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(activeType === t ? null : t)}
              style={{
                padding: "12px 20px",
                borderRadius: 12,
                border: "none",
                background: activeType === t ? "#006B70" : "#FFFFFF",
                color: activeType === t ? "#FFFFFF" : "#0A2320",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {capitalize(t)}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: "rgba(10,35,32,0.12)", margin: "0 4px" }} />

          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCity(activeCity === c ? null : c)}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: activeCity === c ? "1px solid #0A2320" : "1px solid #EFEDE7",
                background: activeCity === c ? "#0A2320" : "#FFFFFF",
                color: activeCity === c ? "#FFFFFF" : "#0A2320",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Happening Soon */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#0A2320", marginBottom: 24 }}>
              Happening Soon
            </h2>
            <div className="scrollbar-hide" style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8 }}>
              {upcoming.slice(0, 3).map((e) => (
                <div key={e.id} style={{ flexShrink: 0 }}>
                  <EventCard event={e} width="min(85vw, 400px)" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full listing -- excludes the events already shown above in "Happening Soon" */}
        {upcoming.length > 3 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#0A2320", marginBottom: 24 }}>
              All Upcoming Events
            </h2>
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              gap: "40px 24px",
            }}
          >{upcoming.slice(3).map((e) => (
                <EventCard key={e.id} event={e} width="100%" imageHeight={260} />
              ))}
            </motion.div>
          </div>
        )}

        {upcoming.length === 0 && (
          <div style={{ padding: 64, textAlign: "center", color: "rgba(10,35,32,0.4)" }}>
            No events currently scheduled{activeType || activeCity || query ? " for this filter" : ""} — check back soon.
          </div>
        )}

        {/* Concluded events, de-emphasized */}
        {past.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "rgba(10,35,32,0.5)", marginBottom: 24 }}>
              Past Events
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 24 }}>
              {past.map((e) => (
                <EventCard key={e.id} event={e} width="100%" imageHeight={220} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
