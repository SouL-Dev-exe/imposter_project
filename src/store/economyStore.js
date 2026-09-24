/**
 * economyStore.js
 * Hybrid economy store: Zustand + localStorage (optimistic cache) + Supabase backend sync.
 *
 * Source of truth for database schema: public.user_economy
 * Columns:
 *  - id UUID PRIMARY KEY
 *  - user_id UUID NOT NULL REFERENCES public.profiles(id)
 *  - username TEXT
 *  - soul_coins INTEGER
 *  - season_xp INTEGER
 *  - season_level INTEGER
 *  - streak_days INTEGER
 *  - last_login_date DATE
 *  - win_streak INTEGER
 *  - inventory JSONB
 *  - equipped JSONB
 *  - quests JSONB
 *  - unlocked_pass_tiers JSONB
 *  - created_at TIMESTAMP WITH TIME ZONE
 *  - updated_at TIMESTAMP WITH TIME ZONE
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../utils/supabase';
import { calculateMatchRewards } from '../utils/economyRewards';
import { STORE_ITEMS, STREAK_LADDER, PASS_TIERS, RARITIES } from '../data/economyCatalog';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_DAILY_QUESTS = [
  { id: 'q1', desc: 'Play 3 matches', progress: 0, target: 3, reward: 150, claimed: false },
  { id: 'q2', desc: 'Win 1 match as Impostor', progress: 0, target: 1, reward: 200, claimed: false },
  { id: 'q3', desc: 'Vote correctly against Impostor', progress: 0, target: 1, reward: 100, claimed: false },
];

const DEFAULT_WEEKLY_QUESTS = [
  { id: 'w1', desc: 'Play 20 matches', progress: 0, target: 20, reward: 1000, claimed: false },
  { id: 'w2', desc: 'Complete 10 daily quests', progress: 0, target: 10, reward: 1500, rewardCrate: 'epic', claimed: false },
];

const DEFAULT_ECONOMY = {
  soulCoins: 500,
  totalCoinsEarned: 500,
  seasonXP: 0,
  seasonLevel: 1,
  streakDays: 1,
  lastLoginDate: new Date().toISOString().slice(0, 10),
  winStreak: 0,
  cratesCount: 0,
  inventory: {
    outfits: [],
    accessories: [],
    emotes: ['emote_hush'],
    screenFX: [],
    titles: ['Novice'],
  },
  equipped: {
    outfit: null,
    accessory: null,
    emote: 'emote_hush',
    screenFX: null,
    title: 'Novice',
  },
  dailyQuests: DEFAULT_DAILY_QUESTS,
  weeklyQuests: DEFAULT_WEEKLY_QUESTS,
  unlockedPassTiers: [1],
  claimedPassTiers: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getDayDiff(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return 999;
  const d1 = new Date(dateStrA);
  const d2 = new Date(dateStrB);
  const diffTime = Math.abs(d2.setHours(0, 0, 0, 0) - d1.setHours(0, 0, 0, 0));
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Extract the economy snapshot formatted using exact column names of public.user_economy.
 */
function buildEconomyPayload(state, userId, username) {
  return {
    user_id: userId,
    username: username || 'Player',
    soul_coins: Number(state.soulCoins) || 0,
    season_xp: Number(state.seasonXP) || 0,
    season_level: Number(state.seasonLevel) || 1,
    streak_days: Number(state.streakDays) || 1,
    last_login_date: state.lastLoginDate || getTodayString(),
    win_streak: Number(state.winStreak) || 0,
    inventory: state.inventory || DEFAULT_ECONOMY.inventory,
    equipped: state.equipped || DEFAULT_ECONOMY.equipped,
    quests: [...(state.dailyQuests || []), ...(state.weeklyQuests || [])],
    unlocked_pass_tiers: state.unlockedPassTiers || [1],
    updated_at: new Date().toISOString(),
  };
}

/**
 * Synchronise economy state to the public.user_economy table in Supabase.
 * Filters strictly by .eq('user_id', currentUser.id) using update() or upsert().
 */
async function syncToSupabase(state) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;
    if (!currentUser?.id) return; // Guest or unauthenticated — skip cloud sync

    const userId = currentUser.id;
    const username = currentUser.user_metadata?.username || 'Player';
    const payload = buildEconomyPayload(state, userId, username);

    // Check if user record already exists in user_economy
    const { data: existing, error: checkError } = await supabase
      .from('user_economy')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!checkError && existing?.id) {
      // Record exists: perform targeted update()
      await supabase
        .from('user_economy')
        .update({
          soul_coins: payload.soul_coins,
          season_xp: payload.season_xp,
          season_level: payload.season_level,
          streak_days: payload.streak_days,
          last_login_date: payload.last_login_date,
          win_streak: payload.win_streak,
          inventory: payload.inventory,
          equipped: payload.equipped,
          quests: payload.quests,
          unlocked_pass_tiers: payload.unlocked_pass_tiers,
          updated_at: payload.updated_at,
        })
        .eq('user_id', userId);
    } else {
      // Record does not exist: upsert / insert initial row
      await supabase
        .from('user_economy')
        .upsert(payload, { onConflict: 'user_id' });
    }
  } catch (err) {
    console.warn('[Economy] Supabase sync failed — localStorage remains active.', err?.message);
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useEconomyStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_ECONOMY,
      streakRewardPending: null,
      isSyncing: false,

      // ─── 0. Supabase Init & Hydration ──────────────────────────────────────
      /**
       * Fetches user_economy state from Supabase by .eq('user_id', currentUser.id)
       * and hydrates local Zustand state. Falls back safely to localStorage.
       */
      initEconomy: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const currentUser = session?.user;

          if (!currentUser?.id) {
            // Unauthenticated: check daily login on local state
            get().checkDailyLogin();
            return;
          }

          const userId = currentUser.id;
          set({ isSyncing: true });

          // Query user_economy matching user_id
          const { data: row, error } = await supabase
            .from('user_economy')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (!error && row) {
            // Parse quests array from row.quests JSONB
            let daily = DEFAULT_DAILY_QUESTS;
            let weekly = DEFAULT_WEEKLY_QUESTS;

            if (Array.isArray(row.quests) && row.quests.length > 0) {
              const d = row.quests.filter((q) => q.id?.startsWith('q'));
              const w = row.quests.filter((q) => q.id?.startsWith('w'));
              if (d.length > 0) daily = d;
              if (w.length > 0) weekly = w;
            }

            set({
              soulCoins: row.soul_coins ?? DEFAULT_ECONOMY.soulCoins,
              totalCoinsEarned: row.soul_coins ?? DEFAULT_ECONOMY.totalCoinsEarned,
              seasonXP: row.season_xp ?? 0,
              seasonLevel: row.season_level ?? 1,
              streakDays: row.streak_days ?? 1,
              lastLoginDate: row.last_login_date ?? getTodayString(),
              winStreak: row.win_streak ?? 0,
              inventory: row.inventory ?? DEFAULT_ECONOMY.inventory,
              equipped: row.equipped ?? DEFAULT_ECONOMY.equipped,
              dailyQuests: daily,
              weeklyQuests: weekly,
              unlockedPassTiers: Array.isArray(row.unlocked_pass_tiers) ? row.unlocked_pass_tiers : [1],
            });
          } else if (!row) {
            // First time user in user_economy: create initial row
            const username = currentUser.user_metadata?.username || 'Player';
            const initialPayload = buildEconomyPayload(get(), userId, username);
            await supabase.from('user_economy').insert([initialPayload]);
          }

          set({ isSyncing: false });
          get().checkDailyLogin();
        } catch (err) {
          console.warn('[Economy] initEconomy failed — using localStorage fallback.', err?.message);
          set({ isSyncing: false });
          get().checkDailyLogin();
        }
      },

      // ─── 1. Daily Login Check (with Supabase sync) ─────────────────────────
      checkDailyLogin: () => {
        const today = getTodayString();
        const { lastLoginDate, streakDays } = get();

        if (lastLoginDate === today) return null;

        const diff = getDayDiff(lastLoginDate, today);
        let newStreak = streakDays;

        if (diff === 1) {
          newStreak = Math.min(streakDays + 1, 7);
        } else if (diff > 1) {
          newStreak = 1;
        }

        const ladderReward = STREAK_LADDER[newStreak - 1] || STREAK_LADDER[0];
        const scReward = ladderReward.sc;
        const extraCrate = ladderReward.crate ? 1 : 0;

        set((state) => ({
          lastLoginDate: today,
          streakDays: newStreak,
          soulCoins: state.soulCoins + scReward,
          totalCoinsEarned: state.totalCoinsEarned + scReward,
          cratesCount: state.cratesCount + extraCrate,
          streakRewardPending: {
            day: newStreak,
            sc: scReward,
            crate: ladderReward.crate,
            label: ladderReward.label,
          },
          dailyQuests: DEFAULT_DAILY_QUESTS,
        }));

        syncToSupabase(get());

        return { day: newStreak, sc: scReward, crate: ladderReward.crate };
      },

      clearStreakNotification: () => {
        set({ streakRewardPending: null });
      },

      // ─── 2. Match Rewards (with Supabase sync) ─────────────────────────────
      recordMatchOutcome: ({ isVictory = false, isCorrectVote = false, isImpostor = false }) => {
        const state = get();
        const breakdown = calculateMatchRewards({
          isVictory,
          isCorrectVote,
          currentWinStreak: state.winStreak,
          currentXP: state.seasonXP,
          currentLevel: state.seasonLevel,
        });

        const newUnlockedTiers = Array.from({ length: breakdown.newLevel }, (_, i) => i + 1);

        const updatedDailyQuests = state.dailyQuests.map((q) => {
          let add = 0;
          if (q.id === 'q1') add = 1;
          if (q.id === 'q2' && isImpostor && isVictory) add = 1;
          if (q.id === 'q3' && isCorrectVote) add = 1;
          return { ...q, progress: Math.min(q.target, q.progress + add) };
        });

        const updatedWeeklyQuests = state.weeklyQuests.map((q) => {
          let add = 0;
          if (q.id === 'w1') add = 1;
          return { ...q, progress: Math.min(q.target, q.progress + add) };
        });

        set((s) => ({
          soulCoins: s.soulCoins + breakdown.totalSC,
          totalCoinsEarned: s.totalCoinsEarned + breakdown.totalSC,
          seasonXP: breakdown.newXP,
          seasonLevel: breakdown.newLevel,
          winStreak: breakdown.newWinStreak,
          unlockedPassTiers: Array.from(new Set([...s.unlockedPassTiers, ...newUnlockedTiers])),
          dailyQuests: updatedDailyQuests,
          weeklyQuests: updatedWeeklyQuests,
        }));

        syncToSupabase(get());

        return breakdown;
      },

      // ─── 3. Quest Claiming (with Supabase sync) ────────────────────────────
      claimQuest: (type, questId) => {
        const state = get();
        const listKey = type === 'weekly' ? 'weeklyQuests' : 'dailyQuests';
        const quests = state[listKey];
        const targetQuest = quests.find((q) => q.id === questId);

        if (!targetQuest || targetQuest.claimed || targetQuest.progress < targetQuest.target) {
          return false;
        }

        const scReward = targetQuest.reward || 0;
        const extraCrate = targetQuest.rewardCrate ? 1 : 0;

        const updatedQuests = quests.map((q) =>
          q.id === questId ? { ...q, claimed: true } : q
        );

        let updatedWeeklyQuests = state.weeklyQuests;
        if (type !== 'weekly') {
          updatedWeeklyQuests = state.weeklyQuests.map((wq) =>
            wq.id === 'w2' ? { ...wq, progress: Math.min(wq.target, wq.progress + 1) } : wq
          );
        }

        set((s) => ({
          soulCoins: s.soulCoins + scReward,
          totalCoinsEarned: s.totalCoinsEarned + scReward,
          cratesCount: s.cratesCount + extraCrate,
          [listKey]: updatedQuests,
          weeklyQuests: updatedWeeklyQuests,
        }));

        syncToSupabase(get());
        return true;
      },

      // ─── 4. SouL Store Purchases & Equipping (with Supabase sync) ──────────
      purchaseItem: (itemId) => {
        const item = STORE_ITEMS.find((i) => i.id === itemId);
        if (!item) return { success: false, error: 'Item not found' };

        const { soulCoins, inventory, equipped } = get();
        const category = item.category;

        if (inventory[category]?.includes(itemId)) {
          return { success: false, error: 'Item already owned' };
        }
        if (soulCoins < item.price) {
          return { success: false, error: 'Insufficient SouL Coins' };
        }

        const newCategoryInventory = [...(inventory[category] || []), itemId];
        const shouldAutoEquip = !equipped[category];

        set((s) => ({
          soulCoins: s.soulCoins - item.price,
          inventory: { ...s.inventory, [category]: newCategoryInventory },
          equipped: {
            ...s.equipped,
            ...(shouldAutoEquip ? { [category]: itemId } : {}),
          },
        }));

        syncToSupabase(get());
        return { success: true, item };
      },

      equipItem: (category, itemId) => {
        const { inventory } = get();
        if (itemId && !inventory[category]?.includes(itemId)) return false;
        set((s) => ({ equipped: { ...s.equipped, [category]: itemId } }));
        syncToSupabase(get());
        return true;
      },

      unequipItem: (category) => {
        set((s) => ({
          equipped: {
            ...s.equipped,
            [category]: category === 'title' ? 'Novice' : null,
          },
        }));
        syncToSupabase(get());
      },

      // ─── 5. SouL Pass Claims (with Supabase sync) ──────────────────────────
      claimPassTier: (tierLevel) => {
        const { unlockedPassTiers, claimedPassTiers, inventory } = get();
        if (!unlockedPassTiers.includes(tierLevel) || claimedPassTiers.includes(tierLevel)) {
          return false;
        }

        const tierData = PASS_TIERS.find((t) => t.level === tierLevel);
        if (!tierData || !tierData.reward) return false;

        let scAdd = tierData.reward.sc || 0;
        let cratesAdd = tierData.reward.crates || 0;
        const updatedInventory = { ...inventory };

        if (tierData.reward.type === 'item' && tierData.reward.itemId) {
          const item = STORE_ITEMS.find((i) => i.id === tierData.reward.itemId);
          if (item) {
            const cat = item.category;
            if (!updatedInventory[cat]?.includes(item.id)) {
              updatedInventory[cat] = [...(updatedInventory[cat] || []), item.id];
            }
          }
        }
        if (tierData.reward.extraTitle) {
          if (!updatedInventory.titles?.includes(tierData.reward.extraTitle)) {
            updatedInventory.titles = [...(updatedInventory.titles || []), tierData.reward.extraTitle];
          }
        }

        set((s) => ({
          soulCoins: s.soulCoins + scAdd,
          totalCoinsEarned: s.totalCoinsEarned + scAdd,
          cratesCount: s.cratesCount + cratesAdd,
          inventory: updatedInventory,
          claimedPassTiers: [...s.claimedPassTiers, tierLevel],
        }));

        syncToSupabase(get());
        return true;
      },

      claimAllPassTiers: () => {
        const { unlockedPassTiers, claimedPassTiers, inventory } = get();
        const claimable = unlockedPassTiers.filter((lvl) => !claimedPassTiers.includes(lvl));
        if (claimable.length === 0) return 0;

        let totalScGained = 0;
        let totalCratesGained = 0;
        const updatedInventory = { ...inventory };

        claimable.forEach((tierLevel) => {
          const tierData = PASS_TIERS.find((t) => t.level === tierLevel);
          if (!tierData || !tierData.reward) return;

          totalScGained += tierData.reward.sc || 0;
          totalCratesGained += tierData.reward.crates || 0;

          if (tierData.reward.type === 'item' && tierData.reward.itemId) {
            const item = STORE_ITEMS.find((i) => i.id === tierData.reward.itemId);
            if (item) {
              const cat = item.category;
              if (!updatedInventory[cat]?.includes(item.id)) {
                updatedInventory[cat] = [...(updatedInventory[cat] || []), item.id];
              }
            }
          }
          if (tierData.reward.extraTitle) {
            if (!updatedInventory.titles?.includes(tierData.reward.extraTitle)) {
              updatedInventory.titles = [...(updatedInventory.titles || []), tierData.reward.extraTitle];
            }
          }
        });

        set((s) => ({
          soulCoins: s.soulCoins + totalScGained,
          totalCoinsEarned: s.totalCoinsEarned + totalScGained,
          cratesCount: s.cratesCount + totalCratesGained,
          inventory: updatedInventory,
          claimedPassTiers: Array.from(new Set([...s.claimedPassTiers, ...claimable])),
        }));

        syncToSupabase(get());
        return claimable.length;
      },

      // ─── 6. Mystery Crates (with Supabase sync) ─────────────────────────────
      openCrate: () => {
        const { cratesCount, soulCoins, inventory } = get();
        const CRATE_COST = 1000;
        const usedFreeCrate = cratesCount > 0;

        if (!usedFreeCrate && soulCoins < CRATE_COST) {
          return { success: false, error: 'Insufficient SouL Coins (1,000 SC required)' };
        }

        // RNG Drop Probabilities
        const roll = Math.random();
        let selectedRarity = 'common';
        if (roll < RARITIES.legendary.dropRate) {
          selectedRarity = 'legendary';
        } else if (roll < RARITIES.legendary.dropRate + RARITIES.epic.dropRate) {
          selectedRarity = 'epic';
        } else if (roll < RARITIES.legendary.dropRate + RARITIES.epic.dropRate + RARITIES.rare.dropRate) {
          selectedRarity = 'rare';
        }

        const candidateItems = STORE_ITEMS.filter((i) => i.rarity === selectedRarity);
        const rolledItem =
          candidateItems[Math.floor(Math.random() * candidateItems.length)] || STORE_ITEMS[0];

        // Duplicate protection: 50% SC refund (+500 SC)
        const isDuplicate = Boolean(inventory[rolledItem.category]?.includes(rolledItem.id));
        const refundAmount = isDuplicate ? 500 : 0;

        set((s) => {
          const newCratesCount = usedFreeCrate ? s.cratesCount - 1 : s.cratesCount;
          const costDeduction = usedFreeCrate ? 0 : CRATE_COST;
          const newSC = s.soulCoins - costDeduction + refundAmount;
          const updatedInventory = { ...s.inventory };

          if (!isDuplicate) {
            updatedInventory[rolledItem.category] = [
              ...(updatedInventory[rolledItem.category] || []),
              rolledItem.id,
            ];
          }

          return { cratesCount: newCratesCount, soulCoins: newSC, inventory: updatedInventory };
        });

        syncToSupabase(get());
        return { success: true, item: rolledItem, rarity: selectedRarity, isDuplicate, refundAmount, usedFreeCrate };
      },

      // ─── 7. Global Leaderboard Query ───────────────────────────────────────
      /**
       * Fetches top 100 players from public.user_economy ordered by soul_coins DESC.
       */
      fetchLeaderboard: async () => {
        try {
          // Attempt join with public.profiles for avatar and username
          const { data, error } = await supabase
            .from('user_economy')
            .select(`
              id,
              user_id,
              username,
              soul_coins,
              season_level,
              season_xp,
              win_streak,
              equipped,
              profiles (
                avatar_url,
                username
              )
            `)
            .order('soul_coins', { ascending: false })
            .limit(100);

          if (error) {
            // Direct query fallback if join relation is not exposed
            const { data: simpleData, error: simpleError } = await supabase
              .from('user_economy')
              .select('id, user_id, username, soul_coins, season_level, equipped')
              .order('soul_coins', { ascending: false })
              .limit(100);

            if (simpleError) throw simpleError;

            return (simpleData || []).map((row, index) => ({
              rank: index + 1,
              id: row.id,
              userId: row.user_id,
              username: row.username || 'Player',
              avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(row.username || 'Player')}`,
              soulCoins: row.soul_coins ?? 0,
              seasonLevel: row.season_level ?? 1,
              equippedTitle: row.equipped?.title ?? 'Novice',
            }));
          }

          return (data || []).map((row, index) => {
            const uname = row.profiles?.username || row.username || 'Player';
            const avatar = row.profiles?.avatar_url && row.profiles?.avatar_url !== 'default_avatar.png'
              ? row.profiles.avatar_url
              : `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(uname)}`;

            return {
              rank: index + 1,
              id: row.id,
              userId: row.user_id,
              username: uname,
              avatar_url: avatar,
              soulCoins: row.soul_coins ?? 0,
              seasonLevel: row.season_level ?? 1,
              equippedTitle: row.equipped?.title ?? 'Novice',
            };
          });
        } catch (err) {
          console.warn('[Economy] Leaderboard fetch failed.', err?.message);
          return [];
        }
      },
    }),
    {
      name: 'soul_coins_economy',
      partialize: (state) => {
        const {
          isSyncing,
          streakRewardPending,
          initEconomy,
          checkDailyLogin,
          clearStreakNotification,
          recordMatchOutcome,
          claimQuest,
          purchaseItem,
          equipItem,
          unequipItem,
          claimPassTier,
          claimAllPassTiers,
          openCrate,
          fetchLeaderboard,
          ...rest
        } = state;
        return rest;
      },
    }
  )
);
