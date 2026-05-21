import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Called from checkout after payment is confirmed
export async function POST(req: Request) {
  try {
    const { reference, orderData } = await req.json();

    if (!reference || !orderData) {
      return NextResponse.json({ status: false, message: 'Reference and order data required' }, { status: 400 });
    }

    // Check if order already exists (webhook may have saved it first)
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('paystack_ref', reference)
      .single();

    if (existing) {
      return NextResponse.json({ status: true, orderId: existing.id });
    }

    const orderNum = `MV-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error } = await supabaseAdmin.from('orders').insert({
      id:                orderNum,
      paystack_ref:      reference,
      customer_name:     `${orderData.firstName} ${orderData.lastName}`,
      customer_email:    orderData.email,
      customer_phone:    orderData.phone,
      shipping_address:  orderData.address,
      shipping_city:     orderData.city,
      items:             orderData.items,
      subtotal:          orderData.subtotal,
      shipping_fee:      orderData.shippingFee,
      tax:               orderData.tax,
      total:             orderData.total,
      currency:          'GHS',
      status:            'Processing',
    });

    if (error) {
      console.error('[submit-otp] Order save error:', error.message);
    } else {
      // Send the order confirmation email immediately
      try {
        await sendOrderConfirmation({
          to: orderData.email,
          orderNum: orderNum,
          customerName: `${orderData.firstName} ${orderData.lastName}`,
          items: orderData.items,
          total: orderData.total,
          currency: 'GHS',
          address: `${orderData.address}, ${orderData.city}`,
        });
        console.log(`[submit-otp] Confirmation email sent to ${orderData.email} for order ${orderNum}`);
      } catch (emailErr) {
        console.error('[submit-otp] Error sending confirmation email:', emailErr);
      }
    }

    return NextResponse.json({ status: true, orderId: orderNum });
  } catch (err) {
    console.error('[submit-otp] Error:', err);
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
