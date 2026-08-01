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
