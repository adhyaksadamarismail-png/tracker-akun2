-- Schema DDL for Tracker Akun Voucher
-- Created for Supabase PostgreSQL Database

-- 1. Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT '📦',
    type TEXT NOT NULL CHECK (type IN ('kopi_kenangan', 'kopken_baperan', 'tomoro', 'custom')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aktif',
    notes TEXT DEFAULT '',
    bagian_number INT DEFAULT NULL,
    slot_number INT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vouchers Table
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT, -- e.g. 'Tanpa Min', 'Min 50K', 'Min 70K', 'B1G1', '50%'
    status TEXT NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'used')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and allow public read/write for this app
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to vouchers" ON public.vouchers FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.brands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vouchers;

-- Seed Default Brands
INSERT INTO public.brands (name, icon, type, sort_order) VALUES
('Kopi Kenangan', '☕', 'kopi_kenangan', 1),
('Kopken Baperan', '💔', 'kopken_baperan', 2),
('Tomoro', '🧋', 'tomoro', 3)
ON CONFLICT (name) DO NOTHING;
