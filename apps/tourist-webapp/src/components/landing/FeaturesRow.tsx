"use client";

import React from "react";
import { ShieldCheck, HeadphonesIcon, Lock, CheckCircle2, Hotel } from "lucide-react";

export function FeaturesRow() {
  const features = [
    {
      title: "Best Price",
      subtitle: "Guarantee",
      icon: ShieldCheck,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: "24/7 Support",
      subtitle: "We are here",
      icon: HeadphonesIcon,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Secure Booking",
      subtitle: "100% safe",
      icon: Lock,
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      title: "Easy Cancellation",
      subtitle: "Hassle-free",
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Handpicked Hotels",
      subtitle: "Top Rated",
      icon: Hotel,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <section className="py-8 bg-white border-y border-gray-100">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4 justify-center lg:justify-start">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${feature.bg} ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-dark-graphite leading-tight">{feature.title}</span>
                <span className="text-[11px] font-medium text-gray-500">{feature.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
