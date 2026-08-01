"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Map, MessageSquare, Compass, Bell } from "lucide-react";
import { useAuth } from "@repo/auth";
import type { Destination } from "@repo/database";

const CARD_COLORS = ["#0A2320", "#006B70"];

export function DashboardClient({ trendingDestinations }: { trendingDestinations: Destination[] }) {
  const { user } = useAuth();

  return (
    <main style={{ minHeight: "100vh", background: "#F9F8F5", paddingBottom: 96 }}>
      {/* Top App Bar */}
      <header style={{ background: "#0A2320", color: "#FFFFFF", paddingTop: 48, paddingBottom: 24, position: "relative", overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
        {/* Girih-style decorative pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="girih-dash" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 0L100 50L50 100L0 50Z" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#girih-dash)" />
          </svg>
        </div>

        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "relative", zIndex: 1 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(197,168,128,0.9)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
                Dashboard
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600 }}>
                {user ? `Hello, ${user.user_metadata?.full_name?.split(" ")[0] || "Traveler"}` : "Welcome"}
              </h1>
            </div>
            <button
              style={{
                padding: 10,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Bell style={{ width: 18, height: 18, color: "#FFFFFF" }} />
            </button>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <input
              type="text"
              placeholder="Where do you want to go?"
              className="w-full"
              style={{
                background: "#FFFFFF",
                color: "#0A2320",
                borderRadius: 8,
                padding: "14px 16px 14px 44px",
                fontWeight: 500,
                fontSize: 14,
                border: "none",
                boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Compass style={{ position: "absolute", left: 14, top: 14, width: 18, height: 18, color: "rgba(10,35,32,0.4)" }} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ maxWidth: 1024, margin: "0 auto", padding: "32px 24px 0", display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Core Tools */}
        <section>
          <h2
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "rgba(10,35,32,0.4)",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Core Tools
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <ToolCard href="/map" icon={Map} label="Interactive Map" />
            <ToolCard href="/translator" icon={MessageSquare} label="Translator" />
          </div>
        </section>

        {/* Trending Destinations */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(10,35,32,0.4)",
                textTransform: "uppercase",
              }}
            >
              Trending Areas
            </h2>
            <Link href="/discover" style={{ fontSize: 13, fontWeight: 700, color: "#006B70", textDecoration: "none" }}>
              See all
            </Link>
          </div>

          {trendingDestinations.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {trendingDestinations.map((dest, i) => (
                <Link
                  key={dest.id}
                  href={dest.latitude && dest.longitude ? `/map?lat=${dest.latitude}&lng=${dest.longitude}` : "/map"}
                  style={{ textDecoration: "none" }}
                  className="group"
                >
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: 176,
                      borderRadius: 8,
                      boxShadow: "0 1px 3px rgba(10,35,32,0.1)",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 24,
                      background: CARD_COLORS[i % CARD_COLORS.length],
                    }}
                  >
                    <div style={{ position: "absolute", right: 0, top: 0, opacity: 0.12 }}>
                      <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" />
                      </svg>
                    </div>
                    <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#FFFFFF" }}>
                      <div>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 26, marginBottom: 4 }}>
                          {dest.name}
                        </h3>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 500 }}>
                          {dest.service_count} active service{dest.service_count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(10px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Compass style={{ width: 20, height: 20, color: "#FFFFFF" }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
              <span style={{ color: "rgba(10,35,32,0.4)", fontSize: 14, fontWeight: 500 }}>No trending destinations yet.</span>
            </div>
          )}
        </section>
      </motion.div>
    </main>
  );
}

function ToolCard({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <motion.div
        whileHover={{ y: -3 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#FFFFFF",
          border: "1px solid rgba(10,35,32,0.05)",
          boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
          height: 144,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            background: "rgba(0,107,112,0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Icon style={{ width: 26, height: 26, color: "#006B70" }} />
        </div>
        <span style={{ fontWeight: 600, color: "#0A2320", fontSize: 14 }}>{label}</span>
      </motion.div>
    </Link>
  );
}
