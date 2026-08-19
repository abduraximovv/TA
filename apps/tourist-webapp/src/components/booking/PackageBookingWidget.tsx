"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Users, Minus, Plus, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@repo/database";
import { useAuth } from "@repo/auth";
import { Toast } from "@repo/ui";
import { AuthModal } from "@/components/auth/AuthModal";
import { createPackageBooking } from "@/lib/bookings/createPackageBooking";

interface DepartureSession {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  max_guests: number;
  booked_guests: number;
  status: "scheduled" | "sold_out" | "cancelled";
}

interface Formalities {
  firstName: string;
  lastName: string;
  phone: string;
  specialRequests: string;
}

interface PackageBookingWidgetProps {
  packageId: string;
  /** Fired after create_package_booking succeeds (booking is a 15-minute payment hold).
   *  Lets a host component (e.g. a Modal wrapper) react -- close itself, navigate, etc. */
  onBookingSuccess?: () => void;
}

type WidgetStep = "session" | "formalities";
type SubmitState = "idle" | "submitting" | "error";

const EMPTY_FORMALITIES: Formalities = { firstName: "", lastName: "", phone: "", specialRequests: "" };

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);
}

function formatDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// "Aug 15, 10:00 AM — 02:00 PM" when the departure has a real time set; falls back to an honest
// date-only (or date range) label when it doesn't -- start_time/end_time are nullable (see
// 20260822000000_package_departures_time.sql) because nothing populates them for existing
// departures yet. Never fabricates a time that isn't actually in the database.
function formatSessionLabel(session: DepartureSession): string {
  const startLabel = formatDateLabel(session.start_date);

  if (!session.start_time || !session.end_time) {
    const endLabel = formatDateLabel(session.end_date);
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }

  return `${startLabel}, ${formatTime(session.start_time)} — ${formatTime(session.end_time)}`;
}

function useDepartureSessions(packageId: string) {
  const [sessions, setSessions] = useState<DepartureSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("package_departures")
      .select("id, start_date, end_date, start_time, end_time, max_guests, booked_guests, status")
      .eq("itinerary_id", packageId)
      .eq("status", "scheduled")
      .order("start_date", { ascending: true });

    if (error) {
      setLoadError(error.message);
      setSessions([]);
    } else {
      setSessions((data ?? []) as DepartureSession[]);
    }
    setIsLoading(false);
  }, [packageId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, loadError, refetch: fetchSessions };
}

export function PackageBookingWidget({ packageId, onBookingSuccess }: PackageBookingWidgetProps) {
  const { user, session: authSession } = useAuth();
  const { sessions, isLoading, loadError, refetch } = useDepartureSessions(packageId);

  const [step, setStep] = useState<WidgetStep>("session");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [formalities, setFormalities] = useState<Formalities>(EMPTY_FORMALITIES);

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("default");

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;
  const remainingSeats = selectedSession ? selectedSession.max_guests - selectedSession.booked_guests : 0;

  // Keeps the stepper off a now-invalid value if the selected session's remaining seats shrink
  // (e.g. a refetch after someone else just booked) or a different session gets selected.
  useEffect(() => {
    setGuests((g) => Math.min(g, Math.max(1, remainingSeats)));
  }, [remainingSeats]);

  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
  };

  const handleContinue = () => {
    if (!selectedSession) return;
    setStep("formalities");
  };

  const handleBack = () => {
    setStep("session");
  };

  const formalitiesValid =
    formalities.firstName.trim().length > 0 && formalities.lastName.trim().length > 0 && formalities.phone.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !authSession) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedSession || !formalitiesValid || submitState === "submitting") return;

    // Personal details aren't wired into any table yet (create_package_booking doesn't take a
    // name/phone -- only p_departure_id/p_guests) -- logged for now, exactly as requested, until
    // that persistence is built.
    console.log("Booking formalities (not yet persisted):", {
      departureId: selectedSession.id,
      guests,
      ...formalities,
    });

    setSubmitState("submitting");

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await createPackageBooking(supabase, { p_departure_id: selectedSession.id, p_guests: guests });

    if (error || !data) {
      setSubmitState("error");
      setToastVariant("danger");
      setToastMessage(error?.message || "Couldn't reserve these seats. Please try again.");
      refetch();
      return;
    }

    setToastVariant("success");
    setToastMessage("Seats reserved for 15 minutes, please proceed to payment.");
    setSubmitState("idle");
    setStep("session");
    setSelectedSessionId(null);
    setGuests(1);
    setFormalities(EMPTY_FORMALITIES);
    refetch();
    onBookingSuccess?.();
  };

  return (
    <div className="w-full">
      <div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320" }}>
            {step === "session" ? "Choose Your Session" : "Your Details"}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>
            {step === "session" ? "Real dates, real remaining seats" : "A few details to confirm your hold"}
          </div>
        </div>

        <div>
          {step === "session" ? (
            <>
              {isLoading && (
                <div className="flex flex-col gap-3" aria-label="Loading sessions">
                  {[0, 1].map((i) => (
                    <div key={i} className="animate-pulse" style={{ height: 78, borderRadius: 14, background: "rgba(10,35,32,0.05)" }} />
                  ))}
                </div>
              )}

              {!isLoading && loadError && (
                <div style={{ fontSize: 13, color: "#C93B3B" }}>Couldn't load available sessions. Please try again.</div>
              )}

              {!isLoading && !loadError && sessions.length === 0 && (
                <div style={{ fontSize: 13, color: "rgba(10,35,32,0.5)" }}>No upcoming sessions are scheduled for this package right now.</div>
              )}

              {!isLoading && !loadError && sessions.length > 0 && (
                <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Available sessions">
                  {sessions.map((s) => {
                    const seatsLeft = s.max_guests - s.booked_guests;
                    const isSelected = s.id === selectedSessionId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectSession(s.id)}
                        className="tap-active w-full text-left"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "13px 14px",
                          borderRadius: 14,
                          border: isSelected ? "2px solid #C5A880" : "1px solid rgba(10,35,32,0.1)",
                          background: isSelected ? "rgba(197,168,128,0.08)" : "#FFFFFF",
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Calendar className="w-4 h-4 shrink-0" style={{ color: "#C5A880" }} />
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: "#0A2320" }}>
                            {formatSessionLabel(s)}
                          </span>
                        </div>
                        <span
                          className="shrink-0"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 100,
                            background: seatsLeft <= 3 ? "rgba(197,168,128,0.18)" : "rgba(10,35,32,0.06)",
                            color: seatsLeft <= 3 ? "#8A6D3B" : "rgba(10,35,32,0.6)",
                          }}
                        >
                          Seats left: {seatsLeft}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedSession && (
                <>
                  <div className="flex items-center justify-between" style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(10,35,32,0.08)" }}>
                    <span style={{ fontSize: 13, color: "#0A2320", fontWeight: 600 }}>Guests</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        disabled={guests <= 1}
                        aria-label="Decrease guests"
                        className="tap-active flex items-center justify-center rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ width: 30, height: 30, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex items-center gap-1.5" style={{ fontSize: 14, color: "#0A2320", minWidth: 46, justifyContent: "center" }}>
                        <Users className="w-3.5 h-3.5" style={{ color: "rgba(10,35,32,0.5)" }} />
                        {guests}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.min(Math.max(1, remainingSeats), g + 1))}
                        disabled={guests >= remainingSeats}
                        aria-label="Increase guests"
                        className="tap-active flex items-center justify-center rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ width: 30, height: 30, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="tap-active w-full flex items-center justify-center"
                    style={{ marginTop: 16, background: "#C5A880", color: "#FFFFFF", borderRadius: 100, padding: "13px 0", fontSize: 14, fontWeight: 700 }}
                  >
                    Continue
                  </button>
                </>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="tap-active flex items-center gap-1.5"
                style={{ fontSize: 12.5, color: "rgba(10,35,32,0.55)", fontWeight: 600, marginBottom: -4, alignSelf: "flex-start" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sessions
              </button>

              {selectedSession && (
                <div style={{ background: "#F9F8F5", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, color: "#0A2320" }}>
                  You selected: <strong>{formatSessionLabel(selectedSession)}</strong>. Guests: <strong>{guests}</strong>.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pbw-first-name" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                    First Name
                  </label>
                  <input
                    id="pbw-first-name"
                    type="text"
                    required
                    value={formalities.firstName}
                    onChange={(e) => setFormalities((f) => ({ ...f, firstName: e.target.value }))}
                    className="outline-none"
                    style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "#0A2320" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pbw-last-name" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                    Last Name
                  </label>
                  <input
                    id="pbw-last-name"
                    type="text"
                    required
                    value={formalities.lastName}
                    onChange={(e) => setFormalities((f) => ({ ...f, lastName: e.target.value }))}
                    className="outline-none"
                    style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "#0A2320" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pbw-phone" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                  Phone Number
                </label>
                <input
                  id="pbw-phone"
                  type="tel"
                  required
                  value={formalities.phone}
                  onChange={(e) => setFormalities((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+998 90 123 45 67"
                  className="outline-none"
                  style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "#0A2320" }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pbw-notes" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                  Special Requests <span style={{ fontWeight: 400, color: "rgba(10,35,32,0.4)" }}>(optional)</span>
                </label>
                <textarea
                  id="pbw-notes"
                  value={formalities.specialRequests}
                  onChange={(e) => setFormalities((f) => ({ ...f, specialRequests: e.target.value }))}
                  rows={3}
                  className="outline-none resize-none"
                  style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "#0A2320" }}
                />
              </div>

              <button
                type="submit"
                disabled={!formalitiesValid || submitState === "submitting"}
                className="tap-active w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#C5A880", color: "#FFFFFF", borderRadius: 100, padding: "13px 0", fontSize: 14, fontWeight: 700 }}
              >
                {submitState === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitState === "submitting" ? "Booking…" : "Book Now"}
              </button>

              {submitState === "error" && toastVariant === "danger" && (
                <div style={{ fontSize: 12, color: "#C93B3B", textAlign: "center" }}>{toastMessage}</div>
              )}
            </form>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onOpenChange={setShowAuthModal} />
      <Toast message={toastMessage} isVisible={!!toastMessage} onClose={() => setToastMessage("")} variant={toastVariant} />
    </div>
  );
}
