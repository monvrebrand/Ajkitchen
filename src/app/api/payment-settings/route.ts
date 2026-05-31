import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/* GET /api/payment-settings — public read-only endpoint for checkout page */
export async function GET() {
  try {
    const rows = await sql`SELECT key, value FROM payment_settings`;
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key as string] = row.value as string;
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
