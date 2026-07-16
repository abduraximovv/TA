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
    };
  };
}
