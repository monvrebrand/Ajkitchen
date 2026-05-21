-- Run this in your Supabase SQL Editor to add Support Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Open', -- Open, Urgent, Replied, Resolved
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own tickets by email
CREATE POLICY "tickets_own_read" ON tickets 
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Allow users to insert tickets
CREATE POLICY "tickets_insert" ON tickets 
  FOR INSERT WITH CHECK (true);

-- Service role can do everything
CREATE POLICY "tickets_service_all" ON tickets 
  FOR ALL USING (auth.role() = 'service_role');
