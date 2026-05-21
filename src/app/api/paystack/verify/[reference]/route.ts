import { NextResponse } from 'next/server';

// GET /api/paystack/verify/[reference]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  if (!reference) {
    return NextResponse.json({ status: false, message: 'Reference required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Paystack /verify] Error:', err);
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
