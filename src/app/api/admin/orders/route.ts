import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendStatusUpdate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET all orders
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH update order status (+ optional tracking number)
export async function PATCH(req: Request) {
  const { id, status, tracking_number, shipping_fee } = await req.json();

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from('orders')
    .select('customer_email, customer_name, id, shipping_fee')
    .eq('id', id)
    .single();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  // Build update payload
  const updatePayload: Record<string, any> = { status };
  if (tracking_number !== undefined) {
    updatePayload.tracking_number = tracking_number;
  }
  if (shipping_fee !== undefined) {
    updatePayload.shipping_fee = Number(shipping_fee);
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Email customer about status change (non-blocking)
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
}
