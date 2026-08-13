export interface UserProfile {
  id: string;
  role: "tourist" | "provider" | "agency" | "admin";
  email: string;
  fullName: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export type ItineraryStatus = 'draft' | 'active' | 'completed';
export type NotificationType = 'booking_request' | 'booking_accepted' | 'booking_declined' | 'review_received' | 'system';

export interface Itinerary {
  id: string;
  agency_id: string | null;
  /** Set when a tourist self-plans a trip (e.g. via the AI itinerary generator) rather than an
   *  agency curating one for them -- mutually exclusive with agency_id in practice. */
  tourist_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ItineraryStatus;
  total_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryItem {
  id: string;
  itinerary_id: string | null;
  service_id: string | null;
  title: string | null;
  /** Free-text description -- populated for AI-generated activities, null for agency items that
   *  just reference a service_id (the service listing already has its own description). */
  description: string | null;
  location_name: string | null;
  /** Time-of-day string, e.g. "09:00" -- matches how the AI generator emits it. */
  scheduled_time: string | null;
  /** Which day of a multi-day self-planned trip this activity belongs to. */
  day_number: number | null;
  price: number | null;
  sort_order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  tourist_id: string;
  service_id: string | null;
  itinerary_id: string | null;
  provider_id: string | null;
  status: BookingStatus;
  booking_date: string;
  guest_count: number;
  special_requests: string | null;
  passenger_manifest: Record<string, unknown> | null;
  dietary_preferences: string | null;
  pickup_location: string | null;
  total_price: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  tourist_id: string;
  service_id: string | null;
  itinerary_id: string | null;
  booking_id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  response_at: string | null;
  created_at: string;
}

/**
 * Lean, AI-facing projection of a `services` row -- deliberately not the full `Service` shape
 * from packages/database (which the DB itself doesn't fully match anymore either -- e.g. it's
 * missing is_rural_provider/provider_name, both present on the live table). Used by
 * GET /api/v1/ai/search-services, capped to 5 results so it's cheap to feed into a Kimi prompt.
 */
export interface AIServiceSearchResult {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  region: string | null;
  city: string | null;
  /** Drives the platform's "Hidden Uzbekistan" decentralization mission -- see PRD.md §2. */
  is_rural_provider: boolean;
  provider_name: string | null;
  rating_avg: number;
  rating_count: number;
  duration_minutes: number | null;
  max_guests: number | null;
  image_url: string | null;
}

export interface PlanTripMessage {
  role: "user" | "assistant";
  content: string;
}

/** Response shape for POST /api/v1/ai/plan-trip -- recommended_services is a subset of the
 *  actual rows returned by the search-services call made mid-conversation (never model-invented;
 *  the route filters by ID against the real result set, then maps back to full rows, so the
 *  Compass can render cards without a second round-trip). Empty when the tourist hasn't given
 *  the coordinator enough to search on yet. travel_date/guest_count are best-effort extractions
 *  from the conversation (server-validated; travel_date is null unless it's a real YYYY-MM-DD),
 *  used to pre-fill the one-click booking flow -- the Compass still asks the tourist to fill
 *  in a date if the conversation never gave one. */
export interface PlanTripResponse {
  reply_text: string;
  recommended_services: AIServiceSearchResult[];
  travel_date: string | null;
  guest_count: number;
}

export interface ItinerarySuggestRequest {
  days: number;
  budget_usd: number;
  interests: string[];
  start_date: string;
}

export interface GeneratedActivity {
  time: string;
  title: string;
  description: string;
  location_name: string;
  estimated_cost: number;
}

export interface GeneratedItineraryDay {
  day_number: number;
  theme: string;
  activities: GeneratedActivity[];
}

export interface ItinerarySuggestResponse {
  total_estimated_cost: number;
  days: GeneratedItineraryDay[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}
