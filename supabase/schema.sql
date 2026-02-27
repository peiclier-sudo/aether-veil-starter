-- =============================================
-- Aether Veil: Luminara Echoes – Database Schema v2.0
-- Supports auth, cloud save, and real-money purchases
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- 1. Player profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT DEFAULT 'Echo Warden',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cloud save – entire game state as JSONB
--    This is the canonical source of truth for all game data.
--    The client Zustand store hydrates from this on login.
CREATE TABLE IF NOT EXISTS public.save_data (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Real-money purchase ledger
--    Every IAP receipt is validated server-side and recorded here.
--    The client NEVER writes to this table directly — only via Edge Function.
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,           -- e.g. 'com.aetherveil.gems_500'
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  receipt_id TEXT,                     -- store receipt / transaction ID
  amount_cents INTEGER NOT NULL,      -- price in cents (e.g. 499 = $4.99)
  currency TEXT NOT NULL DEFAULT 'USD',
  shards_granted INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'refunded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.save_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update only their own row
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Save data: users can read/upsert only their own save
CREATE POLICY "Users read own save" ON public.save_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own save" ON public.save_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own save" ON public.save_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Purchases: users can only READ their own purchases
-- (inserts/updates are done server-side via service_role key in Edge Functions)
CREATE POLICY "Users read own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);

-- =============================================
-- Auto-create profile + save_data on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, player_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Echo Warden'));

  INSERT INTO public.save_data (user_id, game_state, version)
  VALUES (NEW.id, '{}'::jsonb, 1);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Helper: update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS update_save_data_timestamp ON public.save_data;
CREATE TRIGGER update_save_data_timestamp
  BEFORE UPDATE ON public.save_data
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

SELECT '✅ Schema v2.0 ready – auth, cloud save, purchases' AS result;
