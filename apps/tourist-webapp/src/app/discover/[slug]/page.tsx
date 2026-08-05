import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getDestinationBySlug, getDestinationReviews } from "@repo/database";
import { DiscoverDetailClient } from "./DiscoverDetailClient";

export const revalidate = 3600;

export default async function DiscoverDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient(cookies());
  const [{ data: { user } }, destination] = await Promise.all([
    supabase.auth.getUser(),
    getDestinationBySlug(params.slug),
  ]);

  if (!destination) {
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
          Destination Not Found
        </h1>
        <p style={{ color: "rgba(10,35,32,0.5)", marginBottom: 24 }}>
          This destination guide does not exist or has been removed.
        </p>
        <Link href="/discover" className="btn-primary">
          Browse Destinations
        </Link>
      </div>
    );
  }

  const opinions = await getDestinationReviews(destination.id);

  return <DiscoverDetailClient destination={destination} opinions={opinions} isLoggedIn={!!user} />;
}
