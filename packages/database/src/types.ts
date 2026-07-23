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
  region: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  service_count: number;
  is_featured: boolean;
  display_order: number;
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
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: Event;
      };
      itineraries: any;
      itinerary_items: any;
      bookings: any;
      booking_status_history: any;
      reviews: any;
      notifications: any;
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
