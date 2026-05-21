import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, reply } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (reply !== undefined) updates.reply = reply;

    const { data, error } = await supabaseAdmin
      .from("tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Optionally send email notification to the user here when replied

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
