import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Request-scoped client authenticated as the calling user via the bearer token, so RLS
    // (tourist_id = auth.uid()) is actually enforced. Neither the shared getSupabase() singleton
    // (anon key, no session on the server) nor the cookie-based SSR client (SessionProvider sets
    // plain sb-access-token cookies, not the @supabase/ssr chunked format) carry this token into
    // subsequent REST calls, which is why bookings were silently rejected by RLS before this fix.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // service_intents: a batched cart of service bookings from SafronCoordinator's "Book All"
    // (supabase/migrations/20260817000000_slot_engine_and_departures.sql). Unlike the single-item
    // create_booking_with_capacity_check branch below, process_multi_item_booking treats the whole
    // array as one atomic transaction -- either every intent's capacity check passes and every
    // booking row is inserted, or none are (a RAISE EXCEPTION anywhere rolls back the lot). Each
    // intent still gets tagged with its index in the RPC's own error messages, but this route has
    // no way to report "3 of 5 succeeded" since that's not a state the RPC can produce.
    if (Array.isArray(body.service_intents)) {
      const intents = body.service_intents.map((si: any) => ({
        kind: 'service',
        service_id: si.service_id,
        booking_date: si.booking_date,
        guest_count: si.guest_count ?? 1,
        special_requests: si.special_requests ?? null,
        passenger_manifest: si.passenger_manifest ?? null,
        dietary_preferences: si.dietary_preferences ?? null,
        pickup_location: si.pickup_location ?? null,
        total_price: si.total_price ?? null,
        currency: si.currency ?? 'UZS',
      }));

      const { data: bookings, error } = await supabase.rpc('process_multi_item_booking', {
        p_intents: intents,
      });

      if (error) {
        // P0001 = a capacity/blocked-date/draft-package rejection raised inside the function --
        // surface as 409 Conflict, same convention as the single-item branch below. Everything
        // else (malformed intents, not authenticated, unknown service) is a 400.
        const status = error.code === 'P0001' ? 409 : 400;
        return NextResponse.json({ error: error.message || 'Failed to create bookings' }, { status });
      }

      return NextResponse.json(bookings, { status: 201 });
    }

    // service_id bookings go through the capacity-checked RPC (supabase/migrations/
    // 20260816000000_service_inventory.sql) -- it locks any service_inventory rows for that
    // service/date, rejects the booking if the date is blocked or full, and only then inserts
    // into bookings, all inside one transaction so two concurrent bookings for the last open
    // slot can't both succeed. itinerary_id bookings have no inventory concept and keep using
    // the plain insert below.
    if (body.service_id) {
      const { data: booking, error } = await supabase.rpc('create_booking_with_capacity_check', {
        p_service_id: body.service_id,
        p_booking_date: body.booking_date,
        p_guest_count: body.guest_count ?? 1,
        p_special_requests: body.special_requests ?? null,
        p_passenger_manifest: body.passenger_manifest ?? null,
        p_dietary_preferences: body.dietary_preferences ?? null,
        p_pickup_location: body.pickup_location ?? null,
        p_total_price: body.total_price ?? null,
        p_currency: body.currency ?? 'UZS',
      });

      if (error) {
        // P0001 is the capacity/blocked-date rejection raised inside the function -- surface it
        // as 409 Conflict so the client can tell "someone else took the last slot" apart from a
        // generic failure. Every other error (bad input, not authenticated, service not found)
        // is a 400, matching this route's existing error-handling shape.
        const status = error.code === 'P0001' ? 409 : 400;
        return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status });
      }

      return NextResponse.json(booking, { status: 201 });
    }

    let provider_id: string | null = null;
    if (body.itinerary_id) {
      const { data: itin } = await supabase.from('itineraries').select('agency_id').eq('id', body.itinerary_id).single();
      provider_id = (itin as { agency_id: string | null } | null)?.agency_id ?? null;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({ ...body, tourist_id: user.id, provider_id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 400 });
  }
}
