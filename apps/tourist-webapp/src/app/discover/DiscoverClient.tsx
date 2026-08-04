"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { Destination } from "@repo/database";

interface DiscoverClientProps {
  destinations: Destination[];
}

export function DiscoverClient({ destinations }: DiscoverClientProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        paddingTop: 112,
        paddingBottom: 96,
        background: "#F9F8F5",
        fontFamily: "'Inter', sans-serif",
      }}
    >
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
            Curated by Admins
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
            Discover Uzbekistan
          </h1>
          <p style={{ fontSize: 17, color: "rgba(10,35,32,0.6)", maxWidth: 560 }}>
            Places worth going out of your way for, written and curated by the platform team.
          </p>
        </motion.header>

        {destinations.length === 0 ? (
          <div
            style={{
              width: "100%",
              padding: "64px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(10,35,32,0.15)",
              borderRadius: 12,
              background: "#FFFFFF",
            }}
          >
            <Compass style={{ width: 32, height: 32, color: "rgba(10,35,32,0.25)", marginBottom: 12 }} />
            <span style={{ color: "rgba(10,35,32,0.4)", fontSize: 14, fontWeight: 500 }}>
              No destinations published yet.
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {destinations.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: (i % 8) * 0.06 }}
              >
                <Link href={`/discover/${d.slug}`} style={{ textDecoration: "none", display: "block" }}>
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
                      src={
                        d.image_url ||
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800"
                      }
                      alt={d.name}
                      fill
                      className="object-cover discover-card-img"
                      sizes="(max-width: 1280px) 33vw, 300px"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(10,35,32,0) 45%, rgba(10,35,32,0.88) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                    {d.region && (
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
                        {d.region}
                      </div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, pointerEvents: "none" }}>
                      <div
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 21,
                          fontWeight: 600,
                          color: "#FFFFFF",
                        }}
                      >
                        {d.name}
                      </div>
                      {d.description && (
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "rgba(249,248,245,0.75)",
                            marginTop: 4,
                            lineHeight: 1.5,
                          }}
                          className="line-clamp-2"
                        >
                          {d.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
