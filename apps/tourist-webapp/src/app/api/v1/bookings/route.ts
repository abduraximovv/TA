import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { createBooking } from '@repo/database';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    const supabase = createClient(cookies());
    const { data: { user }, error: authError } = token 
      ? await supabase.auth.getUser(token) 
      : await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    const booking = await createBooking({
      ...body,
      tourist_id: user.id
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 400 });
  }
}
