"use client";

import React, { useState } from "react";
import { Button, Input, Modal, Textarea, Toast } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@repo/auth";
import { ChevronRight } from "lucide-react";

export function PackageBookingModal({
  itineraryId,
  price,
  currency,
  isLoggedIn
}: {
  itineraryId: string;
  price: number;
  currency: string;
  isLoggedIn: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [manifest, setManifest] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("default");
  const router = useRouter();
  const { user, session } = useAuth();

  const handleOpen = () => {
    if (!user && !isLoggedIn) {
      router.push(`/auth/login?next=/packages/${itineraryId}`);
      return;
    }
    setIsOpen(true);
  };

  const handleGuestCountChange = (val: number) => {
    setGuestCount(val);
    const newManifest = [...manifest];
    if (val > newManifest.length) {
      while (newManifest.length < val) newManifest.push("");
    } else if (val < newManifest.length) {
      newManifest.length = val;
    }
    setManifest(newManifest);
  };

  const handleManifestChange = (index: number, val: string) => {
    const newManifest = [...manifest];
    newManifest[index] = val;
    setManifest(newManifest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    // Check if manifest is completely filled
    if (manifest.some(name => !name.trim())) {
      setToastVariant("danger");
      setToastMessage("Please fill in all passenger names.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        service_id: null,
        itinerary_id: itineraryId,
        status: "pending",
        booking_date: new Date(date).toISOString(),
        guest_count: guestCount,
        special_requests: null,
        passenger_manifest: { passengers: manifest.map(name => ({ name })) },
        dietary_preferences: dietaryPreferences || null,
        pickup_location: pickupLocation || null,
        total_price: price * guestCount,
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

      setIsOpen(false);
      setToastVariant("success");
      setToastMessage("Your package booking has been submitted.");
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
      <div className="fixed bottom-0 left-0 right-0 bg-white p-6 pb-safe z-40 flex items-center justify-between">
        <div>
          <div className="text-[13px] text-gray-500 font-medium mb-0.5">Total Price</div>
          <div className="text-2xl font-bold text-[#0A2320]">
            ${Number(price || 0).toLocaleString("en-US").replace(/,/g, " ")}
          </div>
        </div>
        <button
          onClick={handleOpen}
          className="w-[60px] h-[60px] rounded-full bg-black text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <Modal open={isOpen} onOpenChange={setIsOpen} title="Book Package">
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Start Date</label>
              <Input 
                type="date" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Number of Guests</label>
              <Input 
                type="number" 
                min="1" 
                max="20"
                required 
                value={guestCount} 
                onChange={(e) => handleGuestCountChange(parseInt(e.target.value) || 1)} 
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-semibold text-gray-900 mb-3 ml-1">Passenger Details</h3>
            <div className="space-y-4">
              {manifest.map((name, i) => (
                <div key={i}>
                  <label className="block text-xs font-bold tracking-[0.1em] uppercase text-gray-500 mb-1.5 ml-1">Passenger {i + 1} Name</label>
                  <Input 
                    type="text" 
                    placeholder={`e.g. John Doe`}
                    required 
                    value={name} 
                    onChange={(e) => handleManifestChange(i, e.target.value)} 
                    className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Pickup Location</label>
              <Input 
                type="text" 
                placeholder="Hotel name or address in the starting city"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="h-14 rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5 ml-1">Dietary Preferences</label>
              <Textarea 
                placeholder="Vegetarian, Halal, Kosher, allergies, etc."
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
                className="rounded-2xl bg-gray-50/50 border-gray-200 focus:border-[#0A2320] focus:ring-[#0A2320]/20 p-4"
              />
            </div>
          </div>

          <div className="pt-6 mt-4 flex justify-between items-center border-t border-gray-100 sticky bottom-0 bg-white z-10 pb-2">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Price</p>
              <p className="font-bold text-2xl text-[#0A2320]">
                {(Number(price * guestCount) || 0).toLocaleString("en-US").replace(/,/g, " ")} {currency}
              </p>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || !date}
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
