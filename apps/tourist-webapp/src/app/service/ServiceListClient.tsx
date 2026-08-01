"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Compass, ArrowRight, Star, Clock } from "lucide-react";
import type { Service, Location } from "@repo/database";
import { formatDuration } from "@repo/database";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

interface ServiceListClientProps {
  services: Service[];
  locations: Location[];
}

export function ServiceListClient({ services, locations }: ServiceListClientProps) {
  return (
    <main style={{ minHeight: "100vh", paddingTop: 112, paddingBottom: 96, background: "#F9F8F5" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px" }}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 48 }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#006B70",
              marginBottom: 14,
            }}
          >
            Verified Local Providers
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 48,
              fontWeight: 600,
              color: "#0A2320",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Book <span style={{ color: "#C5A880" }}>Experiences</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(10,35,32,0.6)", maxWidth: 560 }}>
            Verified local providers, ready to book.
          </p>
        </motion.header>

        {/* Services Grid */}
        <motion.section initial="hidden" animate="visible" variants={staggerContainer} style={{ marginBottom: 64 }}>
          <motion.div
            variants={fadeUp}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 600,
                color: "#0A2320",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Compass style={{ width: 22, height: 22, color: "#C5A880" }} />
              Curated Experiences
            </h2>
          </motion.div>

          {services.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed rgba(10,35,32,0.15)",
                borderRadius: 8,
                background: "#FFFFFF",
              }}
            >
              <Compass style={{ width: 32, height: 32, color: "rgba(10,35,32,0.2)", marginBottom: 8 }} />
              <span style={{ color: "rgba(10,35,32,0.4)", fontSize: 14, fontWeight: 500 }}>
                No experiences available yet.
              </span>
            </div>
          )}
        </motion.section>

        {/* Locations Summary */}
        <motion.section initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div
            variants={fadeUp}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 600,
                color: "#0A2320",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MapPin style={{ width: 22, height: 22, color: "#006B70" }} />
              Essential Hubs
            </h2>
            <Link
              href="/map"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#006B70",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Open Map <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {locations.length > 0 ? (
              locations.map((loc) => (
                <motion.div key={loc.id} variants={fadeUp} whileHover={{ y: -2 }}>
                  <div
                    style={{
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid rgba(10,35,32,0.05)",
                      borderRadius: 8,
                      boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
                      background: "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                        flexShrink: 0,
                        background:
                          loc.category === "sos"
                            ? "rgba(201,59,59,0.08)"
                            : loc.category === "pharmacy"
                            ? "rgba(45,138,78,0.08)"
                            : "rgba(0,107,112,0.1)",
                        color: loc.category === "sos" ? "#C93B3B" : loc.category === "pharmacy" ? "#2D8A4E" : "#006B70",
                      }}
                    >
                      <MapPin style={{ width: 20, height: 20 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontWeight: 700,
                          color: "#0A2320",
                          fontSize: 15,
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {loc.name}
                      </h3>
                      <p
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "rgba(10,35,32,0.45)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {loc.category.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div
                style={{
                  width: "100%",
                  padding: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed rgba(10,35,32,0.15)",
                  borderRadius: 8,
                  background: "#FFFFFF",
                }}
              >
                <span style={{ color: "rgba(10,35,32,0.4)", fontSize: 14, fontWeight: 500 }}>No locations found.</span>
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
  const locationText = [service.city, service.region].filter(Boolean).join(", ");

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} style={{ height: "100%" }}>
      <Link href={`/service/${service.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div
          className="discover-card"
          style={{
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
            height: 380,
            boxShadow: "0 16px 32px -12px rgba(10,35,32,0.2)",
            cursor: "pointer",
          }}
        >
          <Image
            src={service.image_url || "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&q=80"}
            alt={service.title}
            fill
            className="object-cover discover-card-img"
            sizes="(max-width: 1280px) 33vw, 300px"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(10,35,32,0) 40%, rgba(10,35,32,0.88) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Category badge */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              padding: "6px 12px",
              background: "rgba(249,248,245,0.14)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 100,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              color: "#F9F8F5",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {service.category}
          </div>

          {/* Rating badge */}
          {service.rating_avg > 0 && (
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                background: "rgba(249,248,245,0.9)",
                backdropFilter: "blur(8px)",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                color: "#0A2320",
              }}
            >
              <Star style={{ width: 12, height: 12, color: "#C5A880", fill: "#C5A880" }} />
              {service.rating_avg.toFixed(1)}
            </div>
          )}

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 21,
                fontWeight: 600,
                color: "#FFFFFF",
                marginBottom: 8,
              }}
              className="line-clamp-2"
            >
              {service.title}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12, color: "rgba(249,248,245,0.75)", marginBottom: 14 }}>
              {duration && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock style={{ width: 12, height: 12 }} /> {duration}
                </span>
              )}
              {locationText && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin style={{ width: 12, height: 12 }} /> {locationText}
                </span>
              )}
              {service.rating_count > 0 && <span>{service.rating_count} reviews</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#C5A880" }}>
                {new Intl.NumberFormat("uz-UZ").format(service.price)} {service.currency}
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 100,
                  background: "rgba(249,248,245,0.12)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F9F8F5",
                  fontSize: 16,
                }}
              >
                →
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
