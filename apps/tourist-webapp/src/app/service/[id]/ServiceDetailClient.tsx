"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, User } from "lucide-react";
import { ServiceBookingModal } from "@/components/booking/ServiceBookingModal";
import { formatDuration } from "@repo/database";
import type { Service, ReviewWithAuthor } from "@repo/database";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

interface ServiceDetailClientProps {
  service: Service;
  reviews: ReviewWithAuthor[];
  isLoggedIn: boolean;
}

export function ServiceDetailClient({ service, reviews, isLoggedIn }: ServiceDetailClientProps) {
  const duration = formatDuration(service.duration_minutes);
  const locationText = [service.city, service.region].filter(Boolean).join(", ");

  return (
    <main style={{ minHeight: "100vh", background: "#F9F8F5", paddingBottom: 120 }}>
      {/* Media header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{ position: "relative", height: "42vh", background: "#0A2320" }}
      >
        <img
          src={service.image_url || "https://images.unsplash.com/photo-1524317420516-7fc1154c1fce?q=80&w=1200"}
          alt={service.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="overlay-gradient-bottom" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", padding: 20 }}>
          <Link
            href="/service"
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
      </motion.div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "28px 24px 0",
          marginTop: -32,
          position: "relative",
          zIndex: 10,
          background: "#F9F8F5",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#006B70",
            marginBottom: 10,
          }}
        >
          {service.category}
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 600,
            color: "#0A2320",
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          {service.title}
        </h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 28,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(10,35,32,0.08)",
            fontSize: 14,
            color: "rgba(10,35,32,0.65)",
          }}
        >
          {service.rating_avg > 0 && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Star style={{ width: 15, height: 15, color: "#C5A880", fill: "#C5A880", marginRight: 5 }} />
              <span style={{ fontWeight: 700, color: "#0A2320", marginRight: 4 }}>{service.rating_avg.toFixed(1)}</span>
              {reviews.length > 0 && <span>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>}
            </div>
          )}
          {duration && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock style={{ width: 15, height: 15 }} /> {duration}
            </div>
          )}
          {locationText && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin style={{ width: 15, height: 15 }} /> {locationText}
            </div>
          )}
          {service.max_guests && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <User style={{ width: 15, height: 15 }} /> Max {service.max_guests} guests
            </div>
          )}
        </div>

        {service.description && (
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 19,
                fontWeight: 600,
                color: "#0A2320",
                marginBottom: 10,
              }}
            >
              About this experience
            </h2>
            <p style={{ color: "rgba(10,35,32,0.7)", lineHeight: 1.7 }}>{service.description}</p>
          </div>
        )}

        {reviews.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 19,
                fontWeight: 600,
                color: "#0A2320",
                marginBottom: 14,
              }}
            >
              Reviews ({reviews.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  style={{ padding: 16, background: "#FFFFFF", borderRadius: 6, border: "1px solid rgba(10,35,32,0.05)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: "#0A2320", fontSize: 14 }}>
                      {review.author_name ?? "Anonymous"}
                    </span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} style={{ width: 14, height: 14, color: "#C5A880", fill: "#C5A880" }} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p style={{ fontSize: 14, color: "rgba(10,35,32,0.7)" }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Fixed bottom action bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#FFFFFF",
          borderTop: "1px solid rgba(10,35,32,0.08)",
          padding: "16px 24px calc(16px + env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 20px rgba(10,35,32,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 50,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "rgba(10,35,32,0.5)", fontWeight: 500 }}>Price per person</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#0A2320" }}>
            {(Number(service.price) || 0).toLocaleString("en-US").replace(/,/g, " ")}{" "}
            <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(10,35,32,0.5)" }}>{service.currency}</span>
          </div>
        </div>
        <ServiceBookingModal serviceId={service.id} price={service.price} currency={service.currency} isLoggedIn={isLoggedIn} />
      </div>
    </main>
  );
}
