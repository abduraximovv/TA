"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Send, Compass } from "lucide-react";
import { useAuth } from "@repo/auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { GeometricLoader } from "@/components/ai/GeometricLoader";
import { RecommendedServiceCard } from "@/components/booking/RecommendedServiceCard";
import type { AIServiceSearchResult } from "@repo/types";

interface ItineraryGeneratorProps {
  /** Controlled, same pattern as MenuScanner/AuthModal -- lets each host screen supply its own trigger. */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type CompassMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Only ever set on assistant messages, straight from that turn's /api/v1/ai/plan-trip response. */
  recommendedServices?: AIServiceSearchResult[];
  travelDate?: string | null;
  guestCount?: number;
};

const WELCOME_MESSAGE: CompassMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Assalomu Alaykum! I am your AI Travel Coordinator. Tell me about your ideal trip to Uzbekistan (budget, interests, dates) and I'll build a custom package for you!",
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ItineraryGenerator({ isOpen, onOpenChange }: ItineraryGeneratorProps) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [messages, setMessages] = useState<CompassMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }, [messages, isLoading, isOpen, user, prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen || !user) return;
    // Let the slide-up settle before stealing focus, otherwise the on-screen keyboard fights
    // the drawer's entrance animation on mobile.
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [isOpen, user]);

  const close = () => {
    onOpenChange(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: CompassMessage = { id: createId(), role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/ai/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The new user message is already appended to `history` above, and plan-trip requires
          // the last entry in the array to be the user's turn -- unlike the old /api/v1/ai/chat
          // shape (separate content + history), everything goes in one ordered array here.
          messages: history.filter((m) => m.id !== "welcome").map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 429) throw new Error("You've reached the hourly limit for trip planning. Please try again later.");
        throw new Error(data.error || "Couldn't reach your travel coordinator right now.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: data.reply_text,
          recommendedServices: data.recommended_services,
          travelDate: data.travel_date,
          guestCount: data.guest_count,
        },
      ]);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* No account yet: swap the coordinator drawer for the sign-in prompt instead of opening it. */}
      <AuthModal isOpen={isOpen && !user} onOpenChange={(open) => { if (!open) onOpenChange(false); }} />

      <AnimatePresence>
        {isOpen && user && (
          <React.Fragment key="compass-drawer">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              onClick={close}
              className="fixed inset-0 z-[109]"
              style={{ background: "rgba(10,35,32,0.45)" }}
            />

            {/* Sliding mini-chat drawer -- tightly integrated, not a full-screen takeover */}
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[110] flex flex-col mx-auto"
              style={{
                height: "min(82vh, 640px)",
                maxWidth: 560,
                background: "#F9F8F5",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 -20px 60px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              {/* Grabber + header */}
              <div
                className="flex-shrink-0"
                style={{ padding: "10px 20px 16px", background: "#FFFFFF", borderBottom: "1px solid rgba(10,35,32,0.08)" }}
              >
                <div
                  className="mx-auto mb-3"
                  style={{ width: 36, height: 4, borderRadius: 9999, background: "rgba(10,35,32,0.15)" }}
                />
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-full flex items-center justify-center shrink-0"
                    style={{ width: 38, height: 38, background: "linear-gradient(135deg, #006B70, #0A2320)" }}
                  >
                    <Compass className="w-[18px] h-[18px]" style={{ color: "#FFFFFF" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif font-semibold text-[16px] truncate" style={{ color: "#0A2320" }}>
                      AI Travel Coordinator
                    </div>
                    <div className="text-[12px]" style={{ color: "rgba(10,35,32,0.5)" }}>
                      Compass · Plan My Trip
                    </div>
                  </div>
                  <button
                    onClick={close}
                    aria-label="Close"
                    className="tap-target tap-active flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 32, height: 32, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="flex flex-col"
                        style={{ alignItems: message.role === "user" ? "flex-end" : "flex-start" }}
                      >
                        <div
                          className="max-w-[85%] px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap"
                          style={{
                            background: message.role === "user" ? "#0A2320" : "#FFFFFF",
                            color: message.role === "user" ? "#F9F8F5" : "#0A2320",
                            borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            boxShadow: "0 2px 10px rgba(10,35,32,0.06)",
                            border: message.role === "user" ? "none" : "1px solid rgba(10,35,32,0.06)",
                          }}
                        >
                          {message.content}
                        </div>

                        {!!message.recommendedServices?.length && (
                          <div className="w-full flex gap-3 overflow-x-auto scrollbar-hide" style={{ marginTop: 10, paddingBottom: 2 }}>
                            {message.recommendedServices.map((service) => (
                              <RecommendedServiceCard
                                key={service.id}
                                service={service}
                                travelDate={message.travelDate ?? null}
                                guestCount={message.guestCount ?? 1}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        key="thinking"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                      >
                        <GeometricLoader label="Your coordinator is thinking…" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <div className="text-[13px] text-center py-1" style={{ color: "#C93B3B" }}>
                      {error}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex-shrink-0 flex items-center gap-2"
                style={{
                  padding: "12px 16px",
                  paddingBottom: "calc(var(--safe-bottom) + 12px)",
                  background: "#FFFFFF",
                  borderTop: "1px solid rgba(10,35,32,0.08)",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell me about your trip..."
                  aria-label="Message your AI Travel Coordinator"
                  disabled={isLoading}
                  className="flex-1 min-w-0 outline-none text-[14px]"
                  style={{
                    background: "#F9F8F5",
                    border: "1px solid rgba(10,35,32,0.12)",
                    borderRadius: 9999,
                    padding: "11px 18px",
                    color: "#0A2320",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send"
                  className="tap-active flex items-center justify-center rounded-full shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ width: 42, height: 42, background: "#006B70", color: "#FFFFFF" }}
                >
                  <Send className="w-[17px] h-[17px]" />
                </button>
              </form>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
}
