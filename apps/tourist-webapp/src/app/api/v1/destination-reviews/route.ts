import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Same fix as api/v1/bookings/route.ts and api/v1/reviews/route.ts: a request-scoped client
    // carrying the caller's bearer token, so RLS (tourist_id = auth.uid()) is enforced on the insert.
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
    if (!body.destination_id || !body.comment) {
      return NextResponse.json({ error: 'destination_id and comment are required' }, { status: 400 });
    }

    const { data: review, error } = await supabase
      .from('destination_reviews')
      .insert({
        destination_id: body.destination_id,
        rating: body.rating ?? null,
        comment: body.comment,
        tourist_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error("Error creating destination review:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
