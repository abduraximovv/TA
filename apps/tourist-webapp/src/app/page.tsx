import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { LandingClient } from "@/components/landing/LandingClient";

// 1 hour cache validation for high performance
export const revalidate = 3600;

export default async function LandingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // Fetch only the top 3 services for the landing page
  const { data: services, error } = await supabase
    .from("services")
    .select("id, title, price, image_url, avg_rating")
    .order("avg_rating", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching landing page services:", error);
  }

  return <LandingClient initialServices={services || []} />;
}
