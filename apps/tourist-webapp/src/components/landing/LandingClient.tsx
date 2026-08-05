"use client";

import React from "react";
import { HeroSection } from "./HeroSection";
import { DestinationsSection } from "./DestinationsSection";
import { EventsSection } from "./EventsSection";
import { OffersSection } from "./OffersSection";
import { ThingsToDoSection } from "./ThingsToDoSection";
import { KnowTheDestinationsSection } from "./KnowTheDestinationsSection";
import { PackagesSection } from "./PackagesSection";
import { StatsSection } from "./StatsSection";
import { KnowBeforeYouGoSection } from "./KnowBeforeYouGoSection";
import { SurveyCTASection } from "./SurveyCTASection";
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
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F9F8F5", color: "#0A2320" }}>
      {/* Hero — full viewport slider, navbar overlays as transparent header */}
      <HeroSection />

      {/* Explore Silk Road Cities — curated destination carousel */}
      <DestinationsSection destinations={destinations} />

      {/* What's On — upcoming events & festivals */}
      <EventsSection events={events} />

      {/* Discover the Latest Offers — partner discounts */}
      <OffersSection />

      {/* Things To Do — filterable category carousel */}
      <ThingsToDoSection experiences={experiences} />

      {/* Know the Destinations — mini interactive map */}
      <KnowTheDestinationsSection destinations={destinations} />

      {/* Book Your Next Adventure — curated packages by travel agencies */}
      <PackagesSection itineraries={packages} />

      {/* Uzbekistan in Numbers */}
      <StatsSection />

      {/* Know Before You Go */}
      <KnowBeforeYouGoSection />

      {/* Survey CTA */}
      <SurveyCTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
