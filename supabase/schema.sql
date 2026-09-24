-- ============================================================================
-- SOUL DATABASE SCHEMA (SOURCE OF TRUTH)
-- ============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'default_avatar.png'::text,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USER ECONOMY TABLE (SouL Coins System)
CREATE TABLE IF NOT EXISTS public.user_economy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT DEFAULT 'Player'::text,
    soul_coins INTEGER DEFAULT 500,
    season_xp INTEGER DEFAULT 0,
    season_level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 1,
    last_login_date DATE DEFAULT CURRENT_DATE,
    win_streak INTEGER DEFAULT 0,
    inventory JSONB DEFAULT '{"outfits":[], "accessories":[], "emotes":[], "screenFX":[], "titles":["Novice"]}'::jsonb,
    equipped JSONB DEFAULT '{"outfit":null, "accessory":null, "emote":null, "screenFX":null, "title":"Novice"}'::jsonb,
    quests JSONB DEFAULT '[]'::jsonb,
    unlocked_pass_tiers JSONB DEFAULT '[1]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Unique index to support upsert on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_economy_user_id ON public.user_economy (user_id);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_economy_soul_coins ON public.user_economy (soul_coins DESC);

-- 3. WORD PACKS TABLE
CREATE TABLE IF NOT EXISTS public.word_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_name TEXT NOT NULL,
    category TEXT NOT NULL,
    word_pairs JSONB NOT NULL,
    icon TEXT DEFAULT '📦'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR NOT NULL UNIQUE,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'waiting'::text,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ROOM PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    player_id UUID,
    is_ready BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
