import React from "react";
import Link from "next/link";
import { getServiceById, getReviewsForService } from "@repo/database";
import type { ReviewWithAuthor } from "@repo/database";
import { ServiceDetailClient } from "./ServiceDetailClient";

export const revalidate = 3600;

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [service, reviews] = await Promise.all([
    getServiceById(params.id),
    getReviewsForService(params.id).catch(() => [] as ReviewWithAuthor[]),
  ]);

  if (!service) {
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
          Service Not Found
        </h1>
        <p style={{ color: "rgba(10,35,32,0.5)", marginBottom: 24 }}>
          The experience you are looking for does not exist or has been removed.
        </p>
        <Link href="/service" className="btn-primary">
          Return to Experiences
        </Link>
      </div>
    );
  }

  return <ServiceDetailClient service={service} reviews={reviews} />;
}
