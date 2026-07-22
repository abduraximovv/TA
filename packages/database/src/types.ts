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
  | 'water';

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
          coordinates: unknown; // geography(Point, 4326)
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
      services: {
        Row: {
          id: string;
          provider_id: string | null;
          title: string;
          description: string | null;
          category: string;
          price: number;
          currency: string;
          image_url: string | null;
          avg_rating: number;
          reviews_count: number;
          created_at: string;
          updated_at: string;
        };
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
