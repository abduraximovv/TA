"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Camera, X, RotateCcw } from "lucide-react";
import { useAuth } from "@repo/auth";
import { Badge, Button } from "@repo/ui";
import { AuthModal } from "@/components/auth/AuthModal";
import { GeometricLoader } from "@/components/ai/GeometricLoader";

const RESTRICTION_OPTIONS = ["nuts", "gluten", "dairy", "pork", "spicy"];

type DishResult = {
  original_text: string;
  translated_name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  warnings: string[];
  dietary_flags: {
    vegetarian: boolean;
    vegan: boolean;
    halal: boolean;
    gluten_free: boolean;
    nut_free: boolean;
  };
  price_original: string;
  price_usd_approx: number;
};

type ScanResult = {
  dishes: DishResult[];
  restaurant_notes: string;
  scan_confidence: number;
};

interface MenuScannerProps {
  /** Controlled, same pattern as AuthModal -- lets each host screen supply its own trigger. */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuScanner({ isOpen, onOpenChange }: MenuScannerProps) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URLs are only valid for the file's lifetime in memory -- revoke on swap/unmount so
  // captured menu photos don't leak.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsScanning(false);
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the tourist pick/retake the same file twice in a row
    if (!file) return;
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const toggleRestriction = (r: string) => {
    setRestrictions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsScanning(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      restrictions.forEach((r) => formData.append("dietary_restrictions", r));

      const res = await fetch("/api/v1/ai/scan-menu", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Couldn't read this menu. Try a clearer photo.");
      }

      setResult({ dishes: data.dishes, restaurant_notes: data.restaurant_notes, scan_confidence: data.scan_confidence });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      {/* No account yet: swap the scanner panel for the sign-in prompt instead of opening it --
          there's no owning user for Storage/rate-limiting until they're signed in. */}
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
            {/* Header */}
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
                Taste &amp; Trust
              </div>
              <button
                onClick={close}
                aria-label="Close menu scanner"
                className="tap-target tap-active flex items-center justify-center rounded-full"
                style={{ width: 36, height: 36, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6" style={{ paddingBottom: "calc(var(--safe-bottom) + 24px)" }}>
              <div className="max-w-lg mx-auto flex flex-col gap-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!previewUrl && !isScanning && !result && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="tap-active flex flex-col items-center justify-center gap-3 w-full"
                    style={{
                      minHeight: 320,
                      borderRadius: 16,
                      border: "2px dashed rgba(10,35,32,0.2)",
                      background: "#FFFFFF",
                    }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 64, height: 64, background: "rgba(0,107,112,0.1)" }}
                    >
                      <Camera className="w-7 h-7" style={{ color: "#006B70" }} />
                    </div>
                    <div className="font-serif font-semibold text-[17px]" style={{ color: "#0A2320" }}>
                      Scan a menu
                    </div>
                    <p className="text-[13px] text-center max-w-[240px]" style={{ color: "rgba(10,35,32,0.55)" }}>
                      Point your camera at any Uzbek or Russian menu — Kimi will translate it and flag allergens.
                    </p>
                  </button>
                )}

                {previewUrl && !isScanning && !result && (
                  <>
                    <img
                      src={previewUrl}
                      alt="Captured menu"
                      className="w-full object-cover"
                      style={{ borderRadius: 16, maxHeight: 320 }}
                    />

                    <div>
                      <div
                        className="text-[11px] font-bold uppercase tracking-wider mb-2"
                        style={{ color: "rgba(10,35,32,0.5)" }}
                      >
                        Your dietary restrictions (optional)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {RESTRICTION_OPTIONS.map((r) => {
                          const active = restrictions.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => toggleRestriction(r)}
                              className="tap-active capitalize text-[13px] font-semibold rounded-full"
                              style={{
                                padding: "7px 16px",
                                border: `1px solid ${active ? "#0A2320" : "rgba(10,35,32,0.15)"}`,
                                background: active ? "#0A2320" : "#FFFFFF",
                                color: active ? "#FFFFFF" : "#0A2320",
                              }}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Retake
                      </Button>
                      <Button variant="default" className="flex-1" onClick={handleAnalyze}>
                        Analyze Menu
                      </Button>
                    </div>
                  </>
                )}

                {isScanning && <GeometricLoader label="Kimi is reading the menu…" />}

                {error && (
                  <div
                    className="text-[13px] rounded-xl px-4 py-3"
                    style={{ background: "rgba(201,59,59,0.08)", color: "#C93B3B", border: "1px solid rgba(201,59,59,0.2)" }}
                  >
                    {error}
                  </div>
                )}

                {result && (
                  <>
                    {result.restaurant_notes && (
                      <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(10,35,32,0.65)" }}>
                        {result.restaurant_notes}
                      </p>
                    )}

                    <div className="flex flex-col gap-3">
                      {result.dishes.map((dish, i) => {
                        const conflicts = dish.allergens.filter((a) => restrictions.includes(a));
                        const showVerdict = restrictions.length > 0;
                        return (
                          <motion.div
                            key={`${dish.original_text}-${i}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: prefersReducedMotion ? 0 : 0.3,
                              delay: prefersReducedMotion ? 0 : i * 0.05,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                            className="bg-white"
                            style={{ borderRadius: 16, padding: 18, border: "1px solid rgba(10,35,32,0.06)" }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div
                                  className="text-[11px] font-mono uppercase tracking-wide"
                                  style={{ color: "rgba(10,35,32,0.45)" }}
                                >
                                  {dish.original_text}
                                </div>
                                <div className="font-serif font-semibold text-[18px]" style={{ color: "#0A2320" }}>
                                  {dish.translated_name}
                                </div>
                              </div>
                              {showVerdict && (
                                <Badge variant={conflicts.length > 0 ? "danger" : "success"} className="shrink-0">
                                  {conflicts.length > 0 ? `Contains ${conflicts.join(", ")}` : "Safe for you"}
                                </Badge>
                              )}
                            </div>

                            <p className="text-[13.5px] leading-relaxed mt-2" style={{ color: "rgba(10,35,32,0.65)" }}>
                              {dish.description}
                            </p>

                            {(dish.allergens.length > 0 || dish.dietary_flags.halal) && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {dish.allergens.map((a) => (
                                  <Badge key={a} variant={conflicts.includes(a) ? "danger" : "default"}>
                                    {a}
                                  </Badge>
                                ))}
                                {dish.dietary_flags.halal && <Badge variant="success">halal</Badge>}
                              </div>
                            )}

                            {(dish.price_original || dish.price_usd_approx > 0) && (
                              <div className="text-[13px] font-mono mt-3" style={{ color: "#C5A880" }}>
                                {dish.price_original}
                                {dish.price_usd_approx > 0 ? ` (~$${dish.price_usd_approx.toFixed(2)})` : ""}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    <Button variant="outline" onClick={reset}>
                      <Camera className="w-4 h-4 mr-2" /> Scan Another Menu
                    </Button>
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
