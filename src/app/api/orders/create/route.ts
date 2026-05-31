import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/email';

/* POST — create a manual (CashApp / Zelle) order */
export async function POST(req: Request) {
  try {
    const { orderData } = await req.json();

    if (!orderData) {
      return NextResponse.json({ error: 'Order data required' }, { status: 400 });
    }

    const orderNum = `AJK-${Math.floor(100000 + Math.random() * 900000)}`;

    await sql`
      INSERT INTO orders (
        id, paystack_ref, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_state, shipping_zip,
        items, subtotal, shipping_fee,
        tax, total, currency, status, note, payment_method, payment_screenshot
      ) VALUES (
        ${orderNum},
        ${orderNum},
        ${`${orderData.firstName} ${orderData.lastName}`},
        ${orderData.email},
        ${orderData.phone || null},
        ${orderData.address},
        ${orderData.city},
        ${orderData.state || ''},
        ${orderData.zip || ''},
        ${JSON.stringify(orderData.items)}::jsonb,
        ${orderData.subtotal},
        ${orderData.shippingFee || 0},
        ${orderData.tax || 0},
        ${orderData.total},
        ${'USD'},
        ${'Pending'},
        ${orderData.note || ''},
        ${orderData.paymentMethod || 'cashapp'},
        ${orderData.paymentScreenshot || ''}
      )
    `;

    sendOrderConfirmation({
      to:           orderData.email,
      orderNum,
      customerName: `${orderData.firstName} ${orderData.lastName}`,
      items:        orderData.items,
      total:        orderData.total,
      currency:     'USD',
      address:      [orderData.address, orderData.city, orderData.state, orderData.zip].filter(Boolean).join(', '),
    }).catch(console.error);

    // Notify kitchen
    sendAdminNewOrderAlert({
      orderNum,
      customerName:  `${orderData.firstName} ${orderData.lastName}`,
      customerPhone: orderData.phone || '',
      total:         orderData.total,
      paymentMethod: orderData.paymentMethod || 'cashapp',
      address:       [orderData.address, orderData.city, orderData.state, orderData.zip].filter(Boolean).join(', '),
      items:         orderData.items.map((i: { name: string; qty: number }) => ({ name: i.name, qty: i.qty })),
    }).catch(console.error);

    return NextResponse.json({ ok: true, orderId: orderNum });
  } catch (err) {
    console.error('[orders/create]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
