"use client";

import React, { useState } from "react";
import { Button, Modal, Textarea, Toast } from "@repo/ui";
import { Star } from "lucide-react";
import { useAuth } from "@repo/auth";

interface ReviewModalProps {
  bookingId: string;
  serviceId?: string | null;
  itineraryId?: string | null;
  onSuccess: () => void;
}

export function ReviewModal({ bookingId, serviceId, itineraryId, onSuccess }: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("success");

  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setToastVariant("danger");
      setToastMessage("Please select a rating.");
      setToastVisible(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        booking_id: bookingId,
        service_id: serviceId || null,
        itinerary_id: itineraryId || null,
        rating,
        comment: comment.trim() || null
      };

      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": session ? `Bearer ${session.access_token}` : ""
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit review");
      }

      setOpen(false);
      setToastVariant("success");
      setToastMessage("Thank you for your review!");
      setToastVisible(true);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setToastVariant("danger");
      setToastMessage(err.message || "Failed to submit review.");
      setToastVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => setOpen(true)}
      >
        Leave a review
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Leave a Review">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">How was your experience?</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className="w-8 h-8"
                    style={{
                      fill: (hoverRating || rating) >= star ? "#C5A880" : "transparent",
                      color: (hoverRating || rating) >= star ? "#C5A880" : "#C4CAC9",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share details of your experience (optional)
            </label>
            <Textarea 
              placeholder="What did you like? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </Modal>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        variant={toastVariant}
      />
    </>
  );
}
