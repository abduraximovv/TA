"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Navigation } from "lucide-react";
import { cn } from "../utils";
import { Button } from "./Button";
import type { LocationCategory } from "@repo/database";

interface MapInfoCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | null;
  category: LocationCategory | string;
  distance?: number;
  onGetDirections: () => void;
}

export function MapInfoCard({
  open,
  onOpenChange,
  title,
  description,
  category,
  distance,
  onGetDirections,
}: MapInfoCardProps) {
  // Format distance
  const formattedDistance = distance 
    ? distance > 1000 
      ? `${(distance / 1000).toFixed(1)} km` 
      : `${Math.round(distance)} m` 
    : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-white rounded-t-xl shadow-lg border-t border-gray-100", // xl radius as per guidelines
            "p-6 max-h-[80vh] overflow-y-auto",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
          )}
        >
          {/* Handle bar for bottom sheet look */}
          <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full mb-6" />

          <div className="flex justify-between items-start mb-4">
            <div>
              <Dialog.Title className="text-xl font-semibold text-gray-900 font-sans tracking-tight">
                {title}
              </Dialog.Title>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-[#006B70] capitalize">
                  {category}
                </span>
                {formattedDistance && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{formattedDistance} away</span>
                  </>
                )}
              </div>
            </div>
            <Dialog.Close className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-gray-600 mb-6 text-base leading-relaxed">
            {description || "No description available for this location."}
          </Dialog.Description>

          <div className="pt-2 border-t border-gray-100 mt-2">
            <Button 
              className="w-full flex items-center justify-center gap-2 text-base py-6" // Slightly taller for mobile tap target
              onClick={onGetDirections}
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
