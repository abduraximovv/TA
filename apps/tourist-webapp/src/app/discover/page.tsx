import React from "react";
import { getAllDestinations } from "@repo/database";
import { DiscoverClient } from "./DiscoverClient";

export const revalidate = 3600;

export default async function DiscoverPage() {
  const destinations = await getAllDestinations();

  return <DiscoverClient destinations={destinations} />;
}
