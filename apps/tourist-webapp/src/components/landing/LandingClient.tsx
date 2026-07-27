"use client";

import React, { useEffect } from "react";
import { HeroSection } from "./HeroSection";
import { DestinationsSection } from "./DestinationsSection";
import { ExperiencesSection } from "./ExperiencesSection";
import { RegionalExperiencesSection } from "./RegionalExperiencesSection";
import { Footer } from "./Footer";
import type { Destination, Service, Event } from "@repo/database";

interface LandingClientProps {
  destinations: Destination[];
  experiences: Service[];
  events: Event[];
}

export function LandingClient({
  destinations,
  experiences,
  events,
}: LandingClientProps) {
  useEffect(() => {
    // any client-side initialization
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F9F8F5", color: "#0A2320" }}>
      {/* Hero — full viewport, navbar overlays as transparent header */}
      <HeroSection />

      {/* Hidden Uzbekistan — 4-column curated gems grid */}
      <DestinationsSection destinations={destinations} />

      {/* Curated Packages — horizontal scroll carousel on white bg */}
      <ExperiencesSection experiences={experiences} />

      {/* Regional Experiences — 4-column grid on sand bg */}
      <RegionalExperiencesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
