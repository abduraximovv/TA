"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Footer } from "@/components/landing/Footer";
import { Globe, Users, ShieldCheck, Map, Compass, Sparkles, type LucideIcon } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PageHero } from "@/components/PageHero";
import type { SiteStats } from "@repo/database";

// A diamond-lattice motif (echoes the Ikat/mosaic strip used elsewhere on the site) tiled as a
// faint background watermark -- the "cultural pattern" backdrop, in our own palette rather than
// literal Arabic script/ornamentation.
const MOSAIC_WATERMARK =
  "url(\"data:image/svg+xml,%3Csvg width='84' height='84' viewBox='0 0 84 84' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230A2320' fill-opacity='1'%3E%3Cpath d='M42 0L21 21 42 42 63 21z M0 42L21 21 0 0z M84 42L63 21 84 0z M42 84L21 63 42 42 63 63z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

function Watermark({ opacity = 0.045 }: { opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        pointerEvents: "none",
        backgroundImage: MOSAIC_WATERMARK,
        backgroundSize: "84px 84px",
      }}
    />
  );
}

function IconBadge({ icon: Icon, gradient }: { icon: LucideIcon; gradient: string }) {
  return (
    <div
      style={{
        width: 76,
        height: 76,
        borderRadius: 20,
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        boxShadow: "0 14px 28px -10px rgba(10,35,32,0.4)",
      }}
    >
      <Icon size={34} color="#FFFFFF" />
    </div>
  );
}

const TEAL_GRADIENT = "linear-gradient(135deg, #00888E, #006B70)";
const GOLD_GRADIENT = "linear-gradient(135deg, #D8BC94, #B0925F)";
const DARK_GRADIENT = "linear-gradient(135deg, #16413C, #0A2320)";
const TERRACOTTA_GRADIENT = "linear-gradient(135deg, #D66A38, #C1592A)";

export function AboutClient({ stats }: { stats: SiteStats }) {
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

  const ecosystem = [
    { title: "Tourist WebApp", icon: Globe, gradient: TEAL_GRADIENT, desc: "A premium planning and booking platform offering budget-friendly safety and discovery tools for independent travelers." },
    { title: "Local Provider App", icon: Users, gradient: GOLD_GRADIENT, desc: "A mobile-first tool empowering rural artisans and guides to list services, manage bookings, and enter the formal economy." },
    { title: "Agency Portal", icon: Map, gradient: DARK_GRADIENT, desc: "A comprehensive B2B dashboard for global travel agencies to curate and manage group tours at scale." },
    { title: "Admin Portal", icon: ShieldCheck, gradient: TERRACOTTA_GRADIENT, desc: "The central nervous system ensuring quality control, verification, and seamless ecosystem orchestration." },
  ];

  const impact = [
    { stat: `${stats.destinationCount}`, label: "Destinations Covered", sub: "From Silk Road capitals to desert camps and mountain valleys.", icon: Compass, gradient: TEAL_GRADIENT },
    { stat: `${stats.verifiedProviderCount}+`, label: "Verified Local Providers", sub: "Rural artisans and guides brought into the formal tourism economy.", icon: ShieldCheck, gradient: TERRACOTTA_GRADIENT },
    { stat: `${stats.experienceCount}+`, label: "Curated Experiences", sub: "Real, bookable tours, workshops, and stays from verified local guides.", icon: Sparkles, gradient: GOLD_GRADIENT },
  ];

  return (
    <main style={{ background: "#F9F8F5", color: "#0A2320", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* Hero Section */}
      <section style={{ paddingTop: 140, paddingLeft: "5%", paddingRight: "5%", maxWidth: 1440, margin: "0 auto" }}>
        <Breadcrumb items={[{ label: "About" }]} style={{ marginBottom: 20 }} />

        <PageHero
          title="About"
          eyebrow="Our Story"
          image="https://images.unsplash.com/photo-1673446840855-1c82bafdb67d?q=80&w=2000"
          alt="Local artisans and guides of Uzbekistan"
        />

        <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} style={{ paddingBottom: 100, maxWidth: 700 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 24,
              letterSpacing: "-0.02em",
            }}
          >
            Unveiling <span className="text-gold-400">Hidden</span> Uzbekistan
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, lineHeight: 1.6, color: "rgba(10, 35, 32, 0.75)" }}>
            Four thousand years of the Silk Road, one transformative journey.
            We are on a mission to bring the authentic, untold stories of rural artisans and local guides to the global stage.
          </p>
        </motion.div>
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
      <section style={{ position: "relative", padding: "120px 5%", background: "#FFFFFF", overflow: "hidden" }}>
        <Watermark />
        <div style={{ position: "relative", maxWidth: 1440, margin: "0 auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            style={{ textAlign: "center", marginBottom: 72 }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 700, marginBottom: 16 }}>
              One Unified Ecosystem
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, color: "rgba(10, 35, 32, 0.7)", maxWidth: 640, margin: "0 auto" }}>
              Four purpose-built portals working seamlessly together to solve the industry's toughest challenges.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}
          >
            {ecosystem.map((portal, idx) => (
              <motion.div
                key={idx}
                variants={fadeUpVariant}
                style={{
                  padding: 44,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 28,
                  boxShadow: "0 16px 40px rgba(10, 35, 32, 0.07)",
                  border: "1px solid rgba(10, 35, 32, 0.05)",
                }}
              >
                <IconBadge icon={portal.icon} gradient={portal.gradient} />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 16 }}>
                  {portal.title}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.6, color: "rgba(10, 35, 32, 0.65)" }}>
                  {portal.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Impact Section -- real, live counts from the database, not marketing targets */}
      <section style={{ position: "relative", padding: "0 5% 120px", maxWidth: 1440, margin: "0 auto" }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          style={{
            position: "relative",
            backgroundColor: "#F3F1EA",
            borderRadius: 32,
            padding: "80px 5%",
            overflow: "hidden",
          }}
        >
          <Watermark opacity={0.06} />
          <div style={{ position: "relative", textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: "#006B70", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontSize: 13 }}>
              Real Numbers, Real Impact
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 700, color: "#0A2320" }}>
              Uzbekistan, By the Numbers
            </h2>
          </div>

          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
            {impact.map((item, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: "40px 36px",
                  overflow: "hidden",
                  boxShadow: "0 16px 40px rgba(10, 35, 32, 0.06)",
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: item.gradient }} />
                <IconBadge icon={item.icon} gradient={item.gradient} />
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#0A2320", marginBottom: 8, lineHeight: 1 }}>
                  {item.stat}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, color: "#0A2320", marginBottom: 8 }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(10,35,32,0.6)", lineHeight: 1.5 }}>
                  {item.sub}
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
