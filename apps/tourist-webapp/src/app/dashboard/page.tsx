import React from "react";
import { getTopDestinations } from "@repo/database";
import { DashboardClient } from "./DashboardClient";

export const revalidate = 3600;

export default async function TouristDashboardPage() {
  const trendingDestinations = await getTopDestinations(2);
  return <DashboardClient trendingDestinations={trendingDestinations} />;
}
