"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { ComingSoonCard } from "@/components/ComingSoonCard";

export default function HotelsPage() {
  return (
    <ComingSoonCard
      icon={Building2}
      iconColor="gold"
      title="Hotels & Stays"
      description="Integration with our global hotel partners is in progress. Soon you'll be able to book the best hotels right here."
    />
  );
}
