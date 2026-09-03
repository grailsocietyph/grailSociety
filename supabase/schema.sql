-- ==============================================================================
-- Grail Society Supabase PostgreSQL Schema
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  price_num NUMERIC NOT NULL DEFAULT 0,
  price_formatted TEXT NOT NULL,
  collection_slug TEXT NOT NULL DEFAULT 't-shirts',
  tag_size TEXT NOT NULL DEFAULT 'M',
  measurements_data JSONB DEFAULT '{}'::jsonb,
  condition TEXT DEFAULT '',
  model_height_ft TEXT DEFAULT '5',
  model_height_in TEXT DEFAULT '8',
  model_weight_kg TEXT DEFAULT '81',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_new_arrival BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft',
  is_sold_out BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  date_added DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes for fast querying and filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_slug);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_date_added ON public.products(date_added DESC);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order ASC);

-- 2.1 For existing databases, run this quick migration:
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
-- CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running to avoid duplicate policy errors
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Public insert products" ON public.products;
DROP POLICY IF EXISTS "Public update products" ON public.products;
DROP POLICY IF EXISTS "Public delete products" ON public.products;

-- 4. Set RLS Policies
CREATE POLICY "Public read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Public insert products" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update products" ON public.products
  FOR UPDATE USING (true);

CREATE POLICY "Public delete products" ON public.products
  FOR DELETE USING (true);

-- 5. Enable Realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- 6. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  text TEXT NOT NULL DEFAULT '',
  link TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public delete announcements" ON public.announcements;

CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update announcements" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Public delete announcements" ON public.announcements FOR DELETE USING (true);

-- Enable Realtime for announcements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  END IF;
END $$;
