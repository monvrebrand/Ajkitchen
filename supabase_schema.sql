-- ================================================================
--  MONVRE — Supabase Database Schema
--  Run this in: supabase.com → Your Project → SQL Editor → Run
-- ================================================================

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY,                -- e.g. "series-01-tshirt"
  name         TEXT NOT NULL,
  price        NUMERIC(10, 2) NOT NULL,
  category     TEXT NOT NULL,
  image        TEXT NOT NULL,                   -- primary image path
  images       TEXT[] DEFAULT '{}',             -- array of image paths
  description  TEXT,
  details      TEXT[] DEFAULT '{}',
  sizes        TEXT[] DEFAULT '{}',
  tag          TEXT,
  featured     BOOLEAN DEFAULT FALSE,
  in_stock     BOOLEAN DEFAULT TRUE,
  quantity     INTEGER DEFAULT 0,            -- total stock quantity
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY,           -- e.g. "MV-123456"
  paystack_ref      TEXT UNIQUE,                -- Paystack transaction reference
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  shipping_address  TEXT NOT NULL,
  shipping_city     TEXT NOT NULL,
  shipping_zip      TEXT,
  items             JSONB NOT NULL,             -- [{id, name, price, qty, size, image}]
  subtotal          NUMERIC(10, 2) NOT NULL,
  shipping_fee      NUMERIC(10, 2) DEFAULT 0,
  tax               NUMERIC(10, 2) DEFAULT 0,
  total             NUMERIC(10, 2) NOT NULL,
  currency          TEXT DEFAULT 'GHS',
  status            TEXT DEFAULT 'Processing',  -- Processing, In Transit, Delivered, Cancelled
  payment_status    TEXT DEFAULT 'Paid',        -- Paid, Pending, Failed
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto-update updated_at on orders ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read
CREATE POLICY "products_public_read"  ON products FOR SELECT USING (true);
-- Products: only service role can insert/update/delete (admin)
CREATE POLICY "products_service_write" ON products FOR ALL USING (auth.role() = 'service_role');

-- Orders: users can read their own orders
CREATE POLICY "orders_own_read" ON orders FOR SELECT USING (auth.uid() = user_id);
-- Orders: service role can read/write all
CREATE POLICY "orders_service_all"   ON orders FOR ALL USING (auth.role() = 'service_role');
-- Orders: allow insert from authenticated or anonymous (checkout)
CREATE POLICY "orders_insert"        ON orders FOR INSERT WITH CHECK (true);

-- ================================================================
--  SEED: Insert the 6 Monvre products
--  Run this AFTER the table is created above
-- ================================================================
INSERT INTO products (id, name, price, category, image, images, description, details, sizes, tag, featured)
VALUES
  ('series-01-tshirt', 'Series 01 Tech Tee', 145, 'Tops', '/products/tshirt.png', ARRAY['/products/tshirt.png'],
   'The centrepiece of Series 01. Heavy-weight 340gsm cotton with a precision screen-print graphic.',
   ARRAY['340gsm heavyweight cotton','Oversized boxy fit','Screen-print ink graphic — front & back','Ribbed crewneck','Made in Portugal'],
   ARRAY['XS','S','M','L','XL','XXL'], 'Series 01', true),

  ('monvre-hoodie', 'Void Hoodie', 220, 'Tops', '/products/hoodie.png', ARRAY['/products/hoodie.png'],
   '500gsm double-faced fleece with dropped shoulders and an oversized silhouette.',
   ARRAY['500gsm double-faced fleece','Dropped shoulder construction','Embroidered MONVRE wordmark','Kangaroo pocket','Made in Portugal'],
   ARRAY['XS','S','M','L','XL','XXL'], NULL, true),

  ('tactical-cargo', 'Tactical Cargo Pant', 310, 'Bottoms', '/products/cargo.png', ARRAY['/products/cargo.png'],
   'Six-pocket cargo silhouette reimagined for the urban environment. Ripstop fabric with adjustable ankle cuffs.',
   ARRAY['100% ripstop nylon','Six-pocket construction','Adjustable ankle cuffs','YKK zippers throughout','Made in Japan'],
   ARRAY['28','30','32','34','36'], NULL, true),

  ('monvre-cap', 'Void Structured Cap', 85, 'Accessories', '/products/cap.png', ARRAY['/products/cap.png'],
   'Six-panel structured cap with front MONVRE embroidery. Premium wool-blend with a curved brim.',
   ARRAY['Wool-blend structured front','Embroidered MONVRE logo','Adjustable snapback closure','One size fits most','Made in Korea'],
   ARRAY['One Size'], 'New', false),

  ('monvre-jacket', 'Series 01 Bomber', 490, 'Outerwear', '/products/jacket.png', ARRAY['/products/jacket.png'],
   'MA-1 silhouette reimagined with a technical nylon shell, contrast interior lining, and embroidered MONVRE branding.',
   ARRAY['100% nylon shell','Contrast satin interior','Embroidered chest patch','Rib-knit collar, cuffs and hem','Made in Japan'],
   ARRAY['XS','S','M','L','XL'], 'Limited', true),

  ('monvre-bag', 'Urban Crossbody', 195, 'Accessories', '/products/bag.png', ARRAY['/products/bag.png'],
   'Minimal crossbody bag in ballistic nylon with debossed MONVRE branding and a water-resistant zip.',
   ARRAY['1000D ballistic nylon','Debossed MONVRE hardware','Water-resistant zip','Adjustable strap — up to 55cm drop','Made in Korea'],
   ARRAY['One Size'], NULL, false)
ON CONFLICT (id) DO NOTHING;
