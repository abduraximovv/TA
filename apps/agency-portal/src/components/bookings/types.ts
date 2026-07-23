import type { Booking } from "@repo/types";

export interface EnrichedBooking extends Booking {
  itemTitle: string;
  touristName: string;
  touristEmail: string | null;
}
