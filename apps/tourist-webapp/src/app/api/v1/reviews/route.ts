import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { createReview, type ReviewInput } from '@repo/database';

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
    const payload: ReviewInput = {
      ...body,
      tourist_id: user.id
    };

    const review = await createReview(payload);
    
    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
