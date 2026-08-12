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
