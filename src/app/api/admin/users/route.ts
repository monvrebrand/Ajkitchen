import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, email, full_name, first_name, last_name, phone, address, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('[admin/users/GET]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
