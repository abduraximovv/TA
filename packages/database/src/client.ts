import { createClient } from "@supabase/supabase-js";
import type { Database, LocationCategory, Location } from "./types";

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
      );
    }
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance!;
};

export const fetchLocationsInRadius = async (
  lat: number,
  lng: number,
  radiusMeters: number
): Promise<Location[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_locations_in_radius", {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
  } as any);

  if (error) {
    console.error("Error fetching locations:", error);
    throw new Error(error.message);
  }

  return data as Location[];
};

import type { Booking, BookingStatus, Itinerary, ItineraryItem, ItineraryStatus, Review, Notification, NotificationType } from "@repo/types";
import { Service } from "./types";

export const getAvailableServices = async (): Promise<Service[]> => {
  const supabase = getSupabase();
  const { data, error } = await (supabase as any).from('services').select('*').eq('is_available', true);
  if (error) throw new Error(error.message);
  return data as any as Service[];
};

export const getApprovedItineraries = async (): Promise<Itinerary[]> => {
  const supabase = getSupabase();
  const { data, error } = await (supabase as any).from('itineraries').select('*').neq('status', 'draft');
  if (error) throw new Error(error.message);
  return data as any as Itinerary[];
};

export type BookingInput = Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'provider_id'>;

export const createBooking = async (input: BookingInput): Promise<Booking> => {
  const supabase = getSupabase();
  let provider_id: string | null = null;
  if (input.service_id) {
    const { data: svc } = await (supabase as any).from('services').select('provider_id').eq('id', input.service_id).single();
    if (svc) provider_id = svc.provider_id as string;
  } else if (input.itinerary_id) {
    const { data: itin } = await (supabase as any).from('itineraries').select('agency_id').eq('id', input.itinerary_id).single();
    if (itin) provider_id = itin.agency_id as string;
  }

  const { data, error } = await (supabase as any).from('bookings').insert({
    ...input,
    provider_id,
  }).select().single();

  if (error) throw new Error(error.message);
  return data as any as Booking;
};

export const getMyBookings = async (userId: string, role: 'tourist' | 'provider' | 'agency'): Promise<Booking[]> => {
  const supabase = getSupabase();
  let query = (supabase as any).from('bookings').select('*');
  if (role === 'tourist') {
    query = query.eq('tourist_id', userId);
  } else {
    query = query.eq('provider_id', userId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as any as Booking[];
};

export const getReviewsForService = async (serviceId: string): Promise<Review[]> => {
  const supabase = getSupabase();
  const { data, error } = await (supabase as any).from('reviews').select('*').eq('service_id', serviceId);
  if (error) throw new Error(error.message);
  return data as any as Review[];
};

export const getReviewsForItinerary = async (itineraryId: string): Promise<Review[]> => {
  const supabase = getSupabase();
  const { data, error } = await (supabase as any).from('reviews').select('*').eq('itinerary_id', itineraryId);
  if (error) throw new Error(error.message);
  return data as any as Review[];
};

export type ReviewInput = Omit<Review, 'id' | 'created_at' | 'response' | 'response_at'>;

export const createReview = async (input: ReviewInput): Promise<Review> => {
  const supabase = getSupabase();
  const { data, error } = await (supabase as any).from('reviews').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as any as Review;
};

export const subscribeToBookingUpdates = (userId: string, role: 'tourist' | 'provider' | 'agency', onChange: (payload: any) => void) => {
  const supabase = getSupabase();
  const filterColumn = role === 'tourist' ? 'tourist_id' : 'provider_id';
  
  return supabase
    .channel('public:bookings')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings', filter: `${filterColumn}=eq.${userId}` },
      onChange
    )
    .subscribe();
};

export const uploadServicePhoto = async (file: File, ownerId: string): Promise<string> => {
  const supabase = getSupabase();
  const fileExt = file.name.split('.').pop();
  const fileName = `${ownerId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('service-photos')
    .upload(fileName, file);
    
  if (error) throw new Error(error.message);
  
  const { data: urlData } = supabase.storage.from('service-photos').getPublicUrl(fileName);
  return urlData.publicUrl;
};
