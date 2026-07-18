"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@repo/ui";
import { Map, MessageSquare, Compass, ArrowRight, ShieldCheck } from "lucide-react";

export default function PublicLandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center">
        <div className="w-16 h-16 bg-[#1E6F8A]/10 rounded-2xl flex items-center justify-center mb-6">
          <Compass className="w-8 h-8 text-[#1E6F8A]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4 max-w-2xl">
          Uzbekistan Digital Tourism Ecosystem
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
          Your all-in-one platform for authentic travel. Connect with local guides, navigate securely, and cross language barriers instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/auth/register" className="flex-1 block outline-none">
            <Button size="lg" className="w-full rounded-lg bg-[#1E6F8A] hover:bg-[#14506A] text-lg h-14">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login" className="flex-1 block outline-none">
            <Button variant="secondary" size="lg" className="w-full rounded-lg text-lg h-14 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 bg-white shadow-sm">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Showcase (F-T01 & F-T04) */}
      <section className="py-16 px-6 bg-white border-t border-gray-100 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-2">Platform Capabilities</h2>
            <p className="text-2xl font-semibold text-gray-900">Built for seamless exploration.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Survival Map Info */}
            <div className="bg-[#F9FAFB] border border-gray-100 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <Map className="w-6 h-6 text-[#1E6F8A]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Survival Map</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Offline-capable interactive mapping. Instantly locate verified SOS hubs, hygienic restrooms, pharmacies, and cultural landmarks across Uzbekistan.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-700 font-medium">
                  <ShieldCheck className="w-5 h-5 text-green-600 mr-3" /> Certified Safe Zones
                </li>
                <li className="flex items-center text-sm text-gray-700 font-medium">
                  <ShieldCheck className="w-5 h-5 text-green-600 mr-3" /> Offline Tile Caching
                </li>
              </ul>
            </div>

            {/* Contextual Translator Info */}
            <div className="bg-[#F9FAFB] border border-gray-100 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-[#1E6F8A]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Contextual Translator</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Real-time voice and text translation (Uzbek, Russian, English) powered by advanced AI. Includes cultural notes and polite etiquette guidance.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-gray-700 font-medium">
                  <ShieldCheck className="w-5 h-5 text-green-600 mr-3" /> Real-time Speech-to-Text
                </li>
                <li className="flex items-center text-sm text-gray-700 font-medium">
                  <ShieldCheck className="w-5 h-5 text-green-600 mr-3" /> Local Bargaining Etiquette
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Provider Call-to-action */}
      <section className="bg-[#1E6F8A] text-white py-12 px-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Are you a local service provider?</h2>
        <Link href="/auth/provider-access" className="inline-flex items-center justify-center text-sm font-medium text-[#1E6F8A] bg-white px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
          Access Provider Portal <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>

    </main>
  );
}
