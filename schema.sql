-- ==============================================================================
-- UNDERCOVER / IMPOSTOR SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT DEFAULT '🎭',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    soul_coins INTEGER DEFAULT 500,
    inventory JSONB DEFAULT '["title_novice", "emote_hush"]'::jsonb,
    stats JSONB DEFAULT '{"wins": 0, "games_played": 0, "impostor_wins": 0, "civilian_wins": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are readable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. TRIGGER: Auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, soul_coins, inventory, stats)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || SUBSTRING(NEW.id::text, 1, 6)),
    '🎭',
    500,
    '["title_novice", "emote_hush"]'::jsonb,
    '{"wins": 0, "games_played": 0, "impostor_wins": 0, "civilian_wins": 0}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. AUTO-SYNC EXISTING AUTH USERS (Run if profiles was dropped)
INSERT INTO public.profiles (id, username, avatar_url, soul_coins, inventory, stats)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', 'Player_' || SUBSTRING(id::text, 1, 6)),
  '🎭',
  500,
  '["title_novice", "emote_hush"]'::jsonb,
  '{"wins": 0, "games_played": 0, "impostor_wins": 0, "civilian_wins": 0}'::jsonb
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID,
    status TEXT DEFAULT 'lobby' CHECK (status IN ('lobby', 'reveal', 'clues', 'voting', 'ended')),
    settings JSONB DEFAULT '{"timer": 60, "impostor_count": 1, "custom_words": true}'::jsonb,
    game_state JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public room access" ON public.rooms FOR ALL USING (true);

-- 5. ROOM PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    player_id UUID,
    guest_id TEXT,
    name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '🎭',
    role TEXT CHECK (role IN ('civilian', 'undercover', 'mrwhite', 'spectator', NULL)),
    word TEXT,
    is_alive BOOLEAN DEFAULT true,
    is_host BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public player access" ON public.room_players FOR ALL USING (true);

-- 6. ROOM VOTES TABLE
CREATE TABLE IF NOT EXISTS public.room_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    voter_id TEXT NOT NULL,
    voted_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, voter_id)
);

ALTER TABLE public.room_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public vote access" ON public.room_votes FOR ALL USING (true);

-- 7. WORD PACKS TABLE
CREATE TABLE IF NOT EXISTS public.word_packs (
    id TEXT PRIMARY KEY,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    icon TEXT DEFAULT '📦',
    category TEXT NOT NULL,
    category_en TEXT,
    price INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    words JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.word_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public word packs access" ON public.word_packs FOR ALL USING (true);

-- 8. REALTIME REPLICATION ENABLE
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.word_packs;
