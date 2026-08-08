"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Compass,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Users,
  Backpack,
  Languages,
  UtensilsCrossed,
  LifeBuoy,
  Route,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import type { SiteStats } from "@repo/database";

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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const PILLARS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "Verified, Always",
    body: "Every guide, host, and artisan on Safron goes through a real verification process before they can list a single thing. No anonymous listings, no guessing who you're booking with.",
  },
  {
    icon: HeartHandshake,
    title: "Book Direct, No Middlemen",
    body: "You book straight with the person actually hosting your tour or running your workshop — not a call center reselling their time. What you pay is what reaches them.",
  },
  {
    icon: Users,
    title: "Real Local Voices",
    body: "Rural artisans, mountain guides, and small family-run stays that never had a way onto the internet — Safron is how they reach you, in their own words.",
  },
  {
    icon: Backpack,
    title: "Built for Independent Travelers",
    body: "Not a bus full of forty strangers on a fixed schedule. Safron is for people planning their own route, at their own pace, who still want everything verified.",
  },
];

const NEXT_UP: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Languages, title: "Real-Time Translation", body: "Menus and street signs translated instantly, with the cultural context a generic app misses." },
  { icon: UtensilsCrossed, title: "Food Safety Checks", body: "Every dish explained before you order it blind." },
  { icon: LifeBuoy, title: "Emergency Assistance", body: "Verified embassy, police, and hospital contacts, ready before you need them." },
  { icon: Route, title: "AI Trip Planner", body: "A day-by-day itinerary built from real, bookable local providers." },
];

export function AboutClient({ stats }: { stats: SiteStats }) {
  const impact = [
    { stat: `${stats.destinationCount}`, label: "Destinations covered", icon: Compass },
    { stat: `${stats.verifiedProviderCount}+`, label: "Verified local providers", icon: ShieldCheck },
    { stat: `${stats.experienceCount}+`, label: "Bookable experiences", icon: Sparkles },
  ];

  return (
    <main style={{ background: "#F9F8F5", color: "#0A2320", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Hero -- bespoke, not the shared listing-page PageHero: About earns its own opening moment. */}
      <section style={{ position: "relative", width: "100%", minHeight: "clamp(520px, 72vh, 720px)", overflow: "hidden" }}>
        <Image
          src="https://images.unsplash.com/photo-1673446840855-1c82bafdb67d?q=80&w=2400&auto=format&fit=crop"
          alt="A local artisan at work in Uzbekistan"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,35,32,0.75) 0%, rgba(10,35,32,0.35) 38%, rgba(10,35,32,0.55) 75%, rgba(10,35,32,0.92) 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1440, margin: "0 auto", padding: "0 clamp(20px, 5vw, 56px)" }}>
          <Breadcrumb items={[{ label: "About" }]} light style={{ paddingTop: "calc(var(--safe-top, 0px) + 100px)" }} />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 900,
            margin: "0 auto",
            padding: "clamp(40px, 8vh, 96px) clamp(20px, 5vw, 56px) clamp(56px, 9vh, 110px)",
            minHeight: "clamp(340px, 46vh, 480px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#C5A880",
                marginBottom: 20,
              }}
            >
              Why Safron Exists
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(34px, 4.4vw, 60px)",
                lineHeight: 1.12,
                color: "#FFFFFF",
                margin: "0 0 20px",
                maxWidth: 720,
              }}
            >
              Uzbekistan Is Bigger Than Three Cities.
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(15.5px, 1vw + 9px, 18.5px)", lineHeight: 1.65, color: "rgba(255,255,255,0.85)", maxWidth: 620, margin: 0 }}>
              Most trips here stop at Samarkand, Bukhara, and Khiva. We built Safron for everything the guidebooks
              skip — the yurt camp past the last paved road, the ceramicist in Rishtan, the guide who knows Chimgan
              better than anyone with a website ever could.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Story */}
      <section style={{ padding: "clamp(72px, 10vw, 120px) clamp(20px, 6vw, 56px)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr]" style={{ maxWidth: 1200, margin: "0 auto", gap: "clamp(40px, 6vw, 72px)", alignItems: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#006B70",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              The Story
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(26px, 2.4vw + 12px, 40px)", lineHeight: 1.2, margin: "0 0 24px" }}>
              The Guides Were Always There. They Just Weren&rsquo;t Online.
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.75, color: "rgba(10,35,32,0.72)", margin: "0 0 20px" }}>
              For decades, tourism revenue in Uzbekistan has pooled around a handful of historic hubs, while
              extraordinary rural artisans, yurt hosts, and mountain guides stayed invisible to the internet —
              reachable only if you already happened to know someone who knew someone.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, lineHeight: 1.75, color: "rgba(10,35,32,0.72)", margin: 0 }}>
              Safron exists to close that gap from both sides at once: a real booking platform for travelers who
              want to go further than the standard route, and a real digital storefront for the local providers who
              had nowhere to be found before now.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative", height: "clamp(300px, 34vw, 440px)", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 64px -24px rgba(10,35,32,0.35)" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1400&auto=format&fit=crop"
              alt="A local host's remote lodge, off the standard tourist route"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </motion.div>
        </div>
      </section>

      {/* What We Stand For -- replaces the old internal "4 product portals" grid, which was
          investor-deck content that had no business on a traveler-facing About page. */}
      <section style={{ position: "relative", padding: "clamp(72px, 10vw, 120px) clamp(20px, 6vw, 56px)", background: "#FFFFFF", overflow: "hidden" }}>
        <Watermark />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ maxWidth: 640, marginBottom: 64 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#006B70", marginBottom: 16, fontWeight: 600 }}>
              What We Stand For
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(28px, 2.4vw + 12px, 42px)", lineHeight: 1.2, margin: 0 }}>
              Four Promises We Don&rsquo;t Break.
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 24 }}>
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  variants={fadeUp}
                  style={{ padding: "32px 30px", borderRadius: 20, background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.06)" }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#0A2320",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 22,
                    }}
                  >
                    <Icon size={21} color="#C5A880" />
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, margin: "0 0 10px" }}>{p.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.65, color: "rgba(10,35,32,0.65)", margin: 0 }}>{p.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Impact -- real, live counts from the database, presented full-bleed to match the rest
          of the product family's "stat strip over photo" language rather than boxy white cards. */}
      <section style={{ position: "relative", padding: "clamp(88px, 12vw, 140px) clamp(20px, 6vw, 56px)", overflow: "hidden" }}>
        <Image
          src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2400&auto=format&fit=crop"
          alt="A mountain valley in Uzbekistan"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,35,32,0.88)" }} />

        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C5A880", marginBottom: 20 }}>
              Real Numbers, Not Marketing Targets
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(26px, 2.4vw + 12px, 40px)", lineHeight: 1.25, color: "#FFFFFF", margin: "0 0 64px" }}>
              Uzbekistan, By the Numbers.
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 40 }}>
            {impact.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} variants={fadeUp}>
                  <Icon size={22} color="#C5A880" style={{ marginBottom: 14 }} />
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(38px, 3vw + 16px, 56px)", color: "#FFFFFF", lineHeight: 1.05, marginBottom: 8 }}>
                    {item.stat}
                  </div>
                  <div style={{ fontSize: 14.5, color: "rgba(255,255,255,0.65)" }}>{item.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* What's Next -- Zarina, kept modest and clearly roadmap-labeled since it isn't built yet. */}
      <section style={{ padding: "clamp(72px, 10vw, 120px) clamp(20px, 6vw, 56px)", background: "#F9F8F5" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 20,
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(0,107,112,0.1)",
                border: "1px solid rgba(0,107,112,0.25)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#006B70",
              }}
            >
              <Sparkles size={12} /> What&rsquo;s Next · In Development
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(26px, 2.4vw + 12px, 38px)", lineHeight: 1.2, margin: "0 0 16px" }}>
              Meet Zarina, Coming to Safron
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.65, color: "rgba(10,35,32,0.65)", margin: 0 }}>
              Outside a handful of historic hubs, trustworthy travel information is scarce and locked behind a
              language barrier. Zarina will be our answer: an assistant that only ever answers from verified local
              sources — never a guess.
            </p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
            {NEXT_UP.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  style={{ borderRadius: 14, border: "1px dashed rgba(10,35,32,0.18)", padding: "22px 20px", position: "relative" }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#006B70",
                      background: "rgba(0,107,112,0.1)",
                      padding: "3px 7px",
                      borderRadius: 999,
                    }}
                  >
                    Soon
                  </span>
                  <Icon size={20} color="#006B70" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15.5, margin: "0 0 8px", paddingRight: 26 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(10,35,32,0.55)", margin: 0 }}>{f.body}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 40 }}>
            <ShieldCheck size={15} color="#006B70" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "rgba(10,35,32,0.5)" }}>
              Every answer will be traceable to a verified source — no invented facts, ever.
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "0 clamp(20px, 6vw, 56px) clamp(88px, 11vw, 130px)" }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center",
            background: "#0A2320",
            borderRadius: 28,
            padding: "clamp(48px, 7vw, 80px) clamp(24px, 6vw, 64px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "-30%",
              right: "-10%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(197,168,128,0.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(26px, 2.6vw + 12px, 42px)", lineHeight: 1.2, color: "#FFFFFF", margin: "0 0 18px", position: "relative" }}>
            See What&rsquo;s Actually Out There.
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", margin: "0 0 36px", position: "relative", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Browse verified destinations, experiences, and packages from the people who actually live there.
          </p>
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            <Link href="/discover" className="btn-primary" style={{ textDecoration: "none", gap: 8 }}>
              Explore Destinations <ArrowRight size={17} />
            </Link>
            <Link href="/packages" className="btn-outline-white" style={{ textDecoration: "none" }}>
              Browse Packages
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
