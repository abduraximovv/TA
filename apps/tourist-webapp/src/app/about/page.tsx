import React from "react";
import { AboutClient } from "./AboutClient";
import { getSiteStats } from "@repo/database";

export const metadata = {
  title: "About Us | Safron",
  description: "Learn about our mission to bridge the digital divide for rural artisans and local guides in Uzbekistan.",
};

export const revalidate = 3600;

export default async function AboutPage() {
  const stats = await getSiteStats();
  return <AboutClient stats={stats} />;
}
