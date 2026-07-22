"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Travelora made our vacation absolutely perfect! Best service and great deals!",
      name: "Sophia Williams",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      quote: "Amazing experience and very easy booking process. Highly recommend!",
      name: "James Anderson",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      quote: "Customer support was awesome and our trip was unforgettable!",
      name: "Olivia Martinez",
      avatar: "https://i.pravatar.cc/150?img=9"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="section-container">
        <div className="flex items-center gap-3 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-dark-graphite tracking-tight">
            What Our Travelers Say
          </h2>
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative group">
          {/* Navigation Arrows */}
          <button className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-sm items-center justify-center text-primary z-10 hover:shadow-md transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-sm items-center justify-center text-primary z-10 hover:shadow-md transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="mb-6 relative">
                  <span className="text-4xl text-primary/20 font-serif absolute -top-4 -left-2">&ldquo;</span>
                  <p className="text-sm font-medium text-dark-graphite relative z-10 leading-relaxed pl-4">
                    {t.quote}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-dark-graphite">{t.name}</h4>
                    <div className="flex gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
