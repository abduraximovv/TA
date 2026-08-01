"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Service } from "@repo/database";

interface Props {
  experiences: Service[];
}

// Manual thousands-separator instead of Intl.NumberFormat("uz-UZ"): Node's server-side ICU and
// the browser's ICU format that locale differently (space vs comma grouping), which caused a
// hydration text mismatch since this renders during SSR.
function formatPrice(amount: number): string {
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Static fallback, used only when fewer than 4 real services are marked featured yet
const FALLBACK_EXPERIENCES = [
  {
    id: "exp-1",
    name: "Yurt Stay Under the Stars",
    region: "Nuratau Mountains",
    price: "from 180,000 UZS",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600",
    href: "/service",
  },
  {
    id: "exp-2",
    name: "Ceramic Workshop with a Master",
    region: "Rishtan",
    price: "from 95,000 UZS",
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=600",
    href: "/service",
  },
  {
    id: "exp-3",
    name: "Guided Mountain Trekking",
    region: "Chimgan Highlands",
    price: "from 220,000 UZS",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600",
    href: "/service",
  },
  {
    id: "exp-4",
    name: "Family Dining Experience",
    region: "Fergana Valley",
    price: "from 140,000 UZS",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600",
    href: "/service",
  },
];

export function RegionalExperiencesSection({ experiences }: Props) {
  const cards =
    experiences.length >= 4
      ? experiences.slice(0, 4).map((e, i) => ({
          id: e.id,
          name: e.title,
          region: [e.city, e.region].filter(Boolean).join(", ") || FALLBACK_EXPERIENCES[i % FALLBACK_EXPERIENCES.length].region,
          price: `from ${formatPrice(e.price)} ${e.currency}`,
          image: e.image_url || FALLBACK_EXPERIENCES[i % FALLBACK_EXPERIENCES.length].image,
          href: `/service/${e.id}`,
        }))
      : FALLBACK_EXPERIENCES;

  return (
    <section
      style={{ padding: "88px 56px 100px", background: "#F9F8F5" }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
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
              color: "#C5A880",
              marginBottom: 12,
            }}
          >
            Hosted by Rural Business Owners
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 600,
              color: "#0A2320",
            }}
          >
            Regional Experiences
          </div>
        </div>
        <Link
          href="/service"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#006B70",
            cursor: "pointer",
            textDecoration: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          View all experiences →
        </Link>
      </div>

      {/* 4-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {cards.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link href={exp.href} style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #EFEDE7",
                  background: "#FFFFFF",
                  cursor: "pointer",
                  transition: "box-shadow 0.3s",
                }}
                className="exp-card"
              >
                {/* Image */}
                <div style={{ height: 180, position: "relative" }}>
                  <Image
                    src={exp.image}
                    alt={exp.name}
                    fill
                    className="object-cover exp-card-img"
                    sizes="(max-width: 1280px) 25vw, 300px"
                  />
                </div>

                {/* Content */}
                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0A2320",
                      marginBottom: 4,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {exp.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "rgba(10,35,32,0.5)",
                      marginBottom: 12,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {exp.region}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      color: "#006B70",
                    }}
                  >
                    {exp.price}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <style>{`
        .exp-card-img { transition: transform 0.7s ease-out; }
        .exp-card:hover .exp-card-img { transform: scale(1.04); }
        .exp-card:hover { box-shadow: 0 8px 24px rgba(10,35,32,0.08); }
      `}</style>
    </section>
  );
}
