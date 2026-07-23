"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, FileText, User, Calendar, Users, MessageSquare, MapPin, Utensils, Loader2 } from "lucide-react";
import type { EnrichedBooking } from "./types";

interface BookingDetailsPanelProps {
  booking: EnrichedBooking | null;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string, reason: string) => Promise<void>;
}

export function BookingDetailsPanel({ booking, onAccept, onDecline }: BookingDetailsPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setIsDeclining(false);
    setReason("");
  }, [booking?.id]);

  if (!booking) {
    return (
      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">No Booking Selected</h3>
        <p className="text-xs text-gray-500 max-w-[200px]">Select a booking from the table to view details and respond.</p>
      </div>
    );
  }

  const handleAccept = async () => {
    setIsUpdating(true);
    try {
      await onAccept(booking.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDecline = async () => {
    setIsUpdating(true);
    try {
      await onDecline(booking.id, reason.trim());
      setIsDeclining(false);
      setReason("");
    } finally {
      setIsUpdating(false);
    }
  };

  const passengers = Array.isArray(booking.passenger_manifest)
    ? (booking.passenger_manifest as unknown as string[])
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400" />

      <div className="p-5 border-b border-gray-100 mt-1">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">{booking.itemTitle}</h2>
        <div className="flex items-center mt-2 space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-primary uppercase tracking-wider">
            {booking.itinerary_id ? "Package" : "Service"}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs font-medium text-gray-500">ID: {booking.id.split("-")[0]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <section>
          <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Booking Details</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start">
              <User className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Tourist</p>
                <p className="text-sm font-semibold text-gray-900">{booking.touristName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Date</p>
                <p className="text-sm font-semibold text-gray-900">{format(new Date(booking.booking_date), "PPP")}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Guests</p>
                <p className="text-sm font-semibold text-gray-900">{booking.guest_count}</p>
              </div>
            </div>
          </div>
        </section>

        {booking.special_requests && (
          <section>
            <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Special Requests</h3>
            <div className="flex items-start bg-gray-50 rounded-lg p-4">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
              <p className="text-sm text-gray-700">{booking.special_requests}</p>
            </div>
          </section>
        )}

        {(passengers?.length || booking.dietary_preferences || booking.pickup_location) && (
          <section>
            <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Package Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {passengers && passengers.length > 0 && (
                <div className="flex items-start">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Passengers</p>
                    <p className="text-sm font-semibold text-gray-900">{passengers.join(", ")}</p>
                  </div>
                </div>
              )}
              {booking.dietary_preferences && (
                <div className="flex items-start">
                  <Utensils className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Dietary Preferences</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.dietary_preferences}</p>
                  </div>
                </div>
              )}
              {booking.pickup_location && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Pickup Location</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.pickup_location}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50/50">
        {booking.status === "pending" ? (
          isDeclining ? (
            <div className="space-y-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for declining (visible to the tourist)"
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isUpdating}
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeclining(false)}
                  disabled={isUpdating}
                  className="flex-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecline}
                  disabled={isUpdating || reason.trim().length === 0}
                  className="flex-1 bg-[#C93B3B] hover:bg-[#a92f2f] text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Confirm Decline
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeclining(true)}
                disabled={isUpdating}
                className="flex-1 bg-white border border-[#C93B3B]/20 text-[#C93B3B] hover:bg-[#C93B3B]/5 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={isUpdating}
                className="flex-1 bg-[#2D8A4E] hover:bg-[#236b3d] text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Accept
              </button>
            </div>
          )
        ) : (
          <div
            className={`p-3 rounded-lg border flex items-center justify-center ${
              booking.status === "accepted" || booking.status === "completed"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {booking.status === "accepted" || booking.status === "completed" ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                <span className="text-sm font-semibold capitalize">{booking.status}</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-sm font-semibold capitalize">{booking.status}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
