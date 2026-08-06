import React from "react";
import { getAllEvents } from "@repo/database";
import { EventsClient } from "./EventsClient";

export const revalidate = 3600;

export default async function EventsPage() {
  const events = await getAllEvents();
  return <EventsClient events={events} />;
}
