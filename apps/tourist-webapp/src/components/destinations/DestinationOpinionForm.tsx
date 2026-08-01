"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Toast } from "@repo/ui";
import { useAuth } from "@repo/auth";

export function DestinationOpinionForm({
  destinationId,
  destinationSlug,
  isLoggedIn,
}: {
  destinationId: string;
  destinationSlug: string;
  isLoggedIn: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"default" | "success" | "danger">("success");
  const router = useRouter();
  const { user, session } = useAuth();

  if (!user && !isLoggedIn) {
    return (
      <div className="p-5 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
        <button
          className="text-primary font-semibold underline"
          onClick={() => router.push(`/auth/login?next=/discover/${destinationSlug}`)}
        >
          Log in
        </button>{" "}
        to share your own experience visiting this destination.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/destination-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session ? `Bearer ${session.access_token}` : "",
        },
        body: JSON.stringify({ destination_id: destinationId, rating, comment }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit your opinion");
      }

      setComment("");
      setToastVariant("success");
      setToastMessage("Thanks for sharing your opinion!");
      router.refresh();
    } catch (err: any) {
      setToastVariant("danger");
      setToastMessage(err.message || "Failed to submit your opinion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Your rating</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-lg"
                style={{ color: n <= rating ? "#C5A880" : "#C4CAC9" }}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what it was like visiting..."
          className="w-full rounded-sm border border-gray-200 p-3 text-sm text-gray-700 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          required
        />
        <Button type="submit" disabled={isSubmitting || !comment.trim()}>
          {isSubmitting ? "Submitting..." : "Post opinion"}
        </Button>
      </form>
      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
        variant={toastVariant}
      />
    </>
  );
}
