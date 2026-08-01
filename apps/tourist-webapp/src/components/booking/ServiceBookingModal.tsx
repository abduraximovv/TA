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
      <Button
        className="px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20"
        onClick={handleOpen}
      >
        Request Booking
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Book Experience">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catalog / Options</label>
            <Select 
              value={catalogOption} 
              onChange={(e) => setCatalogOption(e.target.value)}
              className="w-full"
            >
              {CATALOG_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input 
                type="date" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <Input 
                type="time" 
                required 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <Input 
              type="number" 
              min="1" 
              required 
              value={guestCount} 
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)} 
            />
          </div>
          <div className="pt-4 flex justify-between items-center border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="font-bold text-lg">
                {new Intl.NumberFormat("uz-UZ").format(totalPrice)} {currency}
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting || !date || !time}>
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </Button>
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
