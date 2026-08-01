"use client";

import React, { useEffect } from "react";
import { HeroSection } from "./HeroSection";
import { DestinationsSection } from "./DestinationsSection";
import { PackagesSection } from "./PackagesSection";
import { RegionalExperiencesSection } from "./RegionalExperiencesSection";
import { Footer } from "./Footer";
import type { Destination, Service, Event } from "@repo/database";
import type { Itinerary } from "@repo/types";

interface LandingClientProps {
  destinations: Destination[];
  experiences: Service[];
  packages: Itinerary[];
  events: Event[];
}

export function LandingClient({
  destinations,
  experiences,
  packages,
  events,
}: LandingClientProps) {
  useEffect(() => {
    // any client-side initialization
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F9F8F5", color: "#0A2320" }}>
      {/* Hero — full viewport, navbar overlays as transparent header */}
      <HeroSection />

      {/* Hidden Uzbekistan — 4-column curated gems grid, curated by admins */}
      <DestinationsSection destinations={destinations} />

      {/* Curated Packages — horizontal scroll carousel, by verified travel agencies */}
      <PackagesSection itineraries={packages} />

      {/* Regional Experiences — 4-column grid, hosted by rural providers */}
      <RegionalExperiencesSection experiences={experiences} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
