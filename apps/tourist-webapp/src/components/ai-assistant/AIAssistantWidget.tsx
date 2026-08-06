"use client";

import React, { useState } from "react";
import { Sparkles, X, Languages, UtensilsCrossed, LifeBuoy, Route, Send, ArrowLeft, ShieldCheck, type LucideIcon } from "lucide-react";

type TemplateId = "translate" | "food" | "emergency" | "planner";

interface ConversationLine {
  from: "user" | "zarina";
  text: string;
}

interface Template {
  id: TemplateId;
  icon: LucideIcon;
  label: string;
  desc: string;
  gradient: string;
  conversation: ConversationLine[];
}

// Illustrative sample exchanges only -- grounded in the platform's own documented feature specs
// (docs/PRD.md F-T02 Dietary Scanner, F-T04 Contextual Translator, F-T01 Survival Maps) so the
// preview reflects real product direction rather than invented capabilities. Deliberately no
// fabricated phone numbers / addresses in the emergency example -- a demo shouldn't risk being
// mistaken for a real contact in an actual emergency.
const TEMPLATES: Template[] = [
  {
    id: "translate",
    icon: Languages,
    label: "Translate",
    desc: "Menus, signs & phrases",
    gradient: "linear-gradient(135deg, #00888E, #006B70)",
    conversation: [
      { from: "user", text: "How do I politely ask the price at a bazaar?" },
      { from: "zarina", text: "“Bu qancha turadi?” — friendly bargaining is completely normal here, vendors expect it." },
    ],
  },
  {
    id: "food",
    icon: UtensilsCrossed,
    label: "Is This Food Safe?",
    desc: "Ingredients & allergens",
    gradient: "linear-gradient(135deg, #D8BC94, #B0925F)",
    conversation: [
      { from: "user", text: "What's actually in Norin?" },
      { from: "zarina", text: "Thin-cut horse meat and hand-cut noodles, served cold. Contains meat and wheat (gluten) — no dairy or nuts." },
    ],
  },
  {
    id: "emergency",
    icon: LifeBuoy,
    label: "Emergency Help",
    desc: "Verified local contacts",
    gradient: "linear-gradient(135deg, #D66A38, #C1592A)",
    conversation: [
      { from: "user", text: "I lost my passport, what do I do?" },
      { from: "zarina", text: "Pulling the nearest verified embassy, tourist police, and 24/7 pharmacy for your exact location now." },
    ],
  },
  {
    id: "planner",
    icon: Route,
    label: "Plan My Trip",
    desc: "Day-by-day itinerary",
    gradient: "linear-gradient(135deg, #16413C, #0A2320)",
    conversation: [
      { from: "user", text: "3 days in Samarkand — I love architecture and food" },
      { from: "zarina", text: "Day 1: Registan at sunrise → Siyob Bazaar lunch. Day 2: Shah-i-Zinda → home-hosted plov. Day 3: Shakhrisabz day trip. Want real availability from local guides?" },
    ],
  },
];

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<TemplateId | null>(null);
  const active = TEMPLATES.find((t) => t.id === activeId) || null;

  const close = () => {
    setOpen(false);
    setActiveId(null);
  };

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 46 }} className="hidden md:block">
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 72,
            right: 0,
            width: 384,
            maxWidth: "calc(100vw - 48px)",
            background: "#FFFFFF",
            borderRadius: 24,
            boxShadow: "0 28px 64px -8px rgba(10,35,32,0.35)",
            border: "1px solid #EFEDE7",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ position: "relative", background: "linear-gradient(135deg, #0A2320 0%, #16413C 100%)", padding: "22px 22px 20px" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(circle at 85% -10%, rgba(197,168,128,0.25), transparent 55%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #C5A880, #8A6D3B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                  }}
                >
                  <Sparkles size={20} color="#0A2320" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>
                    Zarina
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(249,248,245,0.65)" }}>
                    AI Travel Assistant
                  </div>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Close AI assistant"
                className="tap-active"
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", cursor: "pointer", flexShrink: 0 }}
              >
                <X size={15} />
              </button>
            </div>
            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 14,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(197,168,128,0.16)",
                border: "1px solid rgba(197,168,128,0.35)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#C5A880",
              }}
            >
              <Sparkles size={10} /> Preview — not yet live
            </div>
          </div>

          {!active ? (
            <div style={{ padding: 20 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, lineHeight: 1.55, color: "rgba(10,35,32,0.65)", marginBottom: 18 }}>
                What Zarina is being built to help with on the ground — verified, trusted answers where
                language and access to information are the biggest barriers for travelers here.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveId(t.id)}
                      className="tap-active"
                      style={{
                        textAlign: "left",
                        background: "#F9F8F5",
                        border: "1px solid #EFEDE7",
                        borderRadius: 14,
                        padding: 14,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: t.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={16} color="#FFFFFF" />
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#0A2320", marginBottom: 2 }}>
                          {t.label}
                        </div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "rgba(10,35,32,0.5)", lineHeight: 1.3 }}>
                          {t.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, paddingTop: 16, borderTop: "1px solid #F0EEE8" }}>
                <ShieldCheck size={13} color="#006B70" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,35,32,0.5)" }}>
                  Designed to answer only from verified local sources.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: 20 }}>
              <button
                onClick={() => setActiveId(null)}
                className="tap-active"
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, marginBottom: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#006B70" }}
              >
                <ArrowLeft size={14} /> All features
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: active.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <active.icon size={15} color="#FFFFFF" />
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#0A2320" }}>
                  {active.label}
                </div>
              </div>

              {/* Illustrative sample exchange -- static, not a live conversation */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {active.conversation.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: line.from === "user" ? "flex-end" : "flex-start",
                      maxWidth: "88%",
                      background: line.from === "user" ? "#0A2320" : "#F9F8F5",
                      color: line.from === "user" ? "#FFFFFF" : "#0A2320",
                      border: line.from === "user" ? "none" : "1px solid #EFEDE7",
                      borderRadius: line.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      padding: "10px 13px",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}
                  >
                    {line.text}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#F9F8F5",
                  border: "1px solid #EFEDE7",
                  borderRadius: 999,
                  padding: "6px 6px 6px 16px",
                }}
              >
                <input
                  disabled
                  placeholder="Preview only — full AI coming soon"
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: 12.5,
                    fontFamily: "'Inter', sans-serif",
                    color: "rgba(10,35,32,0.4)",
                    cursor: "not-allowed",
                  }}
                />
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#E5E3DD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "rgba(10,35,32,0.35)",
                  }}
                >
                  <Send size={13} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="tap-active"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #006B70 0%, #0A2320 100%)",
          border: "none",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 10px 28px rgba(10,35,32,0.35)",
        }}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>
    </div>
  );
}
