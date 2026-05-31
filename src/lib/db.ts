// src/lib/db.ts
// Central Neon PostgreSQL client — used by all API routes for data operations.
// Supabase is kept ONLY for authentication (cookies/session).

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// sql is a tagged-template query function — no connection pooling needed
// (Neon handles HTTP-based serverless connections automatically)
export const sql = neon(process.env.DATABASE_URL!);
