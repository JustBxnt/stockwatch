-- =========================================================================
-- StockWatch OS - Database Schema & Supabase Setup
-- Salin dan jalankan script ini di SQL Editor pada Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Buat Tabel Profil Pengguna
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat Tabel Inventori Bahan Kulkas
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty TEXT NOT NULL,
  expiry_text TEXT,
  expiry_color TEXT DEFAULT 'text-[#059669]',
  border_color TEXT DEFAULT 'border-l-[#059669]',
  location TEXT DEFAULT 'Kulkas Utama',
  category TEXT DEFAULT 'cook',
  location_type TEXT DEFAULT 'fridge',
  action_icon TEXT DEFAULT 'edit',
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buat Tabel Daftar Belanja
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtitle TEXT,
  subtitle_color TEXT DEFAULT 'text-[#64748B]',
  price NUMERIC DEFAULT 0,
  price_display TEXT,
  checked BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'cook',
  location_type TEXT DEFAULT 'fridge',
  location TEXT DEFAULT 'Kulkas Utama',
  expiry_days INT DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Buat Tabel Metrik Finansial Pengguna
CREATE TABLE IF NOT EXISTS public.user_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  financial_saved NUMERIC DEFAULT 0,
  saved_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) - Keamanan Data Pengguna (Isolasi Antar Pengguna)
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Policies: Profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policies: Inventory Items
CREATE POLICY "Users can view own inventory items" 
  ON public.inventory_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory items" 
  ON public.inventory_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items" 
  ON public.inventory_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items" 
  ON public.inventory_items FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies: Shopping Items
CREATE POLICY "Users can view own shopping items" 
  ON public.shopping_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping items" 
  ON public.shopping_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping items" 
  ON public.shopping_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping items" 
  ON public.shopping_items FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies: User Metrics
CREATE POLICY "Users can view own metrics" 
  ON public.user_metrics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" 
  ON public.user_metrics FOR ALL 
  USING (auth.uid() = user_id);

-- =========================================================================
-- Trigger Otomatis: Buat Profil saat User Baru Registrasi di Supabase Auth
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );

  INSERT INTO public.user_metrics (user_id, financial_saved, saved_count)
  VALUES (new.id, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger trigger_on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

