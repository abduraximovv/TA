"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Users, Minus, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@repo/database";
import { useAuth } from "@repo/auth";
import { Toast } from "@repo/ui";
import { AuthModal } from "@/components/auth/AuthModal";
import { createPackageBooking } from "@/lib/bookings/createPackageBooking";

interface PackageDeparture {
  id: string;
  start_date: string;
  end_date: string;
  max_guests: number;
  booked_guests: number;
  status: "scheduled" | "sold_out" | "cancelled";
}

interface BookedHold {
  bookingId: string;
  departureId: string;
  holdExpiresAt: string;
}

interface PackageDepartureSelectorProps {
  packageId: string;
  /** Fired after create_package_booking succeeds. The booking is a 15-minute payment hold
   *  (status 'pending_payment'), not a completed transaction -- a host component (the
   *  coordinator's package sheet, a checkout page, etc.) decides what "success" means next:
   *  navigate to payment, close a modal, refresh a bookings list, and so on. */
  onBooked?: (booking: BookedHold) => void;
}

type CardBookingState = "idle" | "booking" | "held" | "expired" | "error";

const HOLD_MINUTES = 15;

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
}

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function useCountdown(targetMs: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs === null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  return targetMs === null ? 0 : Math.max(0, targetMs - now);
}

function usePackageDepartures(packageId: string) {
  const [departures, setDepartures] = useState<PackageDeparture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchDepartures = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("package_departures")
      .select("id, start_date, end_date, max_guests, booked_guests, status")
      .eq("itinerary_id", packageId)
      .eq("status", "scheduled")
      .order("start_date", { ascending: true });

    if (error) {
      setLoadError(error.message);
      setDepartures([]);
    } else {
      setDepartures((data ?? []) as PackageDeparture[]);
    }
    setIsLoading(false);
  }, [packageId]);

  useEffect(() => {
    fetchDepartures();
  }, [fetchDepartures]);

  return { departures, isLoading, loadError, refetch: fetchDepartures };
}

interface DepartureCardProps {
  departure: PackageDeparture;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onBooked: (booking: BookedHold) => void;
  onError: (message: string) => void;
  onCapacityChanged: () => void;
}

function DepartureCard({ departure, isAuthenticated, onRequireAuth, onBooked, onError, onCapacityChanged }: DepartureCardProps) {
  const remaining = departure.max_guests - departure.booked_guests;
  const isSoldOut = remaining <= 0;

  const [guests, setGuests] = useState(1);
  const [state, setState] = useState<CardBookingState>("idle");
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const msRemaining = useCountdown(holdExpiresAt);

  // Keeps the stepper from sitting on a now-invalid value after a refetch shrinks remaining
  // capacity (e.g. someone else just booked the last few seats).
  useEffect(() => {
    setGuests((g) => Math.min(g, Math.max(1, remaining)));
  }, [remaining]);

  useEffect(() => {
    if (state === "held" && holdExpiresAt !== null && msRemaining <= 0) {
      setState("expired");
    }
  }, [state, holdExpiresAt, msRemaining]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    if (state === "booking" || state === "held" || isSoldOut) return;

    setState("booking");
    const supabase = getSupabaseBrowserClient();
    // create_package_booking RETURNS public.bookings (not SETOF) -- PostgREST/supabase-js already
    // hands back a bare object for a non-SETOF-returning function, same as
    // create_booking_with_capacity_check elsewhere in this schema -- .single() would be wrong
    // (and unnecessary) here, that's for coercing an array-returning query.
    const { data, error } = await createPackageBooking(supabase, { p_departure_id: departure.id, p_guests: guests });

    if (error || !data) {
      setState("error");
      onError(error?.message || "Couldn't reserve this departure. Please try again.");
      onCapacityChanged();
      return;
    }

    const expiresAtMs = Date.now() + HOLD_MINUTES * 60 * 1000;
    setHoldExpiresAt(expiresAtMs);
    setState("held");
    onCapacityChanged();
    onBooked({ bookingId: data.id, departureId: departure.id, holdExpiresAt: new Date(expiresAtMs).toISOString() });
  };

  return (
    <div
      className="flex flex-col gap-3"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(10,35,32,0.08)",
        borderRadius: 16,
        padding: 16,
        opacity: isSoldOut && state === "idle" ? 0.55 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2" style={{ color: "#0A2320", minWidth: 0 }}>
          <Calendar className="w-4 h-4 shrink-0" style={{ color: "#C5A880" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
            {formatDateRange(departure.start_date, departure.end_date)}
          </span>
        </div>
        <span
          className="shrink-0"
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 100,
            background: isSoldOut ? "rgba(201,59,59,0.1)" : remaining <= 3 ? "rgba(197,168,128,0.18)" : "rgba(10,35,32,0.06)",
            color: isSoldOut ? "#C93B3B" : remaining <= 3 ? "#8A6D3B" : "rgba(10,35,32,0.6)",
          }}
        >
          {isSoldOut ? "Sold out" : `${remaining} seat${remaining === 1 ? "" : "s"} left`}
        </span>
      </div>

      {state === "held" ? (
        <div className="flex items-center gap-2" style={{ color: "#006B70", fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Reserved — complete payment within {formatCountdown(msRemaining)}
        </div>
      ) : (
        <>
          {state === "expired" && (
            <div style={{ fontSize: 12, color: "#C93B3B" }}>Your hold expired before payment completed — reserve again to lock in a spot.</div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={isSoldOut || state === "booking" || guests <= 1}
                aria-label="Decrease guests"
                className="tap-active flex items-center justify-center rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ width: 28, height: 28, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: "#0A2320", minWidth: 44, justifyContent: "center" }}>
                <Users className="w-3.5 h-3.5" style={{ color: "rgba(10,35,32,0.5)" }} />
                {guests}
              </span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(Math.max(1, remaining), g + 1))}
                disabled={isSoldOut || state === "booking" || guests >= remaining}
                aria-label="Increase guests"
                className="tap-active flex items-center justify-center rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ width: 28, height: 28, background: "rgba(10,35,32,0.05)", color: "#0A2320" }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleReserve}
              disabled={isSoldOut || state === "booking"}
              className="tap-active flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#C5A880", color: "#FFFFFF", borderRadius: 100, padding: "9px 18px", fontSize: 13, fontWeight: 700, minWidth: 96 }}
            >
              {state === "booking" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {state === "booking" ? "Reserving…" : isSoldOut ? "Sold out" : "Reserve"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function PackageDepartureSelector({ packageId, onBooked }: PackageDepartureSelectorProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { departures, isLoading, loadError, refetch } = usePackageDepartures(packageId);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("danger");

  const handleError = useCallback((message: string) => {
    setToastVariant("danger");
    setToastMessage(message);
  }, []);

  const handleBooked = useCallback(
    (booking: BookedHold) => {
      setToastVariant("success");
      setToastMessage(`Reserved! Complete payment within ${HOLD_MINUTES} minutes to confirm your spot.`);
      onBooked?.(booking);
    },
    [onBooked]
  );

  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col gap-3" aria-label="Loading departure dates">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse" style={{ height: 88, borderRadius: 16, background: "rgba(10,35,32,0.05)" }} />
        ))}
      </div>
    );
  }

  if (loadError) {
    return <div style={{ fontSize: 13, color: "#C93B3B", padding: 12 }}>Couldn't load departure dates. Please try again.</div>;
  }

  if (departures.length === 0) {
    return <div style={{ fontSize: 13, color: "rgba(10,35,32,0.5)", padding: 12 }}>No upcoming departures are scheduled for this package right now.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {departures.map((departure) => (
        <DepartureCard
          key={departure.id}
          departure={departure}
          isAuthenticated={!!user}
          onRequireAuth={() => setShowAuthModal(true)}
          onBooked={handleBooked}
          onError={handleError}
          onCapacityChanged={refetch}
        />
      ))}

      <AuthModal isOpen={showAuthModal} onOpenChange={setShowAuthModal} />
      <Toast message={toastMessage} isVisible={!!toastMessage} onClose={() => setToastMessage("")} variant={toastVariant} />
    </div>
  );
}
