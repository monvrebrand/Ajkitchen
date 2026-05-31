import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendOrderConfirmation } from '@/lib/email';

// Called from checkout after payment is confirmed
export async function POST(req: Request) {
  try {
    const { reference, orderData } = await req.json();

    if (!reference || !orderData) {
      return NextResponse.json({ status: false, message: 'Reference and order data required' }, { status: 400 });
    }

    // Check if order already exists (webhook may have saved it first)
    const [existing] = await sql`SELECT id FROM orders WHERE paystack_ref = ${reference}`;

    if (existing) {
      return NextResponse.json({ status: true, orderId: existing.id });
    }

    const orderNum = `AJK-${Math.floor(100000 + Math.random() * 900000)}`;

    const [newOrder] = await sql`
      INSERT INTO orders (
        id, paystack_ref, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, items, subtotal, shipping_fee,
        tax, total, currency, status
      ) VALUES (
        ${orderNum}, ${reference},
        ${`${orderData.firstName} ${orderData.lastName}`},
        ${orderData.email},
        ${orderData.phone || null},
        ${orderData.address},
        ${orderData.city},
        ${JSON.stringify(orderData.items)}::jsonb,
        ${orderData.subtotal},
        ${orderData.shippingFee || 0},
        ${orderData.tax || 0},
        ${orderData.total},
        'GHS',
        'Processing'
      )
      RETURNING id
    `;

    if (newOrder) {
      sendOrderConfirmation({
        to:           orderData.email,
        orderNum,
        customerName: `${orderData.firstName} ${orderData.lastName}`,
        items:        orderData.items,
        total:        orderData.total,
        currency:     'GHS',
        address:      `${orderData.address}, ${orderData.city}`,
      }).catch(console.error);
    }

    return NextResponse.json({ status: true, orderId: orderNum });
  } catch (err) {
    console.error('[submit-otp] Error:', err);
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
