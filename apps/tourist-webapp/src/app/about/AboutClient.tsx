"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Footer } from "@/components/landing/Footer";
import { Globe, Users, ShieldCheck, Map } from "lucide-react";

export function AboutClient() {
  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <main style={{ background: "#F9F8F5", color: "#0A2320", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* Hero Section */}
      <section style={{ paddingTop: 140, paddingBottom: 100, paddingLeft: "5%", paddingRight: "5%", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="max-md:grid-cols-1">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant}>
            <h1 
              style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: "clamp(3rem, 6vw, 5rem)", 
                fontWeight: 700, 
                lineHeight: 1.1, 
                marginBottom: 24,
                letterSpacing: "-0.02em"
              }}
            >
              Unveiling<br/>
              <span className="text-gold-400">Hidden</span> Uzbekistan
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, lineHeight: 1.6, color: "rgba(10, 35, 32, 0.75)", maxWidth: 500 }}>
              Four thousand years of the Silk Road, one transformative journey. 
              We are on a mission to bring the authentic, untold stories of rural artisans and local guides to the global stage.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            style={{ position: "relative", width: "100%", aspectRatio: "4/5", borderRadius: 24, overflow: "hidden" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=1200"
              alt="Authentic Uzbekistan"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* The Mission */}
      <section style={{ padding: "100px 5%", backgroundColor: "#0A2320", color: "#F9F8F5" }}>
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}
        >
          <div style={{ color: "#C5A880", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontSize: 13 }}>
            Our Why
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 4rem)", fontWeight: 700, marginBottom: 32, lineHeight: 1.2 }}>
            Bridging the Digital Divide
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, lineHeight: 1.7, opacity: 0.85, marginBottom: 24 }}>
            For decades, tourism in Uzbekistan has been heavily concentrated in crowded historical hubs like Samarkand and Bukhara. Meanwhile, incredible rural artisans, authentic yurt camps, and remote mountain guides remained disconnected from the formal tourism economy.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, lineHeight: 1.7, opacity: 0.85 }}>
            We exist to disperse this economic opportunity. By giving local providers the digital tools they need to reach global independent travelers directly, we are formalizing the shadow economy and ensuring that tourism revenue directly empowers local communities.
          </p>
        </motion.div>
      </section>

      {/* Ecosystem Portals */}
      <section style={{ padding: "120px 5%", maxWidth: 1440, margin: "0 auto" }}>
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, marginBottom: 16 }}>
            One Unified Ecosystem
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(10, 35, 32, 0.7)", maxWidth: 600, margin: "0 auto" }}>
            Four purpose-built portals working seamlessly together to solve the industry's toughest challenges.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}
        >
          {[
            { title: "Tourist WebApp", icon: Globe, desc: "A premium planning and booking platform offering budget-friendly safety and discovery tools for independent travelers." },
            { title: "Local Provider App", icon: Users, desc: "A mobile-first tool empowering rural artisans and guides to list services, manage bookings, and enter the formal economy." },
            { title: "Agency Portal", icon: Map, desc: "A comprehensive B2B dashboard for global travel agencies to curate and manage group tours at scale." },
            { title: "Admin Portal", icon: ShieldCheck, desc: "The central nervous system ensuring quality control, verification, and seamless ecosystem orchestration." }
          ].map((portal, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeUpVariant}
              style={{ 
                padding: 40, 
                backgroundColor: "#FFFFFF", 
                borderRadius: 24,
                boxShadow: "0 12px 32px rgba(10, 35, 32, 0.04)",
                border: "1px solid rgba(10, 35, 32, 0.03)"
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(197, 168, 128, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <portal.icon size={24} color="#C5A880" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
                {portal.title}
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.6, color: "rgba(10, 35, 32, 0.65)" }}>
                {portal.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Impact Section */}
      <section style={{ padding: "0 5% 120px", maxWidth: 1440, margin: "0 auto" }}>
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          style={{ 
            backgroundColor: "#0A2320", 
            borderRadius: 32, 
            padding: "80px 5%", 
            color: "#F9F8F5",
            textAlign: "center",
            backgroundImage: "linear-gradient(to bottom right, #0A2320, #061513)"
          }}
        >
          <div style={{ color: "#C5A880", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontSize: 13 }}>
            Our Impact Targets
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, marginBottom: 48 }}>
            Empowering the Future of Travel
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 40 }}>
            {[
              { stat: "100%", label: "Formal Economy", sub: "Transitioning rural guides out of the shadow economy." },
              { stat: "3x", label: "Rural Revenue", sub: "Increasing direct earnings for local artisans and families." },
              { stat: "0", label: "Hidden Fees", sub: "Transparent, budget-friendly booking for global travelers." }
            ].map((impact, idx) => (
              <div key={idx}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 700, color: "#C5A880", marginBottom: 8, lineHeight: 1 }}>
                  {impact.stat}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  {impact.label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
                  {impact.sub}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
