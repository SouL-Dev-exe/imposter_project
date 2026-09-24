-- ============================================================
-- SouL Coins Economy — Supabase Migration
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add economy_data JSONB column to the profiles table
--    (idempotent: does nothing if column already exists)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS economy_data JSONB DEFAULT NULL;

-- 2. Optional: Create a GIN index for faster JSON key queries
--    (e.g., ordering by economy_data->>'soulCoins')
CREATE INDEX IF NOT EXISTS idx_profiles_economy_data
  ON public.profiles USING GIN (economy_data);

-- 3. Allow authenticated users to read/write their own row
--    (Row Level Security must already be enabled on profiles)
--    Add update policy for economy_data if not covered by existing policies:
-- DO $$ BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies
--     WHERE tablename = 'profiles' AND policyname = 'Users can update own economy_data'
--   ) THEN
--     CREATE POLICY "Users can update own economy_data"
--       ON public.profiles
--       FOR UPDATE TO authenticated
--       USING (auth.uid() = id)
--       WITH CHECK (auth.uid() = id);
--   END IF;
-- END $$;

-- 4. Allow all authenticated users to SELECT other profiles (for leaderboard)
--    Only add this if you don't already have a global read policy:
-- CREATE POLICY "Public profiles are viewable by authenticated users"
--   ON public.profiles
--   FOR SELECT TO authenticated
--   USING (true);

-- ============================================================
-- Avatar Styles Migration (add after the initial migration)
-- ============================================================

-- 5. Add equipped_avatar_style column to user_economy
--    (stores the DiceBear style key the player currently has equipped)
ALTER TABLE public.user_economy
  ADD COLUMN IF NOT EXISTS equipped_avatar_style TEXT DEFAULT 'bottts';

-- 6. Add owned_avatar_styles JSONB array to user_economy
--    (stores array of purchased DiceBear style keys)
ALTER TABLE public.user_economy
  ADD COLUMN IF NOT EXISTS owned_avatar_styles JSONB DEFAULT '["bottts"]'::jsonb;
