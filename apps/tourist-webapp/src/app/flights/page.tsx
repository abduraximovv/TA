"use client";

import React from "react";
import { Plane } from "lucide-react";
import { ComingSoonCard } from "@/components/ComingSoonCard";

export default function FlightsPage() {
  return (
    <ComingSoonCard
      icon={Plane}
      iconColor="emerald"
      title="Flights"
      description="We are setting up our flight search engine to provide you with the best prices on airline tickets. Stay tuned!"
    />
  );
}
