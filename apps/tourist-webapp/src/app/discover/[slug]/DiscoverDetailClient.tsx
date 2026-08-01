"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import type { Destination, DestinationReviewWithAuthor } from "@repo/database";
import { DestinationOpinionForm } from "@/components/destinations/DestinationOpinionForm";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

interface DiscoverDetailClientProps {
  destination: Destination;
  opinions: DestinationReviewWithAuthor[];
  isLoggedIn: boolean;
}

export function DiscoverDetailClient({ destination, opinions, isLoggedIn }: DiscoverDetailClientProps) {
  return (
    <main style={{ minHeight: "100vh", background: "#F9F8F5", paddingBottom: 96 }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{ position: "relative", height: "50vh", background: "#0A2320" }}
      >
        <img
          src={
            destination.hero_image_url ||
            destination.image_url ||
            "https://images.unsplash.com/photo-1591901206811-cb341f9e6da8?q=80&w=1800"
          }
          alt={destination.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="overlay-gradient-bottom" style={{ position: "absolute", inset: 0 }} />

        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", padding: 20 }}>
          <Link
            href="/discover"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(249,248,245,0.14)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: 20, height: 20, color: "#FFFFFF" }} />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 56px 32px" }}
        >
          {destination.region && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(249,248,245,0.75)",
                marginBottom: 10,
              }}
            >
              <MapPin style={{ width: 13, height: 13 }} /> {destination.region}
            </div>
          )}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 40,
              fontWeight: 600,
              color: "#FFFFFF",
              lineHeight: 1.1,
            }}
          >
            {destination.name}
          </h1>
        </motion.div>
      </motion.div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 56px 0" }}>
        {/* Body / write-up */}
        {destination.body && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            style={{
              background: "#FFFFFF",
              borderRadius: 6,
              padding: 28,
              boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
              border: "1px solid rgba(10,35,32,0.05)",
              marginBottom: 28,
            }}
          >
            <p style={{ color: "#0A2320", opacity: 0.8, lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {destination.body}
            </p>
          </motion.div>
        )}

        {/* Gallery */}
        {destination.gallery_images && destination.gallery_images.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 36 }}
          >
            {destination.gallery_images.map((url, i) => (
              <div key={i} style={{ aspectRatio: "4/3", borderRadius: 6, overflow: "hidden", background: "#EBEDED" }}>
                <img
                  src={url}
                  alt={`${destination.name} photo ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Opinions */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#0A2320",
              marginBottom: 16,
            }}
          >
            What visitors say {opinions.length > 0 && `(${opinions.length})`}
          </h2>

          <div style={{ marginBottom: 24 }}>
            <DestinationOpinionForm
              destinationId={destination.id}
              destinationSlug={destination.slug}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {opinions.length === 0 ? (
            <p style={{ fontSize: 14, color: "rgba(10,35,32,0.5)" }}>
              No opinions yet — be the first to share your experience.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {opinions.map((op) => (
                <div
                  key={op.id}
                  style={{
                    padding: 16,
                    background: "#FFFFFF",
                    borderRadius: 6,
                    border: "1px solid rgba(10,35,32,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: "#0A2320", fontSize: 14 }}>
                      {op.author_name ?? "Anonymous"}
                    </span>
                    {op.rating != null && (
                      <div style={{ display: "flex", gap: 2 }}>
                        {Array.from({ length: op.rating }).map((_, i) => (
                          <Star key={i} style={{ width: 14, height: 14, color: "#C5A880", fill: "#C5A880" }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(10,35,32,0.7)" }}>{op.comment}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
