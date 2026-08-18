"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, MessageSquare, Loader2 } from "lucide-react";
import type { SavedSessionSummary } from "./SafronCoordinator";

interface HistoryPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: SavedSessionSummary[];
  currentSessionId: string | null;
  isLoading: boolean;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  prefersReducedMotion: boolean;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function HistoryPanel({
  isOpen,
  onOpenChange,
  sessions,
  currentSessionId,
  isLoading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  prefersReducedMotion,
}: HistoryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[130]"
            style={{ background: "rgba(10,35,32,0.4)", backdropFilter: "blur(4px)" }}
          />

          {/* Slide-in drawer, left edge -- standard chat-history convention */}
          <motion.div
            key="history-drawer"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
            transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", bounce: 0.1, duration: 0.4 }}
            className="fixed top-0 left-0 bottom-0 z-[131] flex flex-col"
            style={{
              width: "min(340px, 88vw)",
              background: "#F9F8F5",
              borderRight: "1px solid rgba(10,35,32,0.08)",
              boxShadow: "8px 0 40px rgba(10,35,32,0.15)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5" style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 18px)", paddingBottom: 16 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#0A2320" }}>
                Your Trips
              </span>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close history"
                className="tap-active flex items-center justify-center"
                style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(10,35,32,0.06)", color: "#0A2320" }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* New Chat */}
            <div className="px-5 mb-3">
              <button
                onClick={onNewChat}
                className="tap-active w-full flex items-center justify-center gap-2"
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: "#0A2320",
                  color: "#F9F8F5",
                  fontSize: 13.5,
                  fontWeight: 700,
                }}
              >
                <Plus style={{ width: 15, height: 15 }} />
                New Chat
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 style={{ width: 20, height: 20, color: "#006B70" }} className="animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MessageSquare style={{ width: 22, height: 22, color: "rgba(10,35,32,0.25)" }} className="mx-auto mb-2" />
                  <p style={{ fontSize: 12.5, color: "rgba(10,35,32,0.45)", fontWeight: 500 }}>
                    No saved trips yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {sessions.map((s) => {
                    const isActive = s.id === currentSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => onSelectSession(s.id)}
                        className="tap-active group flex items-center gap-2 cursor-pointer"
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: isActive ? "rgba(0,107,112,0.08)" : "transparent",
                        }}
                      >
                        <MessageSquare
                          style={{ width: 14, height: 14, flexShrink: 0, color: isActive ? "#006B70" : "rgba(10,35,32,0.35)" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="truncate"
                            style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, color: "#0A2320" }}
                          >
                            {s.title || "New Trip"}
                          </p>
                          <p style={{ fontSize: 10.5, color: "rgba(10,35,32,0.45)", fontWeight: 500 }}>
                            {relativeTime(s.updated_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                          aria-label={`Delete "${s.title || "New Trip"}"`}
                          className="tap-active flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          style={{ width: 26, height: 26, borderRadius: 8, color: "rgba(201,59,59,0.7)" }}
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clear all */}
            {sessions.length > 0 && (
              <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(10,35,32,0.06)" }}>
                <button
                  onClick={() => {
                    if (confirm("Clear all saved trips? This can't be undone.")) onClearAll();
                  }}
                  className="tap-active w-full text-center"
                  style={{ fontSize: 12, fontWeight: 600, color: "rgba(201,59,59,0.75)" }}
                >
                  Clear all history
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
