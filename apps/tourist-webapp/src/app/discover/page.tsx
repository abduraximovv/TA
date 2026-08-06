import React, { Suspense } from "react";
import { getAllDestinations } from "@repo/database";
import { DiscoverClient } from "./DiscoverClient";

export const revalidate = 3600;

export default async function DiscoverPage() {
  const destinations = await getAllDestinations();

  // DiscoverClient reads ?q= via useSearchParams (for the mobile header's quick search),
  // which Next.js requires to sit under a Suspense boundary.
  return (
    <Suspense>
      <DiscoverClient destinations={destinations} />
    </Suspense>
  );
}
