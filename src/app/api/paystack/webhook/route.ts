import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/email';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') || '';

  // Verify Paystack webhook signature
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (secret) {
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const tx  = event.data;
    const ref = tx.reference;

    // Check if order already saved (from checkout polling)
    const [existing] = await sql`SELECT id FROM orders WHERE paystack_ref = ${ref}`;

    if (!existing) {
      const meta     = tx.metadata || {};
      const orderNum = `AJK-${Math.floor(100000 + Math.random() * 900000)}`;

      const [newOrder] = await sql`
        INSERT INTO orders (
          id, paystack_ref, customer_email, customer_name, customer_phone,
          shipping_address, shipping_city, items, subtotal, shipping_fee,
          tax, total, currency, status
        ) VALUES (
          ${orderNum}, ${ref},
          ${tx.customer?.email ?? null},
          ${`${meta.firstName || ''} ${meta.lastName || ''}`.trim()},
          ${tx.customer?.phone || meta.phone || null},
          ${meta.address || ''},
          ${meta.city    || ''},
          ${JSON.stringify(meta.items || [])}::jsonb,
          ${tx.amount / 100},
          ${meta.shippingFee || 0},
          ${meta.tax || 0},
          ${tx.amount / 100},
          ${tx.currency},
          'Processing'
        )
        RETURNING id
      `;

      if (newOrder) {
        await sendOrderConfirmation({
          to:           tx.customer?.email,
          orderNum,
          customerName: meta.firstName || 'Customer',
          items:        meta.items || [],
          total:        tx.amount / 100,
          currency:     tx.currency,
          address:      `${meta.address || ''}, ${meta.city || ''}`,
        }).catch(console.error);

        await sendAdminNewOrderAlert({
          orderNum,
          customerName:  `${meta.firstName || ''} ${meta.lastName || ''}`.trim() || 'Customer',
          customerPhone: tx.customer?.phone || meta.phone || '',
          total:         tx.amount / 100,
          paymentMethod: 'card',
          address:       `${meta.address || ''}, ${meta.city || ''}`,
          items:         (meta.items || []).map((i: { name: string; qty: number }) => ({ name: i.name, qty: i.qty })),
        }).catch(console.error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
