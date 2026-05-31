import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';
import { sendStatusUpdate } from '@/lib/email';

const ADMIN_COOKIE = 'ajk_admin_session';

async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE)?.value;
    if (!token || !process.env.JWT_SECRET) return false;
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch { return false; }
}

// GET all orders (admin only)
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await sql`
      SELECT id, customer_name, customer_email, customer_phone,
             shipping_address, shipping_city, shipping_state, shipping_zip,
             items, subtotal, shipping_fee, tax, total, currency,
             status, tracking_number, note, payment_method, payment_screenshot, created_at
      FROM orders ORDER BY created_at DESC
    `;
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

// PATCH update order status (admin only)
export async function PATCH(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, status, tracking_number, shipping_fee } = await req.json();

    const [order] = await sql`
      SELECT customer_email, customer_name, id, shipping_fee
      FROM orders WHERE id = ${id}
    `;
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (tracking_number !== undefined && shipping_fee !== undefined) {
      await sql`UPDATE orders SET status = ${status}, tracking_number = ${tracking_number}, shipping_fee = ${Number(shipping_fee)} WHERE id = ${id}`;
    } else if (tracking_number !== undefined) {
      await sql`UPDATE orders SET status = ${status}, tracking_number = ${tracking_number} WHERE id = ${id}`;
    } else if (shipping_fee !== undefined) {
      await sql`UPDATE orders SET status = ${status}, shipping_fee = ${Number(shipping_fee)} WHERE id = ${id}`;
    } else {
      await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
    }

    if (order?.customer_email) {
      sendStatusUpdate({
        to:           order.customer_email,
        orderNum:     order.id,
        customerName: order.customer_name?.split(' ')[0] || 'Customer',
        status,
        trackingNumber: tracking_number || undefined,
        shippingFee: shipping_fee !== undefined ? Number(shipping_fee) : order.shipping_fee ?? undefined,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
