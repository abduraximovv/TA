"use client";

import React, { useState } from "react";
import { Button, Input, Modal, Textarea, Toast } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@repo/auth";

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
      <Button
        className="px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20"
        onClick={handleOpen}
      >
        Book Now
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} title="Book Package">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input 
                type="date" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
              <Input 
                type="number" 
                min="1" 
                max="20"
                required 
                value={guestCount} 
                onChange={(e) => handleGuestCountChange(parseInt(e.target.value) || 1)} 
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Passenger Details</h3>
            <div className="space-y-3">
              {manifest.map((name, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Passenger {i + 1} Name</label>
                  <Input 
                    type="text" 
                    placeholder={`e.g. John Doe`}
                    required 
                    value={name} 
                    onChange={(e) => handleManifestChange(i, e.target.value)} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <Input 
                type="text" 
                placeholder="Hotel name or address in the starting city"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preferences</label>
              <Textarea 
                placeholder="Vegetarian, Halal, Kosher, allergies, etc."
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 mt-6 flex justify-between items-center border-t border-gray-100 sticky bottom-0 bg-white pb-2">
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="font-bold text-lg text-primary">
                {new Intl.NumberFormat("uz-UZ").format(price * guestCount)} {currency}
              </p>
            </div>
            <Button type="submit" disabled={isSubmitting || !date}>
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
