"use client";

import React, { useEffect } from "react";
import { HeroSection } from "./HeroSection";
import { DestinationsSection } from "./DestinationsSection";
import { ExperiencesSection } from "./ExperiencesSection";
import { FeaturesRow } from "./FeaturesRow";
import { TestimonialsSection } from "./TestimonialsSection";
import { NewsletterSection } from "./NewsletterSection";
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
  // Pre-load critical assets if needed
  useEffect(() => {
    // any client-side initialization
  }, []);

  return (
    <div className="bg-sand-50">
      <HeroSection />
      
      {/* Popular Destinations */}
      <DestinationsSection destinations={destinations} />
      
      {/* Top Deals This Week */}
      <ExperiencesSection experiences={experiences} />
      
      {/* Trust Features Row */}
      <FeaturesRow />
      
      {/* What Our Travelers Say */}
      <TestimonialsSection />
      
      {/* Newsletter */}
      <NewsletterSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
