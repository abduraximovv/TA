"use client";

import React, { useEffect } from "react";
import { useAuth } from "@repo/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Home, User as UserIcon, Settings, Shield, Bell, HelpCircle } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "../../components/BottomNav";
import { MyBookingsList } from "@/components/booking/MyBookingsList";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (isLoading || !user) {
    return (
      <main style={{ minHeight: "100vh", background: "#F9F8F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-pulse flex flex-col items-center">
          <div style={{ width: 64, height: 64, background: "#EBEDED", borderRadius: "50%", marginBottom: 16 }} />
          <div style={{ height: 16, background: "#EBEDED", borderRadius: 4, width: 128 }} />
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F9F8F5", paddingBottom: 96 }}>
      {/* Top App Bar */}
      <header style={{ background: "#0A2320", color: "#FFFFFF", paddingTop: 48, paddingBottom: 80, position: "relative", overflow: "hidden", borderRadius: "0 0 24px 24px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="girih-prof" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 0L100 50L50 100L0 50Z" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#girih-prof)" />
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600 }}>Profile</h1>
          <button style={{ padding: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: "50%", border: "none", cursor: "pointer" }}>
            <Settings style={{ width: 18, height: 18, color: "#FFFFFF" }} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ maxWidth: 900, margin: "-56px auto 0", padding: "0 24px", display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 1, width: "100%" }}
      >
        {/* Profile Card */}
        <div
          style={{
            padding: 28,
            background: "#FFFFFF",
            border: "1px solid rgba(10,35,32,0.05)",
            boxShadow: "0 8px 24px rgba(10,35,32,0.1)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              background: "#F9F8F5",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(10,35,32,0.3)",
              marginBottom: 16,
              border: "4px solid #FFFFFF",
              boxShadow: "0 0 0 1px rgba(10,35,32,0.05)",
            }}
          >
            <UserIcon style={{ width: 48, height: 48 }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#0A2320" }}>
            {user.user_metadata?.full_name || "Traveler"}
          </h2>
          <p style={{ color: "rgba(10,35,32,0.5)", fontSize: 14, fontWeight: 500, marginTop: 4 }}>{user.email}</p>
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              background: "rgba(197,168,128,0.15)",
              color: "#8A6D3B",
            }}
          >
            Verified Tourist
          </div>
        </div>

        <MyBookingsList />

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 18, color: "#0A2320", marginBottom: 4 }}>
            Account Options
          </h3>

          <Link href="/" style={{ textDecoration: "none" }}>
            <OptionRow icon={Home} tone="emerald" title="Back to Main Page" subtitle="Return to the landing view" />
          </Link>

          <OptionRow icon={Shield} tone="neutral" title="Security & Privacy" subtitle="Manage password and data" />
          <OptionRow icon={HelpCircle} tone="neutral" title="Help & Support" subtitle="Contact us or read FAQs" />

          <div onClick={handleSignOut} style={{ marginTop: 20 }}>
            <OptionRow icon={LogOut} tone="danger" title="Log Out" />
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </main>
  );
}

function OptionRow({
  icon: Icon,
  tone,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  tone: "emerald" | "neutral" | "danger";
  title: string;
  subtitle?: string;
}) {
  const iconBg = tone === "emerald" ? "rgba(0,107,112,0.1)" : tone === "danger" ? "rgba(201,59,59,0.08)" : "rgba(10,35,32,0.04)";
  const iconColor = tone === "emerald" ? "#006B70" : tone === "danger" ? "#C93B3B" : "rgba(10,35,32,0.55)";

  return (
    <div
      style={{
        padding: "16px 20px",
        background: "#FFFFFF",
        border: tone === "danger" ? "1px solid rgba(201,59,59,0.15)" : "1px solid rgba(10,35,32,0.05)",
        boxShadow: "0 1px 3px rgba(10,35,32,0.05)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: 20, height: 20 }} />
      </div>
      <div>
        <h3 style={{ fontWeight: 600, color: tone === "danger" ? "#C93B3B" : "#0A2320", fontSize: 14.5 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: "rgba(10,35,32,0.5)", fontWeight: 500, marginTop: 1 }}>{subtitle}</p>}
      </div>
    </div>
  );
}
