"use client";

import React, { useRef, useState } from "react";
import { Modal } from "@repo/ui";
import { PackageBookingWidget } from "./PackageBookingWidget";

interface PackageBookingModalProps {
  packageId: string;
}

const AUTO_CLOSE_DELAY_MS = 1800;

export function PackageBookingModal({ packageId }: PackageBookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(open);
  };

  const handleBookingSuccess = () => {
    // Leaves the modal open just long enough for the widget's own success toast to be seen
    // before the dialog unmounts it -- Radix Dialog doesn't keep closed content mounted.
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), AUTO_CLOSE_DELAY_MS);
  };

  return (
    <>
      {/* bottom-[104px] on mobile clears the global BottomNav's floating pill (h-[60px] + mb-4 +
          safe-area inset); BottomNav is md:hidden, so desktop reverts to flush bottom-0. */}
      <div className="fixed bottom-[104px] md:bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-40 flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full max-w-md h-14 rounded-full bg-[#0A2320] text-white font-bold text-[15px] tracking-wide hover:bg-black transition-colors shadow-lg"
        >
          Book Now
        </button>
      </div>

      <Modal open={isOpen} onOpenChange={handleOpenChange} title="Book This Tour">
        <PackageBookingWidget packageId={packageId} onBookingSuccess={handleBookingSuccess} />
      </Modal>
    </>
  );
}
