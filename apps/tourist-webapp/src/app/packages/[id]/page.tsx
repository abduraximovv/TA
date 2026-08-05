import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getItineraryById, getReviewsForItinerary } from "@repo/database";
import type { ReviewWithAuthor } from "@repo/database";
import { PackageDetailClient } from "./PackageDetailClient";

export const revalidate = 3600;

export default async function PackageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient(cookies());
  const [{ data: { user } }, itinerary, reviews] = await Promise.all([
    supabase.auth.getUser(),
    getItineraryById(params.id),
    getReviewsForItinerary(params.id).catch(() => [] as ReviewWithAuthor[]),
  ]);

  if (!itinerary) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-sand-50"
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#0A2320",
            marginBottom: 8,
          }}
        >
          Package Not Found
        </h1>
        <p style={{ color: "rgba(10,35,32,0.5)", marginBottom: 24 }}>
          This tour package does not exist or has been removed.
        </p>
        <Link href="/packages" className="btn-primary">
          Browse Packages
        </Link>
      </div>
    );
  }

  return <PackageDetailClient itinerary={itinerary} reviews={reviews} isLoggedIn={!!user} />;
}
