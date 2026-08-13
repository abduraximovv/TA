"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@repo/auth";
import type { AIServiceSearchResult } from "@repo/types";

interface RecommendedServiceCardProps {
  service: AIServiceSearchResult;
  /** Best-effort extraction from the conversation -- when present, booking really is one click. */
  travelDate: string | null;
  guestCount: number;
}

type CardStatus = "idle" | "confirming" | "booking" | "success" | "error";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=400&q=80";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function RecommendedServiceCard({ service, travelDate, guestCount }: RecommendedServiceCardProps) {
  const { session } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [status, setStatus] = useState<CardStatus>("idle");
  const [date, setDate] = useState(travelDate ?? "");
  const [guests, setGuests] = useState(guestCount);
  const [errorMessage, setErrorMessage] = useState("");

  const priceText = `${(Number(service.price) || 0).toLocaleString("en-US").replace(/,/g, " ")} ${service.currency}`;

  const submitBooking = async (bookingDate: string, bookingGuests: number) => {
    if (!session) return;
    setStatus("booking");
    setErrorMessage("");
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          service_id: service.id,
          itinerary_id: null,
          status: "pending",
          booking_date: new Date(bookingDate).toISOString(),
          guest_count: bookingGuests,
          special_requests: "Booked via AI Travel Coordinator (Compass)",
          passenger_manifest: null,
          dietary_preferences: null,
          pickup_location: null,
          total_price: service.price * bookingGuests,
          currency: service.currency,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Couldn't send this booking. Please try again.");
      }

      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Couldn't send this booking. Please try again.");
      setStatus("error");
    }
  };

  const handleCtaClick = () => {
    if (status === "booking" || status === "success") return;
    if (travelDate) {
      submitBooking(travelDate, guestCount);
    } else {
      setStatus("confirming");
    }
  };

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{ width: 168, background: "#FFFFFF", borderRadius: 12, border: "1px solid rgba(10,35,32,0.08)", boxShadow: "0 2px 10px rgba(10,35,32,0.06)" }}
    >
      <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 92 }}>
        <Image src={service.image_url || FALLBACK_IMAGE} alt={service.title} fill className="object-cover" sizes="168px" />
        {service.rating_avg > 0 && (
          <div
            className="absolute flex items-center gap-1"
            style={{ top: 6, right: 6, padding: "3px 6px", background: "rgba(249,248,245,0.92)", borderRadius: 100, fontSize: 11, fontWeight: 700, color: "#0A2320" }}
          >
            <Star style={{ width: 10, height: 10, color: "#C5A880", fill: "#C5A880" }} />
            {service.rating_avg.toFixed(1)}
          </div>
        )}
      </div>

      <div style={{ padding: "10px 10px 12px" }}>
        <div
          className="line-clamp-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: "#0A2320", minHeight: 34, marginBottom: 6 }}
        >
          {service.title}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#C5A880", marginBottom: 10 }}>{priceText}</div>

        <AnimatePresence mode="wait" initial={false}>
          {status === "confirming" ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="flex flex-col gap-1.5"
            >
              <input
                type="date"
                min={todayIso()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Travel date"
                className="outline-none"
                style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 8, padding: "6px 8px", fontSize: 12, color: "#0A2320" }}
              />
              <input
                type="number"
                min={1}
                max={50}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                aria-label="Guest count"
                className="outline-none"
                style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 8, padding: "6px 8px", fontSize: 12, color: "#0A2320" }}
              />
              <button
                type="button"
                disabled={!date}
                onClick={() => submitBooking(date, guests)}
                className="tap-active disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#C5A880", color: "#FFFFFF", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 700 }}
              >
                Confirm
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              type="button"
              onClick={handleCtaClick}
              disabled={status === "booking" || status === "success"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="tap-active w-full flex items-center justify-center gap-1.5 disabled:cursor-not-allowed"
              style={{ background: "#C5A880", color: "#FFFFFF", borderRadius: 100, padding: "8px 0", fontSize: 12, fontWeight: 700 }}
            >
              {status === "booking" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {status === "idle" && "Book in 1-Click"}
              {status === "booking" && "Booking…"}
              {status === "success" && "Sent to host"}
              {status === "error" && "Try again"}
            </motion.button>
          )}
        </AnimatePresence>

        {status === "error" && errorMessage && (
          <div style={{ fontSize: 10.5, color: "#C93B3B", marginTop: 5, lineHeight: 1.3 }}>{errorMessage}</div>
        )}
      </div>

      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(249,248,245,0.9)", pointerEvents: "none" }}
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 12, stiffness: 300 }}
            >
              <CheckCircle2 style={{ width: 40, height: 40, color: "#3FA34D" }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
