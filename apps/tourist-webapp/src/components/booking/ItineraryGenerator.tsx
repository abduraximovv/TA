"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, MapPin, Check, Loader2 } from "lucide-react";
import { useAuth } from "@repo/auth";
import { Button } from "@repo/ui";
import type { ItinerarySuggestResponse } from "@repo/types";
import { AuthModal } from "@/components/auth/AuthModal";
import { GeometricLoader } from "@/components/ai/GeometricLoader";
import { saveGeneratedItinerary } from "@/app/actions/itinerary";

const INTEREST_OPTIONS = ["Culture", "Nature", "Food", "Adventure"];

// Full generation runs 60-170+ seconds on Kimi -- these cycle every few seconds so the wait
// reads as "working" rather than "stuck".
const LOADING_MESSAGES = [
  "Analyzing your interests…",
  "Mapping decentralized routes across Uzbekistan…",
  "Finding hidden yurts, artisans and mountain trails…",
  "Balancing your budget day by day…",
  "Almost there — finalizing your itinerary…",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface ItineraryGeneratorProps {
  /** Controlled, same pattern as MenuScanner/AuthModal -- lets each host screen supply its own trigger. */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItineraryGenerator({ isOpen, onOpenChange }: ItineraryGeneratorProps) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [days, setDays] = useState(5);
  const [budgetUsd, setBudgetUsd] = useState(300);
  const [interests, setInterests] = useState<string[]>(["Culture"]);
  const [startDate, setStartDate] = useState(todayIso());

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<ItinerarySuggestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    if (!isGenerating) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const reset = () => {
    setResult(null);
    setError(null);
    setIsGenerating(false);
    setSaveState("idle");
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const handleGenerate = async () => {
    if (interests.length === 0) {
      setError("Pick at least one interest.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setSaveState("idle");

    try {
      const res = await fetch("/api/v1/ai/itinerary-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, budget_usd: budgetUsd, interests, start_date: startDate }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error === "RATE_LIMITED"
            ? "You've hit the hourly limit for trip planning. Try again in a bit."
            : data.error || "Couldn't plan your trip. Please try again."
        );
      }

      setResult({ total_estimated_cost: data.total_estimated_cost, days: data.days });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    setSaveState("idle");
    try {
      const res = await saveGeneratedItinerary({
        ...result,
        title: `${days}-Day Uzbekistan Trip`,
        start_date: startDate,
        interests,
      });
      setSaveState(res.success ? "saved" : "error");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* No account yet: swap the planner panel for the sign-in prompt instead of opening it. */}
      <AuthModal isOpen={isOpen && !user} onOpenChange={(open) => { if (!open) onOpenChange(false); }} />

      <AnimatePresence>
        {isOpen && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-[110] flex flex-col"
            style={{ background: "#F9F8F5" }}
          >
            <header
              className="flex-shrink-0 flex items-center justify-between border-b"
              style={{
                paddingTop: "calc(var(--safe-top) + 14px)",
                paddingBottom: 14,
                paddingLeft: 16,
                paddingRight: 16,
                background: "#FFFFFF",
                borderColor: "rgba(10,35,32,0.08)",
              }}
            >
              <div className="font-serif font-semibold text-[17px]" style={{ color: "#0A2320" }}>
                Itinerary Canvas
              </div>
              <button
                onClick={close}
                aria-label="Close itinerary planner"
                className="tap-target tap-active flex items-center justify-center rounded-full"
                style={{ width: 36, height: 36, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6" style={{ paddingBottom: "calc(var(--safe-bottom) + 24px)" }}>
              <div className="max-w-lg mx-auto flex flex-col gap-6">
                {!result && !isGenerating && (
                  <>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(10,35,32,0.65)" }}>
                      Kimi designs a day-by-day plan that favors real yurt camps, artisan workshops and mountain
                      homestays over crowded landmarks.
                    </p>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(10,35,32,0.5)" }}>
                          Duration
                        </label>
                        <span className="font-mono text-[13px] font-semibold" style={{ color: "#0A2320" }}>
                          {days} {days === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={14}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full accent-[#0A2320]"
                      />
                    </div>

                    <div>
                      <label
                        className="text-[11px] font-bold uppercase tracking-wider mb-2 block"
                        style={{ color: "rgba(10,35,32,0.5)" }}
                      >
                        Budget (USD)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={budgetUsd}
                        onChange={(e) => setBudgetUsd(Number(e.target.value))}
                        className="w-full text-[15px] outline-none"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid rgba(10,35,32,0.15)",
                          borderRadius: 12,
                          padding: "11px 16px",
                          color: "#0A2320",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="text-[11px] font-bold uppercase tracking-wider mb-2 block"
                        style={{ color: "rgba(10,35,32,0.5)" }}
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        min={todayIso()}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-[15px] outline-none"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid rgba(10,35,32,0.15)",
                          borderRadius: 12,
                          padding: "11px 16px",
                          color: "#0A2320",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="text-[11px] font-bold uppercase tracking-wider mb-2 block"
                        style={{ color: "rgba(10,35,32,0.5)" }}
                      >
                        Interests
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_OPTIONS.map((interest) => {
                          const active = interests.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className="tap-active text-[13px] font-semibold rounded-full"
                              style={{
                                padding: "7px 16px",
                                border: `1px solid ${active ? "#0A2320" : "rgba(10,35,32,0.15)"}`,
                                background: active ? "#0A2320" : "#FFFFFF",
                                color: active ? "#FFFFFF" : "#0A2320",
                              }}
                            >
                              {interest}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {error && (
                      <div
                        className="text-[13px] rounded-xl px-4 py-3"
                        style={{ background: "rgba(201,59,59,0.08)", color: "#C93B3B", border: "1px solid rgba(201,59,59,0.2)" }}
                      >
                        {error}
                      </div>
                    )}

                    <Button variant="default" className="w-full h-12" onClick={handleGenerate}>
                      Generate Itinerary
                    </Button>
                  </>
                )}

                {isGenerating && (
                  <>
                    <GeometricLoader label={LOADING_MESSAGES[loadingMessageIndex]} />
                    <p className="text-[12px] text-center -mt-4" style={{ color: "rgba(10,35,32,0.45)" }}>
                      A full itinerary can take a minute or two — worth the wait.
                    </p>
                  </>
                )}

                {result && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-serif font-semibold text-[22px]" style={{ color: "#0A2320" }}>
                          Your {result.days.length}-Day Trip
                        </div>
                        <div className="text-[13px]" style={{ color: "rgba(10,35,32,0.55)" }}>
                          Starting {startDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11px] uppercase tracking-wide" style={{ color: "rgba(10,35,32,0.45)" }}>
                          Est. Total
                        </div>
                        <div className="font-mono text-[18px] font-bold" style={{ color: "#C5A880" }}>
                          ${result.total_estimated_cost.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-8">
                      {result.days.map((day, dayIdx) => (
                        <motion.div
                          key={day.day_number}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : dayIdx * 0.08 }}
                        >
                          <div className="flex items-baseline gap-3 mb-4">
                            <div
                              className="font-mono text-[11px] font-bold rounded-full flex items-center justify-center shrink-0"
                              style={{ width: 26, height: 26, background: "#0A2320", color: "#F9F8F5" }}
                            >
                              {day.day_number}
                            </div>
                            <div className="font-serif font-semibold text-[17px]" style={{ color: "#0A2320" }}>
                              {day.theme}
                            </div>
                          </div>

                          <div className="flex flex-col" style={{ borderLeft: "2px solid rgba(10,35,32,0.1)", marginLeft: 13 }}>
                            {day.activities.map((activity, actIdx) => (
                              <div key={actIdx} className="relative pl-6 pb-6 last:pb-0">
                                <div
                                  className="absolute rounded-full"
                                  style={{ width: 9, height: 9, background: "#006B70", left: -5.5, top: 4 }}
                                />
                                <div className="font-mono text-[11px] font-semibold mb-1" style={{ color: "#006B70" }}>
                                  {activity.time}
                                </div>
                                <div className="font-semibold text-[14.5px] mb-1" style={{ color: "#0A2320" }}>
                                  {activity.title}
                                </div>
                                <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: "rgba(10,35,32,0.65)" }}>
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-3 text-[11.5px]" style={{ color: "rgba(10,35,32,0.5)" }}>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {activity.location_name}
                                  </span>
                                  <span className="font-mono font-semibold" style={{ color: "#C5A880" }}>
                                    ${activity.estimated_cost}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={reset}>
                        Plan Another
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={handleSave}
                        disabled={isSaving || saveState === "saved"}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saveState === "saved" ? (
                          <Check className="w-4 h-4" />
                        ) : null}
                        {saveState === "saved" ? "Saved to My Trips" : "Save to My Trips"}
                      </Button>
                    </div>
                    {saveState === "error" && (
                      <div className="text-[13px] text-center" style={{ color: "#C93B3B" }}>
                        Couldn't save your trip. Please try again.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
