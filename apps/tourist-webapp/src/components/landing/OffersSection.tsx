"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";

// Static curated offers — no offers table in the schema yet, so this mirrors the
// FALLBACK_* pattern used by the other landing sections until one exists.
const OFFERS = [
  {
    id: "off-1",
    partner: "Uzbekistan Airways",
    title: "15% Off International Routes",
    dateRange: "Valid through 30 Sep 2026",
    badge: "15% OFF",
    badgeColor: "#006B70",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=700",
  },
  {
    id: "off-2",
    partner: "Silk Road Hotels Group",
    title: "20% Off Boutique Stays in Bukhara & Khiva",
    dateRange: "Book by 15 Oct 2026",
    badge: "20% OFF",
    badgeColor: "#C1592A",
    image:
      "https://images.unsplash.com/photo-1557841621-d9f6673405ed?q=80&w=700",
  },
  {
    id: "off-3",
    partner: "Registan Night Show",
    title: "2-for-1 Sound & Light Show Tickets",
    dateRange: "Every Friday, year-round",
    badge: "2-FOR-1",
    badgeColor: "#A63446",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=700",
  },
  {
    id: "off-4",
    partner: "Chimgan Cable Car",
    title: "Family Package: 2 Adults + 2 Kids Free",
    dateRange: "Weekends, Jun – Sep 2026",
    badge: "KIDS FREE",
    badgeColor: "#006B70",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=700",
  },
];

export function OffersSection() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section style={{ padding: "clamp(56px, 10vw, 88px) 0 clamp(56px, 10vw, 96px)", background: "#F9F8F5" }}>
      <div
        style={{
          paddingLeft: "var(--section-padding-x)",
          paddingRight: "var(--section-padding-x)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#C1592A",
              marginBottom: 12,
            }}
          >
            Partner Offers
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "var(--text-h2)",
              fontWeight: 600,
              color: "#0A2320",
            }}
          >
            Discover the Latest Offers
          </div>
        </div>
        <Link
          href="/discover"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#006B70",
            textDecoration: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          View All
        </Link>
      </div>

      {/* Unpadded wrapper -- the Swiper itself carries the section inset via slidesOffsetBefore/
          After instead of container padding, so the arrows (children of this wrapper) land in
          the real gap beyond the last visible card instead of on top of it. */}
      <div style={{ position: "relative" }}>
        <Swiper
          modules={[Navigation]}
          onSwiper={(s) => (swiperRef.current = s)}
          spaceBetween={14}
          slidesPerView={1.6}
          slidesOffsetBefore={20}
          slidesOffsetAfter={20}
          breakpoints={{
            560: { slidesPerView: 2.1, spaceBetween: 16, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
            860: { slidesPerView: 3, spaceBetween: 20, slidesOffsetBefore: 32, slidesOffsetAfter: 32 },
            1200: { slidesPerView: 4, spaceBetween: 24, slidesOffsetBefore: 56, slidesOffsetAfter: 56 },
          }}
        >
        {OFFERS.map((offer, i) => (
          <SwiperSlide key={offer.id} style={{ height: "auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ height: "100%" }}
          >
            <div
              style={{
                borderRadius: 14,
                overflow: "visible",
                background: "#FFFFFF",
                border: "1px solid #EFEDE7",
                boxShadow: "0 4px 16px rgba(10,35,32,0.05)",
              }}
            >
              {/* Two-stack image: brand lockup strip + lifestyle photo */}
              <div style={{ borderRadius: "14px 14px 0 0", overflow: "hidden" }}>
                <div
                  style={{
                    height: "clamp(38px, 8vw, 56px)",
                    background: "#0A2320",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(11px, 2.6vw, 13px)",
                    fontWeight: 600,
                    color: "#F9F8F5",
                    letterSpacing: "0.02em",
                    textAlign: "center",
                    padding: "0 10px",
                    overflow: "hidden",
                    lineHeight: 1.3,
                  }}
                >
                  {offer.partner}
                </div>
                <div style={{ position: "relative", height: "clamp(90px, 22vw, 140px)" }}>
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 25vw, 300px"
                  />
                </div>
              </div>

              {/* Overlapping starburst badge */}
              <div
                className="starburst-badge"
                style={{
                  position: "relative",
                  width: "clamp(58px, 14vw, 72px)",
                  height: "clamp(58px, 14vw, 72px)",
                  marginTop: "calc(clamp(58px, 14vw, 72px) / -2)",
                  marginLeft: 14,
                  background: offer.badgeColor,
                  fontSize: "clamp(9px, 2.2vw, 10.5px)",
                  fontWeight: 700,
                  padding: "0 8px",
                  lineHeight: 1.15,
                }}
              >
                {offer.badge}
              </div>

              {/* Content */}
              <div style={{ padding: "6px 14px 16px" }}>
                <div
                  style={{
                    fontSize: "clamp(9.5px, 2.3vw, 11.5px)",
                    color: "rgba(10,35,32,0.5)",
                    marginBottom: 6,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {offer.dateRange}
                </div>
                <div
                  style={{
                    fontSize: "clamp(12.5px, 3vw, 15px)",
                    fontWeight: 600,
                    color: "#0A2320",
                    lineHeight: 1.35,
                    marginBottom: 10,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {offer.title}
                </div>
                <Link
                  href="/discover"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "clamp(11px, 2.6vw, 12.5px)",
                    fontWeight: 600,
                    color: "#006B70",
                    textDecoration: "none",
                  }}
                >
                  View Offer <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
          </SwiperSlide>
        ))}
        </Swiper>

        {/* Single "next" arrow, same as What's On -- no "prev" arrow, since one positioned at the
            left edge has nowhere to sit without overlapping the first card's starburst badge. */}
        <button
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next offers"
          className="carousel-arrow"
          style={{ position: "absolute", right: 24, top: "34%", zIndex: 5 }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
