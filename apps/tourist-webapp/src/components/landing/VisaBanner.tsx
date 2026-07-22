"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export function VisaBanner() {
  return (
    <section className="bg-secondary text-white relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0L100 50L50 100L0 50Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M25 25L75 75M75 25L25 75" stroke="currentColor" strokeWidth="2" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      <div className="section-container relative z-10 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight mb-4 text-dark-forest">
            Visa has never been easier
          </h2>
          <p className="text-lg text-dark-forest/80 font-medium mb-8 max-w-lg">
            Citizens of over 90 countries can visit Uzbekistan visa-free. For others, an e-Visa takes just 5 minutes to apply.
          </p>
          
          <a
            href="https://e-visa.gov.uz/main"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill bg-dark-forest text-white hover:bg-dark-graphite px-8 py-4 inline-flex items-center gap-2"
          >
            Apply for E-Visa
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
