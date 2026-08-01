"use client";

import React from "react";
import { Info } from "lucide-react";
import { ComingSoonCard } from "@/components/ComingSoonCard";

export default function AboutPage() {
  return (
    <ComingSoonCard
      icon={Info}
      iconColor="emerald"
      title="About Silk Road"
      description="We're passionate about connecting travelers with authentic, verified Uzbek experiences. Our full company story is being written right now and will be published soon."
    />
  );
}
