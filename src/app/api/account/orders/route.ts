import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await sql`
      SELECT id, customer_name, customer_email, customer_phone,
             shipping_address, shipping_city, shipping_state, shipping_zip,
             items, subtotal, shipping_fee, tax, total, currency,
             status, tracking_number, note, created_at
      FROM orders
      WHERE LOWER(customer_email) = ${payload.email.toLowerCase()}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
