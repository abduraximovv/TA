"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@repo/auth";
import { getSupabase, getMyBookings, subscribeToBookingUpdates } from "@repo/database";
import { LoadingPulse, Toast } from "@repo/ui";
import type { Booking } from "@repo/types";
import { BookingsDataTable } from "@/components/bookings/BookingsDataTable";
import { BookingDetailsPanel } from "@/components/bookings/BookingDetailsPanel";
import type { EnrichedBooking } from "@/components/bookings/types";

export default function BookingsPage() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    const supabase = getSupabase();

    try {
      const rows = await getMyBookings(session.user.id, "agency");

      const touristIds = Array.from(new Set(rows.map((b) => b.tourist_id)));
      const serviceIds = Array.from(new Set(rows.filter((b) => b.service_id).map((b) => b.service_id as string)));
      const itineraryIds = Array.from(new Set(rows.filter((b) => b.itinerary_id).map((b) => b.itinerary_id as string)));

      const [profilesRes, servicesRes, itinerariesRes] = await Promise.all([
        touristIds.length
          ? supabase.from("user_profiles").select("id, full_name").in("id", touristIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
        serviceIds.length
          ? supabase.from("services").select("id, title").in("id", serviceIds)
          : Promise.resolve({ data: [] as { id: string; title: string }[] }),
        itineraryIds.length
          ? supabase.from("itineraries").select("id, title").in("id", itineraryIds)
          : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      ]);

      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));
      const serviceMap = new Map((servicesRes.data ?? []).map((s) => [s.id, s.title]));
      const itineraryMap = new Map((itinerariesRes.data ?? []).map((i) => [i.id, i.title]));

      const enriched: EnrichedBooking[] = rows.map((booking) => ({
        ...booking,
        touristName: profileMap.get(booking.tourist_id) || "Unknown Tourist",
        touristEmail: null,
        itemTitle: booking.service_id
          ? serviceMap.get(booking.service_id) || "Unknown Service"
          : itineraryMap.get(booking.itinerary_id ?? "") || "Unknown Package",
      }));

      enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(enriched);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchBookings();
    if (!session?.user?.id) return;
    const channel = subscribeToBookingUpdates(session.user.id, "agency", () => fetchBookings());
    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [session, fetchBookings]);

  const recordStatusChange = async (booking: EnrichedBooking, newStatus: Booking["status"], notes: string | null) => {
    const supabase = getSupabase();

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus } as never)
      .eq("id", booking.id);
    if (updateError) throw new Error(updateError.message);

    await supabase.from("booking_status_history").insert({
      booking_id: booking.id,
      old_status: booking.status,
      new_status: newStatus,
      changed_by: session?.user?.id ?? null,
      notes,
    } as never);

    await supabase.from("notifications").insert({
      user_id: booking.tourist_id,
      title: newStatus === "accepted" ? "Booking accepted" : "Booking declined",
      body:
        newStatus === "accepted"
          ? `Your booking for "${booking.itemTitle}" was accepted.`
          : `Your booking for "${booking.itemTitle}" was declined.${notes ? ` Reason: ${notes}` : ""}`,
      type: newStatus === "accepted" ? "booking_accepted" : "booking_declined",
      action_url: "/bookings",
    } as never);
  };

  const handleAccept = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    try {
      await recordStatusChange(booking, "accepted", null);
      setToastMessage(`Booking for ${booking.touristName} accepted.`);
      await fetchBookings();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to accept booking.");
    }
  };

  const handleDecline = async (id: string, reason: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    try {
      await recordStatusChange(booking, "declined", reason);
      setToastMessage(`Booking for ${booking.touristName} declined.`);
      await fetchBookings();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to decline booking.");
    }
  };

  const selectedBooking = bookings.find((b) => b.id === selectedId) || null;

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Review and respond to travelers' booking requests.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">Failed to load bookings: {error}</div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingPulse className="scale-150 text-primary" />
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_320px] gap-6">
          <BookingsDataTable data={bookings} selectedId={selectedId} onSelect={setSelectedId} />
          <BookingDetailsPanel booking={selectedBooking} onAccept={handleAccept} onDecline={handleDecline} />
        </div>
      )}

      <Toast message={toastMessage ?? ""} isVisible={toastMessage !== null} onClose={() => setToastMessage(null)} />
    </div>
  );
}
