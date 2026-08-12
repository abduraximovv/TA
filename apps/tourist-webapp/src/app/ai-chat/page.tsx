"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Compass, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MenuScanner } from "@/components/ai/MenuScanner";
import { ItineraryGenerator } from "@/components/booking/ItineraryGenerator";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Salom! I'm Kimi, your AI travel assistant for Uzbekistan. Ask me to translate a phrase, explain a dish, plan a day trip, or help with directions and local etiquette.",
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AIChatPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuScannerOpen, setIsMenuScannerOpen] = useState(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Kimi AI Assistant — Safron";
  }, []);

  // Load the signed-in tourist's saved conversation (empty for guests, or on any fetch error --
  // either way we fall back to the static greeting rather than leaving the screen blank).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/ai/chat");
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: any) => ({ id: m.id, role: m.role, content: m.content }))
          );
        } else {
          setMessages([GREETING]);
        }
      } catch {
        if (!cancelled) setMessages([GREETING]);
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, isLoading, isHistoryLoading, prefersReducedMotion]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/discover");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { id: createId(), role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          // Only used as a fallback for guests with no saved history server-side; the server
          // uses its own Supabase-backed history for signed-in tourists instead.
          history: history
            .filter((m) => m.id !== "greeting" && m.id !== userMessage.id)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Kimi couldn't reply right now.");
      }

      setMessages((prev) => [...prev, { id: createId(), role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ height: "100dvh", background: "#F9F8F5" }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center gap-3 border-b"
        style={{
          paddingTop: "calc(var(--safe-top) + 14px)",
          paddingBottom: 14,
          paddingLeft: 16,
          paddingRight: 16,
          background: "#FFFFFF",
          borderColor: "rgba(10,35,32,0.08)",
        }}
      >
        <button
          onClick={handleBack}
          aria-label="Back"
          className="tap-target tap-active flex items-center justify-center rounded-full shrink-0"
          style={{ width: 36, height: 36, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 38,
            height: 38,
            background: "linear-gradient(135deg, #C5A880, #8A6D3B)",
            boxShadow: "0 4px 12px rgba(10,35,32,0.2)",
          }}
        >
          <Sparkles className="w-[18px] h-[18px]" style={{ color: "#0A2320" }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-serif font-semibold text-[15px] truncate" style={{ color: "#0A2320" }}>
            Kimi AI Assistant
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "rgba(10,35,32,0.55)" }}>
            <span className="relative flex h-[7px] w-[7px]">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "#2D8A4E" }}
              />
              <span className="relative inline-flex rounded-full h-[7px] w-[7px]" style={{ background: "#2D8A4E" }} />
            </span>
            Online
          </div>
        </div>

        <div className="safron-wordmark shrink-0" style={{ fontSize: 16 }}>
          Safron
        </div>
      </header>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          {isHistoryLoading ? (
            <div className="flex flex-col gap-3" aria-label="Loading conversation">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex" style={{ justifyContent: i === 1 ? "flex-end" : "flex-start" }}>
                  <div
                    className="animate-pulse"
                    style={{
                      width: i === 1 ? "55%" : "70%",
                      height: 42,
                      borderRadius: 16,
                      background: "rgba(10,35,32,0.08)",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex"
                style={{ justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div
                  className="max-w-[82%] px-4 py-3 text-[14.5px] leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: message.role === "user" ? "#FFFFFF" : "#0A2320",
                    color: message.role === "user" ? "#0A2320" : "#FFFFFF",
                    borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    boxShadow:
                      message.role === "user" ? "0 2px 10px rgba(10,35,32,0.06)" : "0 8px 20px rgba(10,35,32,0.18)",
                    border: message.role === "user" ? "1px solid rgba(10,35,32,0.06)" : "none",
                  }}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex"
                style={{ justifyContent: "flex-start" }}
              >
                <div className="flex items-center gap-1 px-4 py-3.5" style={{ background: "#0A2320", borderRadius: "16px 16px 16px 4px" }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "rgba(255,255,255,0.6)", animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          )}

          {error && (
            <div className="text-[13px] text-center py-2" style={{ color: "#C93B3B" }}>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex-shrink-0 flex items-center gap-2 border-t"
        style={{
          padding: "12px 16px",
          paddingBottom: "calc(var(--safe-bottom) + 12px)",
          background: "#FFFFFF",
          borderColor: "rgba(10,35,32,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => setIsMenuScannerOpen(true)}
          aria-label="Scan a menu"
          className="tap-active flex items-center justify-center rounded-full shrink-0"
          style={{ width: 42, height: 42, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
        >
          <Camera className="w-[18px] h-[18px]" />
        </button>
        <button
          type="button"
          onClick={() => setIsItineraryOpen(true)}
          aria-label="Plan my trip"
          className="tap-active flex items-center justify-center rounded-full shrink-0"
          style={{ width: 42, height: 42, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
        >
          <Compass className="w-[18px] h-[18px]" />
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Kimi..."
          aria-label="Message Kimi"
          disabled={isLoading || isHistoryLoading}
          className="flex-1 min-w-0 outline-none text-[15px]"
          style={{
            background: "#F9F8F5",
            border: "1px solid rgba(10,35,32,0.08)",
            borderRadius: 9999,
            padding: "11px 18px",
            color: "#0A2320",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || isHistoryLoading || !input.trim()}
          aria-label="Send message"
          className="tap-active flex items-center justify-center rounded-full shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ width: 42, height: 42, background: "#0A2320", color: "#FFFFFF" }}
        >
          <Send className="w-[18px] h-[18px]" />
        </button>
      </form>

      <MenuScanner isOpen={isMenuScannerOpen} onOpenChange={setIsMenuScannerOpen} />
      <ItineraryGenerator isOpen={isItineraryOpen} onOpenChange={setIsItineraryOpen} />
    </motion.div>
  );
}
