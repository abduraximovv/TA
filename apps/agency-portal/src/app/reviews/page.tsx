"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@repo/auth";
import { getSupabase } from "@repo/database";
import type { Review } from "@repo/types";
import { Star, MessageSquareReply, CheckCircle2 } from "lucide-react";
import { LoadingPulse } from "@repo/ui";
import { updateReviewResponse, getReviewsForItineraries } from "@repo/database";

export default function ReviewsPage() {
  const { session } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        const supabase = getSupabase();
        // 1. Fetch agency's itineraries
        const { data: itineraries } = await (supabase as any)
          .from("itineraries")
          .select("id")
          .eq("agency_id", session.user.id);

        if (!itineraries || itineraries.length === 0) {
          setReviews([]);
          setLoading(false);
          return;
        }

        const itineraryIds = itineraries.map((i: any) => i.id);

        // 2. Fetch reviews for these itineraries
        const fetchedReviews = await getReviewsForItineraries(itineraryIds);
        setReviews(fetchedReviews);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const updatedReview = await updateReviewResponse(reviewId, replyText);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updatedReview : r)));
      setReplyingTo(null);
      setReplyText("");
    } catch (e) {
      console.error(e);
      alert("Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingPulse className="scale-150 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto" data-testid="reviews-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tourist Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Read and reply to feedback from your tourists.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageSquareReply className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No reviews yet</h3>
          <p className="text-gray-500">When tourists review your services, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {review.response && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Replied
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-6">{review.comment || "No comment provided."}</p>

              {review.response ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 relative">
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 transform rotate-45" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">Your Reply</p>
                  <p className="text-sm text-gray-700">{review.response}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.response_at!).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div>
                  {replyingTo === review.id ? (
                    <div className="mt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response..."
                        className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={isSubmitting || !replyText.trim()}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Reply"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <MessageSquareReply className="w-4 h-4" />
                      Reply to Review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
