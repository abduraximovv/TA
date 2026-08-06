"use client";

import React, { useState } from "react";
import { Button, Input, Modal, Select, Toast } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@repo/auth";

const CATALOG_OPTIONS = [
  { value: "standard", label: "Standard Options", priceMultiplier: 1 },
  { value: "premium", label: "Premium Catalog", priceMultiplier: 1.5 },
  { value: "vip", label: "VIP Experience", priceMultiplier: 2.5 }
];

export function ServiceBookingModal({
  serviceId,
  price,
  currency,
  isLoggedIn
}: {
  serviceId: string;
  price: number;
  currency: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [catalogOption, setCatalogOption] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("default");
  const router = useRouter();
  const { user, session } = useAuth();

  const handleOpen = () => {
    if (!user && !isLoggedIn) {
      router.push(`/auth/login?next=/service/${serviceId}`);
      return;
    }
    setOpen(true);
  };

  const currentOption = CATALOG_OPTIONS.find(o => o.value === catalogOption) || CATALOG_OPTIONS[0];
  const totalPrice = price * guestCount * currentOption.priceMultiplier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const notes = `Time: ${time}, Option: ${currentOption.label}`;
      
      const payload = {
        service_id: serviceId,
        itinerary_id: null,
        status: "pending",
        booking_date: new Date(date).toISOString(),
        guest_count: guestCount,
        special_requests: notes,
        passenger_manifest: null,
        dietary_preferences: null,
        pickup_location: null,
        total_price: totalPrice,
        currency,
      };

      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": session ? `Bearer ${session.access_token}` : ""
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create booking");
      }

      setOpen(false);
      setToastVariant("success");
      setToastMessage("Your booking request has been submitted successfully.");
      setTimeout(() => {
        router.push("/profile?booked=true");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setToastVariant("danger");
      setToastMessage(err.message || "Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full bg-[#0A2320] text-white px-8 h-14 rounded-full font-sans font-medium text-lg hover:bg-black transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2"
      >
        Request Booking
      </button>

      <Modal open={open} onOpenChange={setOpen} title="Book Experience">
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Catalog / Options</label>
            <Select 
              value={catalogOption} 
              onChange={(e) => setCatalogOption(e.target.value)}
              className="w-full h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4 text-base"
            >
              {CATALOG_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Date</label>
              <Input 
                type="date" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Time</label>
              <Input 
                type="time" 
                required 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Guests</label>
            <Input 
              type="number" 
              min="1" 
              required 
              value={guestCount} 
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)} 
              className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4"
            />
          </div>
          <div className="pt-6 mt-2 flex justify-between items-center border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Price</p>
              <p className="font-bold text-2xl text-[#0A2320]">
                {(Number(totalPrice) || 0).toLocaleString("en-US").replace(/,/g, " ")} {currency}
              </p>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || !date || !time}
              className="bg-[#0A2320] text-white px-8 h-14 rounded-full font-sans font-medium hover:bg-black transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </Modal>
      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
        variant={toastVariant}
      />
    </>
  );
}
