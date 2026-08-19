import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { Database, LocationCategory, Location } from "./types";

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Plain supabase-js client -- session lives in localStorage, not cookies. Fine (and cheaper)
// for the public/anonymous reads in this file (destinations, services, events, etc.), which
// never need the server to see who's signed in. Do NOT use this for anything a server-side
// route needs to authenticate -- see getSupabaseBrowserClient below for that.
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

let supabaseBrowserInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// All four apps (tourist-webapp, provider-app, agency-portal, admin-portal) share this same
// Supabase project AND, in local dev, the same `localhost` host -- only the port differs. HTTP
// cookies are scoped by (domain, path), never by port, so without an app-specific cookie name
// every app would write/read the exact same default `sb-<project-ref>-auth-token` cookie and
// silently authenticate as whichever app's session happened to be sitting in the shared cookie
// jar (this is exactly the cross-app session leak: signing into admin-portal made tourist-webapp
// appear signed in too). Each app sets its own NEXT_PUBLIC_APP_ROLE in its .env so its cookie
// name is namespaced and invisible to the other three, even if a future prod deployment ever puts
// them on a shared parent domain.
// Exported so an app's own server-side @supabase/ssr client (createServerClient in Next.js
// middleware/route handlers) can compute the IDENTICAL cookie name this browser client uses --
// the two MUST match exactly or the server will never see the session the browser just wrote.
export function appScopedCookieName(): string {
  const role = process.env.NEXT_PUBLIC_APP_ROLE;
  if (!role) {
    console.warn(
      "NEXT_PUBLIC_APP_ROLE is not set -- falling back to the default @supabase/ssr cookie name, " +
      "which is SHARED across all four apps on the same host. Set NEXT_PUBLIC_APP_ROLE in this app's .env."
    );
    return `sb-auth-token`;
  }
  return `sb-${role}-auth-token`;
}

// Session-aware browser client for sign-in/sign-up/sign-out (see packages/auth's
// SessionProvider). Unlike getSupabase() above, this writes the session into cookies in the
// exact format @supabase/ssr's server-side createServerClient expects -- required for any
// Next.js API route or Server Component to recognize a signed-in tourist via
// supabase.auth.getUser(). Browser-only: relies on `document`, never call this during SSR.
export const getSupabaseBrowserClient = () => {
  if (!supabaseBrowserInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
      );
    }
    supabaseBrowserInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookieOptions: { name: appScopedCookieName() },
    });
  }
  return supabaseBrowserInstance!;
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
import type { Service } from "./types";

// ─── Services ───────────────────────────────────────────────

export const getAvailableServices = async (limit = 20): Promise<Service[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Service[];
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Error fetching service:", error);
    return null;
  }
  return data as unknown as Service;
};

// ─── Itineraries ────────────────────────────────────────────

export interface ItineraryWithMeta extends Itinerary {
  agency_name: string | null;
  item_count: number;
  image_url: string | null;
  /** Distinct cities covered by this itinerary's services, derived from real data (not hardcoded). */
  cities: string[];
}

export const getApprovedItineraries = async (): Promise<ItineraryWithMeta[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("itineraries")
    .select("*, itinerary_items(id, sort_order, services(image_url, city))")
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as (Itinerary & {
    itinerary_items: { id: string; sort_order: number; services: { image_url: string | null; city: string | null } | null }[];
  })[];

  // Batch-fetch agency names from user_profiles
  const agencyIds = [...new Set(rows.map(r => r.agency_id).filter(Boolean))] as string[];
  let agencyMap: Record<string, string> = {};
  if (agencyIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, full_name")
      .in("id", agencyIds);
    if (profiles) {
      agencyMap = Object.fromEntries(
        (profiles as { id: string; full_name: string | null }[]).map(p => [p.id, p.full_name ?? "Agency"])
      );
    }
  }

  return rows.map(r => ({
    id: r.id,
    agency_id: r.agency_id,
    tourist_id: r.tourist_id,
    title: r.title,
    description: r.description,
    start_date: r.start_date,
    end_date: r.end_date,
    status: r.status,
    total_price: r.total_price,
    currency: r.currency,
    created_at: r.created_at,
    updated_at: r.updated_at,
    agency_name: r.agency_id ? (agencyMap[r.agency_id] ?? null) : null,
    item_count: r.itinerary_items?.length ?? 0,
    image_url:
      [...(r.itinerary_items ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .find(item => item.services?.image_url)?.services?.image_url ?? null,
    cities: Array.from(
      new Set((r.itinerary_items ?? []).map(item => item.services?.city).filter((c): c is string => !!c))
    ).sort(),
  }));
};

export interface ItineraryDetail extends Itinerary {
  agency_name: string | null;
  items: (ItineraryItem & { service_title: string | null; service_image: string | null })[];
}

export const getItineraryById = async (id: string): Promise<ItineraryDetail | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("itineraries")
    .select("*, itinerary_items(*, services(title, image_url))")
    .eq("id", id)
    .single();
  if (error || !data) return null;

  const row = data as unknown as Itinerary & {
    itinerary_items: (ItineraryItem & { services: { title: string; image_url: string | null } | null })[];
  };

  // Fetch agency name
  let agency_name: string | null = null;
  if (row.agency_id) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", row.agency_id)
      .single();
    agency_name = (profile as { full_name: string | null } | null)?.full_name ?? null;
  }

  const result: ItineraryDetail = {
    id: row.id,
    agency_id: row.agency_id,
    tourist_id: row.tourist_id,
    title: row.title,
    description: row.description,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    total_price: row.total_price,
    currency: row.currency,
    created_at: row.created_at,
    updated_at: row.updated_at,
    agency_name,
    items: (row.itinerary_items ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        id: item.id,
        itinerary_id: item.itinerary_id,
        service_id: item.service_id,
        title: item.title,
        description: item.description,
        location_name: item.location_name,
        scheduled_time: item.scheduled_time,
        day_number: item.day_number,
        price: item.price,
        sort_order: item.sort_order,
        created_at: item.created_at,
        service_title: item.services?.title ?? null,
        service_image: item.services?.image_url ?? null,
      })),
  };

  return result;
};

// ─── Reviews ────────────────────────────────────────────────

export interface ReviewWithAuthor extends Review {
  author_name: string | null;
}

export const getReviewsForService = async (serviceId: string): Promise<ReviewWithAuthor[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("service_id", serviceId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const reviews = (data ?? []) as unknown as Review[];
  if (reviews.length === 0) return [];

  // Batch-fetch author names
  const touristIds = [...new Set(reviews.map(r => r.tourist_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", touristIds);
  const nameMap: Record<string, string> = {};
  if (profiles) {
    (profiles as { id: string; full_name: string | null }[]).forEach(p => {
      nameMap[p.id] = p.full_name ?? "Tourist";
    });
  }

  return reviews.map(r => ({
    ...r,
    author_name: nameMap[r.tourist_id] ?? null,
  }));
};

export const getReviewsForItinerary = async (itineraryId: string): Promise<ReviewWithAuthor[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("itinerary_id", itineraryId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const reviews = (data ?? []) as unknown as Review[];
  if (reviews.length === 0) return [];

  const touristIds = [...new Set(reviews.map(r => r.tourist_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", touristIds);
  const nameMap: Record<string, string> = {};
  if (profiles) {
    (profiles as { id: string; full_name: string | null }[]).forEach(p => {
      nameMap[p.id] = p.full_name ?? "Tourist";
    });
  }

  return reviews.map(r => ({
    ...r,
    author_name: nameMap[r.tourist_id] ?? null,
  }));
};

export const getMyReviews = async (touristId: string): Promise<Review[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("tourist_id", touristId);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Review[];
};

// ─── Bookings ───────────────────────────────────────────────

export type BookingInput = Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'provider_id'>;

export const createBooking = async (input: BookingInput): Promise<Booking> => {
  const supabase = getSupabase();
  let provider_id: string | null = null;
  if (input.service_id) {
    const { data: svc } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", input.service_id)
      .single();
    if (svc) provider_id = (svc as { provider_id: string | null }).provider_id;
  } else if (input.itinerary_id) {
    const { data: itin } = await supabase
      .from("itineraries")
      .select("agency_id")
      .eq("id", input.itinerary_id)
      .single();
    if (itin) provider_id = (itin as { agency_id: string | null }).agency_id;
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...input, provider_id } as any)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Booking;
};

export const getMyBookings = async (userId: string, role: 'tourist' | 'provider' | 'agency'): Promise<Booking[]> => {
  // bookings' RLS ("Users can view own bookings") requires auth.uid() = tourist_id/provider_id.
  // getSupabase() never carries a session (see its own comment above) -- auth.uid() would be
  // NULL and RLS would silently filter every row, same root cause as the realtime-subscription
  // bug fixed earlier for subscribeToBookingUpdates. Needs the cookie-authenticated client.
  const supabase = getSupabaseBrowserClient();
  const filterColumn = role === 'tourist' ? 'tourist_id' : 'provider_id';
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq(filterColumn, userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Booking[];
};

// ─── Review mutations ───────────────────────────────────────

export type ReviewInput = Omit<Review, 'id' | 'created_at' | 'response' | 'response_at'>;

export const createReview = async (input: ReviewInput): Promise<Review> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .insert(input as any)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Review;
};

// ─── Realtime ───────────────────────────────────────────────

export const getReviewsForServices = async (serviceIds: string[]): Promise<Review[]> => {
  if (!serviceIds.length) return [];
  const supabase = getSupabase();
  const { data, error } = await (supabase as any).from('reviews').select('*').in('service_id', serviceIds);
  if (error) throw new Error(error.message);
  return data as any as Review[];
};

export const getReviewsForItineraries = async (itineraryIds: string[]): Promise<Review[]> => {
  if (!itineraryIds.length) return [];
  const supabase = getSupabase();
  const { data, error } = await (supabase as any).from('reviews').select('*').in('itinerary_id', itineraryIds);
  if (error) throw new Error(error.message);
  return data as any as Review[];
};

export const updateReviewResponse = async (reviewId: string, response: string): Promise<Review> => {
  // Gated by "Providers/Agencies can read/write reviews for their bookings" (auth.uid()-based) --
  // getSupabase() carries no session, so this UPDATE would be silently rejected by RLS for every
  // real provider/agency. Same root cause as getMyBookings above.
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await (supabase as any).from('reviews').update({
    response,
    response_at: new Date().toISOString()
  }).eq('id', reviewId).select().single();
  if (error) throw new Error(error.message);
  return data as any as Review;
};

export const subscribeToBookingUpdates = (
userId: string, role: 'tourist' | 'provider' | 'agency', onChange: (payload: any) => void) => {
  // Must be the same authenticated client SessionProvider manages, not the anonymous
  // getSupabase() singleton -- bookings' RLS SELECT policy is `auth.uid() = tourist_id OR
  // auth.uid() = provider_id`, and Realtime's postgres_changes enforces that same RLS using
  // the *subscribing connection's* JWT. getSupabase() never signs in (it's a separate client
  // instance nothing ever authenticates), so auth.uid() resolved to null on that socket and
  // every event was silently filtered out before delivery -- no error, the subscription just
  // never received anything, which is why this looked like it was "implemented but not showing."
  const supabase = getSupabaseBrowserClient();
  const filterColumn = role === 'tourist' ? 'tourist_id' : 'provider_id';

  // supabase-js reuses an existing channel object when the topic string already exists
  // (RealtimeClient.channel()), so a shared literal topic like 'public:bookings' collides
  // whenever two subscribers are mounted at once (e.g. a layout-level listener + a page-level
  // one) -- the second .on() call lands on an already-subscribed channel and throws. Suffixing
  // with a random id keeps every subscription on its own channel.
  const uniqueSuffix = Math.random().toString(36).slice(2);

  return supabase
    .channel(`public:bookings:${role}:${userId}:${uniqueSuffix}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings', filter: `${filterColumn}=eq.${userId}` },
      onChange
    )
    .subscribe();
};

// ─── Storage ────────────────────────────────────────────────

export const uploadServicePhoto = async (file: File, ownerId: string): Promise<string> => {
  const supabase = getSupabase();
  const fileExt = file.name.split('.').pop();
  const fileName = `${ownerId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('service-photos')
    .upload(fileName, file);
  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from('service-photos').getPublicUrl(fileName);
  return urlData.publicUrl;
};

