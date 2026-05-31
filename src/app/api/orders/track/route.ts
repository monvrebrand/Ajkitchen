import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const [data] = await sql`
      SELECT id, status, created_at, total, currency, items,
             shipping_address, shipping_city, shipping_state, shipping_zip,
             tracking_number, shipping_fee
      FROM orders
      WHERE id = ${id}
    `;

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
