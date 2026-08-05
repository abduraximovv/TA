"use client";

import React, { useState } from "react";

function SafeImage({ src, fallback, alt, ...props }: any) {
  const [errored, setErrored] = useState(false);
  return (
    <Image
      src={errored ? fallback : src}
      alt={alt}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Sun } from "lucide-react";
import type { Destination } from "@repo/database";
import { Footer } from "@/components/landing/Footer";

interface DiscoverClientProps {
  destinations: Destination[];
}

export function DiscoverClient({ destinations }: DiscoverClientProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        paddingTop: 90,
        background: "#F9F8F5",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 24px", paddingBottom: 96 }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 0.95 }}
          transition={{
            opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 1.5, ease: "easeOut" }
          }}
          style={{
            position: "relative",
            width: "100%",
            height: 400,
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 48,
            boxShadow: "0 24px 48px -12px rgba(10,35,32,0.25)",
            transformOrigin: "center center"
          }}
        >
          <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Image
              src="https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=2000"
              alt="Uzbekistan Destinations"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(10,35,32,0) 30%, rgba(10,35,32,0.6) 70%, rgba(10,35,32,0.95) 100%)",
            }}
          />
          
          <div style={{ position: "absolute", bottom: 48, left: 48 }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 64,
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Destinations
            </h1>
          </div>

          {/* Decorative Uzbek Ikat pattern strip at the bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 12,
              backgroundImage: "linear-gradient(90deg, #8C2131 0%, #C1592A 15%, #E3A335 30%, #006B70 50%, #8C2131 65%, #C1592A 80%, #E3A335 100%)",
              backgroundSize: "200% 100%",
            }}
          />
        </motion.div>

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
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "48px 32px",
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
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        position: "relative",
                        aspectRatio: "3/2",
                        width: "100%",
                      }}
                    >
                      <SafeImage
                        src={
                          d.image_url ||
                          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800"
                        }
                        fallback="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800"
                        alt={d.name}
                        fill
                        className="object-cover discover-card-img"
                        sizes="(max-width: 1280px) 33vw, 400px"
                      />
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'Inter', sans-serif",
                            textTransform: "uppercase",
                            color: "#111111",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {d.region ? d.region.toUpperCase() : "CULTURE & HISTORY"}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#111111",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Sun size={15} /> {22 + (i % 10)}.{i % 10}°C
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#000000",
                        }}
                      >
                        {d.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
