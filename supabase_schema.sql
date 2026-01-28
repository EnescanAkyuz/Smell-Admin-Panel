-- 0. Müşteriler Tablosunu Oluştur (Eksikse)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    addresses JSONB DEFAULT '[]'::jsonb,
    order_count INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. Ürünler Tablosunu Güncelle (Parfüm Özellikleri Ekle)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS scent_notes JSONB DEFAULT '{"top": [], "middle": [], "base": []}'::jsonb,
ADD COLUMN IF NOT EXISTS fragrance_family TEXT,
ADD COLUMN IF NOT EXISTS concentration TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unisex',
ADD COLUMN IF NOT EXISTS volume INTEGER,
ADD COLUMN IF NOT EXISTS batch_code TEXT,
ADD COLUMN IF NOT EXISTS production_date DATE,
ADD COLUMN IF NOT EXISTS expiration_date DATE;

-- 2. Yorumlar Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bannerlar Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT NOT NULL,
    link TEXT,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Vitrinler (Showcases) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.showcases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('featured_products', 'campaign', 'text_block')),
    title TEXT NOT NULL,
    content TEXT,
    product_ids JSONB DEFAULT '[]'::jsonb, -- UUID dizisi tutacak
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Yasal Metinler Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.legal_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL UNIQUE, -- privacy_policy, kvkk vb.
    title TEXT NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Dashboard İstatistikleri İçin Fonksiyonlar
-- Toplam Gelir
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled' AND status != 'refunded');
END;
$$ LANGUAGE plpgsql;

-- Bugünü Geliri
CREATE OR REPLACE FUNCTION get_today_revenue()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(total_amount), 0) FROM orders 
          WHERE status != 'cancelled' 
          AND status != 'refunded' 
          AND order_date >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- RLS (Güvenlik) Politikaları (Opsiyonel ama Önerilir)
-- Örnek: Herkes okuyabilir, sadece giriş yapmış adminler yazabilir.
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_texts ENABLE ROW LEVEL SECURITY;

-- Basit bir politika (Geliştirme aşaması için herkese açık yapabilirsiniz veya auth kontrolü ekleyebilirsiniz)
-- CREATE POLICY "Enable read access for all users" ON public.reviews FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
