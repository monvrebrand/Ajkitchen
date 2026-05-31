import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/products
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured  = searchParams.get('featured');

    let data;
    if (category && category !== 'All' && featured === 'true') {
      data = await sql`SELECT * FROM products WHERE category = ${category} AND featured = true ORDER BY created_at`;
    } else if (category && category !== 'All') {
      data = await sql`SELECT * FROM products WHERE category = ${category} ORDER BY created_at`;
    } else if (featured === 'true') {
      data = await sql`SELECT * FROM products WHERE featured = true ORDER BY created_at`;
    } else {
      data = await sql`SELECT * FROM products ORDER BY created_at`;
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
