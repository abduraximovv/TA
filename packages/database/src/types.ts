import type {
  Booking,
  BookingStatus,
  Itinerary,
  ItineraryItem,
  ItineraryStatus,
  Notification,
  NotificationType,
  Review,
} from "@repo/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LocationCategory =
  | 'sos'
  | 'toilet'
  | 'cultural'
  | 'festival'
  | 'pharmacy'
  | 'atm'
  | 'wifi'
  | 'water'
  | 'food'
  | 'stay';

export type UserRole = 'tourist' | 'provider' | 'agency' | 'admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Location {
  id: string;
  name: string;
  description: string | null;
  category: LocationCategory;
  lat: number;
  lng: number;
  distance_meters?: number;
}

// Landing Page types
export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  body: string | null;
  region: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  gallery_images: string[];
  latitude: number | null;
  longitude: number | null;
  service_count: number;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationReview {
  id: string;
  destination_id: string;
  tourist_id: string;
  rating: number | null;
  comment: string;
  created_at: string;
}

export interface Service {
  id: string;
  provider_id: string | null;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  image_url: string | null;
  duration_minutes: number | null;
  max_guests: number | null;
  is_available: boolean;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Format duration_minutes into a human-readable string */
export function formatDuration(minutes: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${h} hr${h > 1 ? "s" : ""} ${m} min`;
}

export interface Event {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  location: string | null;
  destination_id: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  event_type: string;
  is_featured: boolean;
  ticket_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_verifications: {
        Row: {
          id: string;
          user_id: string | null;
          role: 'provider' | 'agency';
          business_name: string;
          email: string;
          phone: string | null;
          status: VerificationStatus;
          documents_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          role: 'provider' | 'agency';
          business_name: string;
          email: string;
          phone?: string | null;
          status?: VerificationStatus;
          documents_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          role?: 'provider' | 'agency';
          business_name?: string;
          email?: string;
          phone?: string | null;
          status?: VerificationStatus;
          documents_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: LocationCategory;
          coordinates: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: LocationCategory;
          coordinates: unknown;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: LocationCategory;
          coordinates?: unknown;
          created_at?: string;
          updated_at?: string;
        };
      };
      destinations: {
        Row: Destination;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          body?: string | null;
          region?: string | null;
          image_url?: string | null;
          hero_image_url?: string | null;
          gallery_images?: string[];
          latitude?: number | null;
          longitude?: number | null;
          is_featured?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          body?: string | null;
          region?: string | null;
          image_url?: string | null;
          hero_image_url?: string | null;
          gallery_images?: string[];
          latitude?: number | null;
          longitude?: number | null;
          is_featured?: boolean;
          display_order?: number;
        };
      };
      destination_reviews: {
        Row: DestinationReview;
        Insert: {
          id?: string;
          destination_id: string;
          tourist_id: string;
          rating?: number | null;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          destination_id?: string;
          tourist_id?: string;
          rating?: number | null;
          comment?: string;
          created_at?: string;
        };
      };
      services: {
        Row: Service;
        Insert: {
          id?: string;
          provider_id?: string | null;
          title: string;
          description?: string | null;
          category: string;
          price?: number;
          currency?: string;
          image_url?: string | null;
          avg_rating?: number;
          reviews_count?: number;
          is_available?: boolean;
          duration_minutes?: number | null;
          max_guests?: number | null;
          city?: string | null;
          region?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string | null;
          title?: string;
          description?: string | null;
          category?: string;
          price?: number;
          currency?: string;
          image_url?: string | null;
          avg_rating?: number;
          reviews_count?: number;
          is_available?: boolean;
          duration_minutes?: number | null;
          max_guests?: number | null;
          city?: string | null;
          region?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          rating_avg?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: Event;
      };
      itineraries: {
        Row: Itinerary;
        Insert: {
          id?: string;
          agency_id?: string | null;
          tourist_id?: string | null;
          title: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: ItineraryStatus;
          total_price?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          tourist_id?: string | null;
          title?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: ItineraryStatus;
          total_price?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      itinerary_items: {
        Row: ItineraryItem;
        Insert: {
          id?: string;
          itinerary_id?: string | null;
          service_id?: string | null;
          title?: string | null;
          description?: string | null;
          location_name?: string | null;
          scheduled_time?: string | null;
          day_number?: number | null;
          price?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          itinerary_id?: string | null;
          service_id?: string | null;
          title?: string | null;
          description?: string | null;
          location_name?: string | null;
          scheduled_time?: string | null;
          day_number?: number | null;
          price?: number | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      bookings: {
        Row: Booking;
        Insert: {
          id?: string;
          tourist_id: string;
          service_id?: string | null;
          itinerary_id?: string | null;
          provider_id?: string | null;
          status?: BookingStatus;
          booking_date: string;
          guest_count?: number;
          special_requests?: string | null;
          passenger_manifest?: Json | null;
          dietary_preferences?: string | null;
          pickup_location?: string | null;
          total_price?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tourist_id?: string;
          service_id?: string | null;
          itinerary_id?: string | null;
          provider_id?: string | null;
          status?: BookingStatus;
          booking_date?: string;
          guest_count?: number;
          special_requests?: string | null;
          passenger_manifest?: Json | null;
          dietary_preferences?: string | null;
          pickup_location?: string | null;
          total_price?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_status_history: {
        Row: {
          id: string;
          booking_id: string;
          old_status: BookingStatus | null;
          new_status: BookingStatus;
          changed_by: string | null;
          notes: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          old_status?: BookingStatus | null;
          new_status: BookingStatus;
          changed_by?: string | null;
          notes?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          old_status?: BookingStatus | null;
          new_status?: BookingStatus;
          changed_by?: string | null;
          notes?: string | null;
          changed_at?: string;
        };
      };
      reviews: {
        Row: Review;
        Insert: {
          id?: string;
          tourist_id: string;
          service_id?: string | null;
          itinerary_id?: string | null;
          booking_id: string;
          rating: number;
          comment?: string | null;
          response?: string | null;
          response_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tourist_id?: string;
          service_id?: string | null;
          itinerary_id?: string | null;
          booking_id?: string;
          rating?: number;
          comment?: string | null;
          response?: string | null;
          response_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: Notification;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          type: NotificationType;
          action_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          type?: NotificationType;
          action_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, unknown>;
    Functions: { 
      get_locations_in_radius: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_meters: number;
        };
        Returns: {
          id: string;
          name: string;
          description: string | null;
          category: LocationCategory;
          lat: number;
          lng: number;
          distance_meters: number;
        }[];
      };
    };
    Enums: {
      location_category: LocationCategory;
      user_role: UserRole;
      verification_status: VerificationStatus;
    };
  };
}
