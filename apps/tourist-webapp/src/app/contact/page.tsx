"use client";

import React from "react";
import { PhoneCall } from "lucide-react";
import { ComingSoonCard } from "@/components/ComingSoonCard";

export default function ContactPage() {
  return (
    <ComingSoonCard
      icon={PhoneCall}
      iconColor="teal"
      title="Contact Us"
      description="Our support team is getting ready to assist you 24/7. In the meantime, you can reach us at hello@silkroad.uz."
    />
  );
}
