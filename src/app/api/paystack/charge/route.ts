import { NextResponse } from 'next/server';

const PS_URL = 'https://api.paystack.co';
const AUTH   = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;

async function ps(path: string, body: object) {
  const r = await fetch(`${PS_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type, email, amount } = payload;

    if (!email || !amount || !type) {
      return NextResponse.json({ status: false, message: 'Missing required fields' }, { status: 400 });
    }

    const amountInPesewas = Math.round(Number(amount) * 100);

    // ── Mobile Money ────────────────────────────────────────────
    if (type === 'mobile_money') {
      const { phone, provider } = payload;
      if (!phone || !provider) {
        return NextResponse.json({ status: false, message: 'Phone and provider required' }, { status: 400 });
      }
      const data = await ps('/charge', {
        email,
        amount: amountInPesewas,
        currency: 'GHS',
        mobile_money: { phone, provider },
      });
      return NextResponse.json(data);
    }

    // ── Card ─────────────────────────────────────────────────────
    if (type === 'card') {
      const { number, cvv, expiry_month, expiry_year } = payload;
      if (!number || !cvv || !expiry_month || !expiry_year) {
        return NextResponse.json({ status: false, message: 'Complete card details required' }, { status: 400 });
      }
      const data = await ps('/charge', {
        email,
        amount: amountInPesewas,
        currency: 'GHS',
        card: {
          number: number.replace(/\s/g, ''),
          cvv,
          expiry_month: String(expiry_month).padStart(2, '0'),
          expiry_year: String(expiry_year).slice(-2),
        },
      });
      return NextResponse.json(data);
    }

    // ── Challenge response (PIN / OTP / Birthday) ────────────────
    if (type === 'submit_pin') {
      const data = await ps('/charge/submit_pin', { pin: payload.pin, reference: payload.reference });
      return NextResponse.json(data);
    }

    if (type === 'submit_otp') {
      const data = await ps('/charge/submit_otp', { otp: payload.otp, reference: payload.reference });
      return NextResponse.json(data);
    }

    if (type === 'submit_birthday') {
      const data = await ps('/charge/submit_birthday', { birthday: payload.birthday, reference: payload.reference });
      return NextResponse.json(data);
    }

    if (type === 'submit_address') {
      const data = await ps('/charge/submit_address', {
        address: payload.address, city: payload.city,
        state: payload.state, zipcode: payload.zipcode,
        reference: payload.reference,
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ status: false, message: 'Unknown payment type' }, { status: 400 });

  } catch (err) {
    console.error('[Paystack /charge] Error:', err);
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
