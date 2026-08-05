import React from "react";
import { getAllExperiences } from "@repo/database";
import { ExperiencesClient } from "./ExperiencesClient";

export const metadata = {
  title: "Things to do in Uzbekistan",
  description: "Discover amazing experiences, attractions, and events in Uzbekistan.",
};

export const revalidate = 3600;

export default async function ExperiencesPage() {
  const experiences = await getAllExperiences();

  return <ExperiencesClient experiences={experiences} />;
}
