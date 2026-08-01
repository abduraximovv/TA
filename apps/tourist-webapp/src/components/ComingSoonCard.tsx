"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ComingSoonCardProps {
  icon: React.ElementType;
  iconColor: "emerald" | "gold" | "teal";
  title: string;
  description: string;
}

const ICON_STYLES = {
  emerald: { background: "rgba(10,35,32,0.06)", color: "#0A2320" },
  gold: { background: "rgba(197,168,128,0.15)", color: "#8A6D3B" },
  teal: { background: "rgba(0,107,112,0.1)", color: "#006B70" },
};

export function ComingSoonCard({ icon: Icon, iconColor, title, description }: ComingSoonCardProps) {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9F8F5",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "#FFFFFF",
          borderRadius: 8,
          padding: "56px 48px",
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
          border: "1px solid rgba(10,35,32,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            ...ICON_STYLES[iconColor],
          }}
        >
          <Icon style={{ width: 40, height: 40 }} />
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 600,
            color: "#0A2320",
            marginBottom: 14,
          }}
        >
          {title}
        </h1>
        <p style={{ color: "rgba(10,35,32,0.55)", marginBottom: 28, maxWidth: 400 }}>{description}</p>
        <Link href="/" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          Go Back Home <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </motion.div>
    </main>
  );
}
