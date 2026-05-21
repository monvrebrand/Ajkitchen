import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/products — fetch all from Supabase
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  const supabase = await createClient();
  let query = supabase.from('products').select('*').order('created_at', { ascending: true });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }
  if (featured === 'true') {
    query = query.eq('featured', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
