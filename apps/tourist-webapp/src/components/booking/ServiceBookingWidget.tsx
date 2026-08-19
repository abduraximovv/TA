"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Users, Minus, Plus, Loader2, ArrowLeft } from "lucide-react";
import { getSupabaseBrowserClient } from "@repo/database";
import { useAuth } from "@repo/auth";
import { Toast } from "@repo/ui";
import { AuthModal } from "@/components/auth/AuthModal";

interface InventoryRow {
  id: string;
  available_date: string;
  start_time: string | null;
  total_capacity: number;
  booked_capacity: number;
  is_blocked: boolean;
}

interface DayOption {
  date: string;
  remaining: number;
  times: string[];
}

interface Formalities {
  firstName: string;
  lastName: string;
  phone: string;
  specialRequests: string;
}

interface ServiceBookingWidgetProps {
  serviceId: string;
  price: number;
  currency: string;
  maxGuests: number | null;
  /** Fired after a booking is successfully created. Lets a host component (e.g. a Modal
   *  wrapper) react -- close itself, navigate, etc. */
  onBookingSuccess?: () => void;
}

type WidgetStep = "session" | "formalities";
type SubmitState = "idle" | "submitting" | "error";

const EMPTY_FORMALITIES: Formalities = { firstName: "", lastName: "", phone: "", specialRequests: "" };
const FALLBACK_GUEST_CAP = 20;
const UNMANAGED_LOOKAHEAD_DAYS = 60;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);
}

function formatDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

// service_inventory rows are opt-in per provider (see 20260816000000_service_inventory.sql): a
// service with zero rows for a date is "unmanaged" -- treated as always-open, not unbookable.
// So unlike packages (where no departure truly means "can't run"), an empty inventory result
// here means "let the tourist pick any date" rather than "nothing available".
function useServiceInventory(serviceId: string) {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("service_inventory")
      .select("id, available_date, start_time, total_capacity, booked_capacity, is_blocked")
      .eq("service_id", serviceId)
      .eq("is_blocked", false)
      .gte("available_date", todayIso())
      .order("available_date", { ascending: true });

    if (error) {
      setLoadError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as InventoryRow[]);
    }
    setIsLoading(false);
  }, [serviceId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // capacity enforcement in create_booking_with_capacity_check sums remaining capacity across
  // ALL rows for a given (service_id, date) rather than one specific time slot -- mirrored here
  // so the number shown is exactly what the backend will actually honor, not a per-slot figure
  // it can't guarantee.
  const dayOptions = useMemo<DayOption[]>(() => {
    const byDate = new Map<string, { remaining: number; times: Set<string> }>();
    for (const row of rows) {
      const entry = byDate.get(row.available_date) ?? { remaining: 0, times: new Set<string>() };
      entry.remaining += Math.max(0, row.total_capacity - row.booked_capacity);
      if (row.start_time) entry.times.add(row.start_time);
      byDate.set(row.available_date, entry);
    }
    return Array.from(byDate.entries())
      .map(([date, { remaining, times }]) => ({ date, remaining, times: Array.from(times).sort() }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  return { dayOptions, isManaged: rows.length > 0, isLoading, loadError, refetch: fetchInventory };
}

export function ServiceBookingWidget({ serviceId, price, currency, maxGuests, onBookingSuccess }: ServiceBookingWidgetProps) {
  const { user, session: authSession } = useAuth();
  const { dayOptions, isManaged, isLoading, loadError, refetch } = useServiceInventory(serviceId);

  const [step, setStep] = useState<WidgetStep>("session");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [guests, setGuests] = useState(1);
  const [formalities, setFormalities] = useState<Formalities>(EMPTY_FORMALITIES);

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("default");

  const selectedDayOption = dayOptions.find((d) => d.date === selectedDate) ?? null;
  const guestCap = isManaged
    ? selectedDayOption
      ? Math.min(selectedDayOption.remaining, maxGuests ?? FALLBACK_GUEST_CAP)
      : 0
    : maxGuests ?? FALLBACK_GUEST_CAP;

  useEffect(() => {
    setGuests((g) => Math.min(g, Math.max(1, guestCap)));
  }, [guestCap]);

  const handleSelectDay = (date: string) => setSelectedDate(date);

  const handleContinue = () => {
    if (!selectedDate) return;
    setStep("formalities");
  };

  const handleBack = () => setStep("session");

  const formalitiesValid =
    formalities.firstName.trim().length > 0 && formalities.lastName.trim().length > 0 && formalities.phone.trim().length > 0;

  const totalPrice = price * guests;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !authSession) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedDate || !formalitiesValid || submitState === "submitting") return;

    setSubmitState("submitting");

    const specialRequests = [`Phone: ${formalities.phone}`, formalities.specialRequests.trim()].filter(Boolean).join(". ");

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          service_id: serviceId,
          booking_date: selectedDate,
          guest_count: guests,
          special_requests: specialRequests,
          passenger_manifest: { passengers: [{ name: `${formalities.firstName} ${formalities.lastName}` }] },
          total_price: totalPrice,
          currency,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Couldn't reserve this experience. Please try again.");
      }

      setToastVariant("success");
      setToastMessage("Booking request sent — the provider will confirm shortly.");
      setSubmitState("idle");
      setStep("session");
      setSelectedDate("");
      setGuests(1);
      setFormalities(EMPTY_FORMALITIES);
      refetch();
      onBookingSuccess?.();
    } catch (err: any) {
      setSubmitState("error");
      setToastVariant("danger");
      setToastMessage(err.message || "Couldn't reserve this experience. Please try again.");
    }
  };

  const maxSelectableDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + UNMANAGED_LOOKAHEAD_DAYS);
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <div className="w-full">
      <div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320" }}>
            {step === "session" ? "Choose Your Date" : "Your Details"}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>
            {step === "session"
              ? isManaged
                ? "Real dates, real remaining spots"
                : "Open availability — pick any date"
              : "A few details to confirm your request"}
          </div>
        </div>

        <div>
          {step === "session" ? (
            <>
              {isLoading && (
                <div className="flex flex-col gap-3" aria-label="Loading availability">
                  {[0, 1].map((i) => (
                    <div key={i} className="animate-pulse" style={{ height: 60, borderRadius: 14, background: "rgba(10,35,32,0.05)" }} />
                  ))}
                </div>
              )}

              {!isLoading && loadError && (
                <div style={{ fontSize: 13, color: "#C93B3B" }}>Couldn't load availability. Please try again.</div>
              )}

              {!isLoading && !loadError && isManaged && dayOptions.length === 0 && (
                <div style={{ fontSize: 13, color: "rgba(10,35,32,0.5)" }}>No upcoming dates are open for this experience right now.</div>
              )}

              {!isLoading && !loadError && isManaged && dayOptions.length > 0 && (
                <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Available dates">
                  {dayOptions.map((d) => {
                    const isSelected = d.date === selectedDate;
                    const soldOut = d.remaining <= 0;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={soldOut}
                        onClick={() => handleSelectDay(d.date)}
                        className="tap-active w-full text-left disabled:opacity-40 disabled:cursor-not-allowed"
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
                          <div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 600, color: "#0A2320" }}>
                              {formatDateLabel(d.date)}
                            </div>
                            {d.times.length > 0 && (
                              <div style={{ fontSize: 11, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>
                                {d.times.map(formatTime).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                        <span
                          className="shrink-0"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 100,
                            background: soldOut ? "rgba(201,59,59,0.1)" : d.remaining <= 3 ? "rgba(197,168,128,0.18)" : "rgba(10,35,32,0.06)",
                            color: soldOut ? "#C93B3B" : d.remaining <= 3 ? "#8A6D3B" : "rgba(10,35,32,0.6)",
                          }}
                        >
                          {soldOut ? "Sold out" : `Spots left: ${d.remaining}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!isLoading && !loadError && !isManaged && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sbw-date" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                    Date
                  </label>
                  <input
                    id="sbw-date"
                    type="date"
                    min={todayIso()}
                    max={maxSelectableDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="outline-none"
                    style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "#0A2320" }}
                  />
                </div>
              )}

              {selectedDate && (isManaged ? selectedDayOption : true) && (
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
                        onClick={() => setGuests((g) => Math.min(Math.max(1, guestCap), g + 1))}
                        disabled={guests >= guestCap}
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
                Back to dates
              </button>

              <div style={{ background: "#F9F8F5", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, color: "#0A2320" }}>
                You selected: <strong>{formatDateLabel(selectedDate)}</strong>. Guests: <strong>{guests}</strong>. Total:{" "}
                <strong>
                  {totalPrice.toLocaleString("en-US")} {currency}
                </strong>
                .
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sbw-first-name" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                    First Name
                  </label>
                  <input
                    id="sbw-first-name"
                    type="text"
                    required
                    value={formalities.firstName}
                    onChange={(e) => setFormalities((f) => ({ ...f, firstName: e.target.value }))}
                    className="outline-none"
                    style={{ background: "#F9F8F5", border: "1px solid rgba(10,35,32,0.12)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "#0A2320" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sbw-last-name" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                    Last Name
                  </label>
                  <input
                    id="sbw-last-name"
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
                <label htmlFor="sbw-phone" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                  Phone Number
                </label>
                <input
                  id="sbw-phone"
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
                <label htmlFor="sbw-notes" style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,35,32,0.6)" }}>
                  Special Requests <span style={{ fontWeight: 400, color: "rgba(10,35,32,0.4)" }}>(optional)</span>
                </label>
                <textarea
                  id="sbw-notes"
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
