import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Same fix as api/v1/bookings/route.ts: a request-scoped client carrying the caller's bearer
    // token, so RLS (tourist_id = auth.uid()) is actually enforced on the insert.
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

    if (!body.booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('status, tourist_id')
      .eq('id', body.booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if ((booking as { tourist_id: string }).tourist_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if ((booking as { status: string }).status !== 'completed') {
      return NextResponse.json({ error: 'Reviews can only be left on completed bookings' }, { status: 422 });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({ ...body, tourist_id: user.id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
