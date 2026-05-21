-- Run this in your Supabase SQL Editor to add tracking number support
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
