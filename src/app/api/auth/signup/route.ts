import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Uses the service role key so new users are auto-confirmed — no email needed
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Create user with email pre-confirmed — no verification email sent
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // ← skips email confirmation entirely
      user_metadata: {
        full_name:  `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name:  lastName,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch (err) {
    console.error('[/api/auth/signup]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
