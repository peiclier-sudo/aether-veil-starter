-- =============================================
-- Aether Veil: Luminara Echoes – Complete Database Schema v1.1 (FIXED)
-- Run this entire file in Supabase SQL Editor
-- =============================================

-- Drop existing tables if you want a clean start (uncomment if needed)
-- DROP TABLE IF EXISTS public.owned_heroes CASCADE;
-- DROP TABLE IF EXISTS public.inventory_gear CASCADE;
-- DROP TABLE IF EXISTS public.resonance_bonds CASCADE;
-- DROP TABLE IF EXISTS public.player_progress CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Player Profile (must be first)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT DEFAULT 'Echo Warden',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Owned Heroes
CREATE TABLE IF NOT EXISTS public.owned_heroes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  champion_key TEXT NOT NULL,
  name TEXT NOT NULL,
  faction TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','epic','legendary')),
  role TEXT NOT NULL CHECK (role IN ('offensive','defensive','support')),
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 80),
  power INTEGER DEFAULT 1000,
  hp INTEGER,
  atk INTEGER,
  def INTEGER,
  spd INTEGER,
  crit_rate NUMERIC(5,2),
  crit_dmg NUMERIC(5,2),
  acc INTEGER,
  res INTEGER,
  equipped_gear JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Gear
CREATE TABLE IF NOT EXISTS public.inventory_gear (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('weapon','head','chest','arms','legs','boots','core1','core2')),
  rarity TEXT NOT NULL,
  main_stat JSONB NOT NULL,
  sub_stats JSONB[] DEFAULT '{}',
  set_bonus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Active Resonance Bonds
CREATE TABLE IF NOT EXISTS public.resonance_bonds (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  factions TEXT[],
  effect TEXT NOT NULL,
  power INTEGER DEFAULT 0 CHECK (power BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Player Progress
CREATE TABLE IF NOT EXISTS public.player_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  aether_shards INTEGER DEFAULT 8500,
  daily_streak INTEGER DEFAULT 0,
  last_daily_reward TIMESTAMPTZ,
  total_pulls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owned_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resonance_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own data" ON public.profiles USING (auth.uid() = id);
CREATE POLICY "Users can only manage their own heroes" ON public.owned_heroes USING (auth.uid() = user_id);
CREATE POLICY "Users can only manage their own gear" ON public.inventory_gear USING (auth.uid() = user_id);
CREATE POLICY "Users can only manage their own bonds" ON public.resonance_bonds USING (auth.uid() = user_id);
CREATE POLICY "Users can only manage their own progress" ON public.player_progress USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA (now in correct order)
-- =============================================

-- 1. Create dummy profile
INSERT INTO public.profiles (id, player_name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Echo Warden')
ON CONFLICT (id) DO NOTHING;

-- 2. Create player progress
INSERT INTO public.player_progress (user_id, aether_shards, daily_streak)
VALUES ('00000000-0000-0000-0000-000000000000', 8500, 0)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Seed the 20 champions (now safe)
INSERT INTO public.owned_heroes 
  (user_id, champion_key, name, faction, rarity, role, level, power, hp, atk, def, spd, crit_rate, crit_dmg, acc, res)
VALUES 
  -- COMMON (5)
  ('00000000-0000-0000-0000-000000000000', 'solara_flameblade', 'Solara Flameblade', 'Solar Dominion', 'common', 'offensive', 1, 980, 880, 105, 58, 103, 15, 150, 85, 85),
  ('00000000-0000-0000-0000-000000000000', 'lunar_shadowstep', 'Lunar Shadowstep', 'Lunar Veil', 'common', 'offensive', 1, 970, 880, 102, 58, 105, 15, 150, 85, 85),
  ('00000000-0000-0000-0000-000000000000', 'forge_ironwall', 'Forge Ironwall', 'Stellar Forge', 'common', 'defensive', 1, 950, 1080, 88, 78, 95, 15, 150, 85, 85),
  ('00000000-0000-0000-0000-000000000000', 'verdant_thornshield', 'Verdant Thornshield', 'Verdant Crown', 'common', 'defensive', 1, 960, 1080, 85, 80, 94, 15, 150, 85, 85),
  ('00000000-0000-0000-0000-000000000000', 'arcane_sparkhealer', 'Arcane Sparkhealer', 'Arcane Nexus', 'common', 'support', 1, 930, 1050, 88, 58, 98, 15, 150, 95, 95),
  
  -- RARE (5)
  ('00000000-0000-0000-0000-000000000000', 'thunderbolt_ravager', 'Thunderbolt Ravager', 'Thunder Pantheon', 'rare', 'offensive', 1, 1250, 1080, 125, 72, 112, 18, 160, 95, 95),
  ('00000000-0000-0000-0000-000000000000', 'crimson_bloodreaver', 'Crimson Bloodreaver', 'Crimson Abyss', 'rare', 'offensive', 1, 1280, 1080, 130, 70, 110, 18, 160, 95, 95),
  ('00000000-0000-0000-0000-000000000000', 'voidshade_sentinel', 'Voidshade Sentinel', 'Void Whisper', 'rare', 'defensive', 1, 1180, 1350, 108, 92, 104, 18, 160, 95, 95),
  ('00000000-0000-0000-0000-000000000000', 'solar_aegis_knight', 'Solar Aegis Knight', 'Solar Dominion', 'rare', 'defensive', 1, 1190, 1350, 105, 95, 102, 18, 160, 95, 95),
  ('00000000-0000-0000-0000-000000000000', 'verdant_lifeweaver', 'Verdant Lifeweaver', 'Verdant Crown', 'rare', 'support', 1, 1150, 1300, 108, 72, 108, 18, 160, 105, 115),

  -- EPIC (5)
  ('00000000-0000-0000-0000-000000000000', 'ignis_inferno_sovereign', 'Ignis Inferno Sovereign', 'Stellar Forge', 'epic', 'offensive', 1, 1680, 1350, 155, 88, 118, 22, 172, 105, 105),
  ('00000000-0000-0000-0000-000000000000', 'lunara_eclipse_dancer', 'Lunara Eclipse Dancer', 'Lunar Veil', 'epic', 'offensive', 1, 1720, 1350, 160, 85, 120, 22, 172, 105, 105),
  ('00000000-0000-0000-0000-000000000000', 'arcane_runelord', 'Arcane Runelord', 'Arcane Nexus', 'epic', 'defensive', 1, 1580, 1680, 135, 108, 110, 22, 172, 105, 115),
  ('00000000-0000-0000-0000-000000000000', 'crimson_lifeblood_matron', 'Crimson Lifeblood Matron', 'Crimson Abyss', 'epic', 'support', 1, 1550, 1620, 135, 88, 115, 22, 172, 115, 125),
  ('00000000-0000-0000-0000-000000000000', 'thunder_pantheon_herald', 'Thunder Pantheon Herald', 'Thunder Pantheon', 'epic', 'support', 1, 1600, 1650, 130, 88, 118, 22, 172, 115, 125),

  -- LEGENDARY (5)
  ('00000000-0000-0000-0000-000000000000', 'solara_dawnbreaker', 'Solara Dawnbreaker', 'Solar Dominion', 'legendary', 'offensive', 1, 2450, 1650, 195, 105, 128, 26, 185, 115, 115),
  ('00000000-0000-0000-0000-000000000000', 'voidara_eternal_warden', 'Voidara Eternal Warden', 'Void Whisper', 'legendary', 'defensive', 1, 2380, 1980, 165, 125, 118, 26, 185, 115, 125),
  ('00000000-0000-0000-0000-000000000000', 'verdara_worldbloom', 'Verdara Worldbloom', 'Verdant Crown', 'legendary', 'support', 1, 2320, 1950, 165, 105, 120, 26, 185, 125, 135),
  ('00000000-0000-0000-0000-000000000000', 'ignis_eternal_flame', 'Ignis Eternal Flame', 'Stellar Forge', 'legendary', 'offensive', 1, 2480, 1650, 200, 105, 130, 26, 185, 115, 115),
  ('00000000-0000-0000-0000-000000000000', 'arcana_starweaver', 'Arcana Starweaver', 'Arcane Nexus', 'legendary', 'support', 1, 2350, 1920, 165, 105, 125, 26, 185, 125, 135)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_owned_heroes_user_id ON public.owned_heroes(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_gear_user_id ON public.inventory_gear(user_id);

SELECT '✅ Schema + 20 champions seeded successfully!' AS result;
