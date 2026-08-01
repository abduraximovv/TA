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

    let provider_id: string | null = null;
    if (body.service_id) {
      const { data: svc } = await supabase.from('services').select('provider_id').eq('id', body.service_id).single();
      provider_id = (svc as { provider_id: string | null } | null)?.provider_id ?? null;
    } else if (body.itinerary_id) {
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
