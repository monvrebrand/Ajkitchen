-- =============================================================
--  AJ KITCHEN — Neon PostgreSQL Schema
--  Run this in your Neon dashboard → SQL Editor
-- =============================================================

-- ── Users (replaces Supabase Auth) ───────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        NOT NULL DEFAULT '',
  first_name    TEXT        NOT NULL DEFAULT '',
  last_name     TEXT        NOT NULL DEFAULT '',
  phone         TEXT        NOT NULL DEFAULT '',
  address       TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (LOWER(email));


CREATE TABLE IF NOT EXISTS products (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT        NOT NULL,
  price       NUMERIC     NOT NULL DEFAULT 0,
  category    TEXT        NOT NULL DEFAULT 'Main Meals',
  image       TEXT        NOT NULL DEFAULT '',
  images      JSONB       DEFAULT '[]',
  in_stock    BOOLEAN     NOT NULL DEFAULT true,
  sizes       JSONB       DEFAULT '[]',
  tag         TEXT,
  featured    BOOLEAN     NOT NULL DEFAULT false,
  description TEXT,
  features    JSONB       DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT        PRIMARY KEY,
  paystack_ref     TEXT        UNIQUE,
  customer_email   TEXT,
  customer_name    TEXT,
  customer_phone   TEXT,
  shipping_address TEXT,
  shipping_city    TEXT,
  items            JSONB       NOT NULL DEFAULT '[]',
  subtotal         NUMERIC     NOT NULL DEFAULT 0,
  shipping_fee     NUMERIC     NOT NULL DEFAULT 0,
  tax              NUMERIC     NOT NULL DEFAULT 0,
  total            NUMERIC     NOT NULL DEFAULT 0,
  currency         TEXT        NOT NULL DEFAULT 'NGN',
  status           TEXT        NOT NULL DEFAULT 'Processing',
  note             TEXT        NOT NULL DEFAULT '',
  tracking_number  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Support Tickets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id         BIGSERIAL   PRIMARY KEY,
  user_email TEXT        NOT NULL,
  subject    TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'open',
  reply      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS orders_email_idx      ON orders (LOWER(customer_email));
CREATE INDEX IF NOT EXISTS orders_paystack_idx   ON orders (paystack_ref);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status);
CREATE INDEX IF NOT EXISTS tickets_email_idx     ON tickets (LOWER(user_email));
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
