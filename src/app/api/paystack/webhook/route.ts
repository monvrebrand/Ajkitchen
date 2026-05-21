import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendOrderConfirmation } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') || '';

  // Verify Paystack webhook signature
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (secret) {
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const tx = event.data;
    const ref = tx.reference;

    // Check if order already saved (from polling in checkout)
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('paystack_ref', ref)
      .single();

    if (!existing) {
      // Order not saved yet — create it from webhook data
      const meta = tx.metadata || {};
      const orderNum = `MV-${Math.floor(100000 + Math.random() * 900000)}`;

      const { error } = await supabaseAdmin.from('orders').insert({
        id: orderNum,
        paystack_ref: ref,
        customer_email: tx.customer?.email,
        customer_name: `${meta.firstName || ''} ${meta.lastName || ''}`.trim(),
        customer_phone: tx.customer?.phone || meta.phone,
        shipping_address: meta.address || '',
        shipping_city: meta.city || '',
        items: meta.items || [],
        subtotal: tx.amount / 100,
        shipping_fee: meta.shippingFee || 0,
        tax: meta.tax || 0,
        total: tx.amount / 100,
        currency: tx.currency,
        status: 'Processing',
      });

      if (!error) {
        // Send confirmation email
        await sendOrderConfirmation({
          to: tx.customer?.email,
          orderNum,
          customerName: `${meta.firstName || 'Customer'}`,
          items: meta.items || [],
          total: tx.amount / 100,
          currency: tx.currency,
          address: `${meta.address || ''}, ${meta.city || ''}`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
