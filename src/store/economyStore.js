/**
 * economyStore.js
 * Hybrid economy store: Zustand + localStorage (optimistic cache) + Supabase backend sync.
 *
 * Source of truth for database schema: public.profiles
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
import {
  STORE_ITEMS,
  STREAK_LADDER,
  PASS_TIERS,
  RARITIES,
  normalizeCategory,
  normalizeInventoryCategory,
  getStoreItem,
} from '../data/economyCatalog';

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
  // Avatar Styles
  equippedAvatarStyle: 'bottts',
  ownedAvatarStyles: ['bottts'],
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
/**
 * Extract the economy snapshot formatted for public.profiles.
 */
function buildProfilesEconomyPayload(state) {
  const inventoryList = Array.isArray(state.inventory)
    ? state.inventory
    : [
        ...(state.inventory?.outfits || []),
        ...(state.inventory?.accessories || []),
        ...(state.inventory?.emotes || []),
        ...(state.inventory?.screenFX || []),
        ...(state.inventory?.titles || []),
      ];

  return {
    soul_coins: Number(state.soulCoins) || 0,
    xp: Number(state.seasonXP) || 0,
    level: Number(state.seasonLevel) || 1,
    inventory: inventoryList,
    stats: {
      streak_days: Number(state.streakDays) || 1,
      last_login_date: state.lastLoginDate || getTodayString(),
      win_streak: Number(state.winStreak) || 0,
      equipped: state.equipped || DEFAULT_ECONOMY.equipped,
      quests: [...(state.dailyQuests || []), ...(state.weeklyQuests || [])],
      unlocked_pass_tiers: state.unlockedPassTiers || [1],
      equipped_avatar_style: state.equippedAvatarStyle || 'bottts',
      owned_avatar_styles: state.ownedAvatarStyles || ['bottts'],
    },
    updated_at: new Date().toISOString(),
  };
}

/**
 * Synchronise economy state directly to public.profiles table in Supabase.
 */
async function syncToSupabase(state) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;
    if (!currentUser?.id) return; // Guest or unauthenticated — skip cloud sync

    const userId = currentUser.id;
    const payload = buildProfilesEconomyPayload(state);

    await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);
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
       * Fetches profile state from Supabase by .eq('id', currentUser.id)
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

          // Query profiles matching id
          const { data: row, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (!error && row) {
            const rawStats = row.stats || {};
            let daily = DEFAULT_DAILY_QUESTS;
            let weekly = DEFAULT_WEEKLY_QUESTS;

            if (Array.isArray(rawStats.quests) && rawStats.quests.length > 0) {
              const d = rawStats.quests.filter((q) => q.id?.startsWith('q'));
              const w = rawStats.quests.filter((q) => q.id?.startsWith('w'));
              if (d.length > 0) daily = d;
              if (w.length > 0) weekly = w;
            }

            set({
              soulCoins: row.soul_coins ?? DEFAULT_ECONOMY.soulCoins,
              totalCoinsEarned: row.soul_coins ?? DEFAULT_ECONOMY.totalCoinsEarned,
              seasonXP: row.xp ?? 0,
              seasonLevel: row.level ?? 1,
              streakDays: rawStats.streak_days ?? 1,
              lastLoginDate: rawStats.last_login_date ?? getTodayString(),
              winStreak: rawStats.win_streak ?? 0,
              equipped: rawStats.equipped ?? DEFAULT_ECONOMY.equipped,
              dailyQuests: daily,
              weeklyQuests: weekly,
              unlockedPassTiers: Array.isArray(rawStats.unlocked_pass_tiers) ? rawStats.unlocked_pass_tiers : [1],
              equippedAvatarStyle: rawStats.equipped_avatar_style ?? 'bottts',
              ownedAvatarStyles: Array.isArray(rawStats.owned_avatar_styles) && rawStats.owned_avatar_styles.length > 0
                ? rawStats.owned_avatar_styles
                : ['bottts'],
            });
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
        const item = getStoreItem(itemId);
        if (!item) return { success: false, error: 'Item not found' };

        const { soulCoins, inventory, equipped } = get();
        const invCat = normalizeInventoryCategory(item.category);
        const eqCat = normalizeCategory(item.category);

        const currentList = inventory[invCat] || [];
        if (currentList.includes(itemId) || currentList.includes(item.name)) {
          return { success: false, error: 'Item already owned' };
        }
        if (soulCoins < item.price) {
          return { success: false, error: 'Insufficient SouL Coins' };
        }

        const newCategoryInventory = [...currentList, itemId];
        const shouldAutoEquip = !equipped[eqCat];

        set((s) => ({
          soulCoins: s.soulCoins - item.price,
          inventory: { ...s.inventory, [invCat]: newCategoryInventory },
          equipped: {
            ...s.equipped,
            ...(shouldAutoEquip ? { [eqCat]: itemId } : {}),
          },
        }));

        syncToSupabase(get());
        return { success: true, item };
      },

      equipItem: (category, itemId) => {
        const { inventory } = get();
        const item = getStoreItem(itemId);
        const invCat = normalizeInventoryCategory(category || item?.category);
        const eqCat = normalizeCategory(category || item?.category);

        // Verification: check if owned in inventory (support ID or name or default title)
        const currentList = inventory[invCat] || [];
        const isOwned =
          currentList.includes(itemId) ||
          (item && currentList.includes(item.name)) ||
          (eqCat === 'title' && (itemId === 'Novice' || itemId === 'title_novice'));

        if (itemId && !isOwned) {
          return false;
        }

        set((s) => ({
          equipped: {
            ...s.equipped,
            [eqCat]: itemId,
          },
        }));

        syncToSupabase(get());
        return true;
      },

      unequipItem: (category) => {
        const eqCat = normalizeCategory(category);
        set((s) => ({
          equipped: {
            ...s.equipped,
            [eqCat]: eqCat === 'title' ? 'Novice' : null,
          },
        }));
        syncToSupabase(get());
      },

      isOwned: (itemId, category) => {
        const { inventory } = get();
        if (!itemId) return false;
        const item = getStoreItem(itemId);
        const invCat = normalizeInventoryCategory(category || item?.category);
        const list = inventory[invCat] || [];
        return (
          list.includes(itemId) ||
          (item && list.includes(item.name)) ||
          (invCat === 'titles' && (itemId === 'Novice' || itemId === 'title_novice'))
        );
      },

      isEquipped: (itemId, category) => {
        const { equipped } = get();
        if (!itemId) return false;
        const item = getStoreItem(itemId);
        const eqCat = normalizeCategory(category || item?.category);
        const active = equipped[eqCat];
        if (!active) return false;
        return (
          active === itemId ||
          (item && active === item.name) ||
          (eqCat === 'title' && active === 'Novice' && (itemId === 'Novice' || itemId === 'title_novice')) ||
          (eqCat === 'title' && item && (active === item.name || active === item.id))
        );
      },

      getEquippedItem: (category) => {
        const { equipped } = get();
        const eqCat = normalizeCategory(category);
        const activeVal = equipped[eqCat];
        if (!activeVal) return null;
        return getStoreItem(activeVal) || { id: activeVal, name: activeVal, icon: '✨' };
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
       * Fetches top 100 players from public.profiles ordered by soul_coins DESC.
       */
      fetchLeaderboard: async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, level, xp, soul_coins, stats')
            .order('soul_coins', { ascending: false })
            .limit(100);

          if (error) throw error;

          return (data || []).map((row, index) => {
            const rawStats = row.stats || {};
            const uname = row.username || 'Player';
            const avatar = row.avatar_url && row.avatar_url !== 'default_avatar.png'
              ? row.avatar_url
              : `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(uname)}`;

            return {
              rank: index + 1,
              id: row.id,
              userId: row.id,
              username: uname,
              avatar_url: avatar,
              equippedAvatarStyle: rawStats.equipped_avatar_style || 'bottts',
              equipped: rawStats.equipped || {},
              soulCoins: row.soul_coins ?? 0,
              seasonLevel: row.level ?? 1,
              equippedTitle: rawStats.equipped?.title ?? 'Novice',
              seasonXP: row.xp ?? 0,
              winStreak: rawStats.win_streak ?? 0,
            };
          });
        } catch (err) {
          console.warn('[Economy] Leaderboard fetch failed.', err?.message);
          return [];
        }
      },

      // ─── 8. Avatar Style Purchase & Equip ─────────────────────────────────
      /**
       * Purchase a DiceBear avatar style with SC.
       * Bottts is free/default. All others cost SC and require a minimum level.
       * @param {string} styleValue - DiceBear style key (e.g. 'adventurer')
       * @param {number} price - SC cost (0 for free/already owned)
       */
      purchaseAvatarStyle: (styleValue, price) => {
        const state = get();
        if (state.ownedAvatarStyles.includes(styleValue)) {
          // Already owned — just equip
          set({ equippedAvatarStyle: styleValue });
          syncToSupabase(get());
          return { success: true, alreadyOwned: true };
        }
        if (state.soulCoins < price) {
          return { success: false, error: 'Not enough SouL Coins.' };
        }
        set((s) => ({
          soulCoins: s.soulCoins - price,
          ownedAvatarStyles: [...s.ownedAvatarStyles, styleValue],
          equippedAvatarStyle: styleValue,
        }));
        syncToSupabase(get());
        return { success: true, alreadyOwned: false };
      },

      /**
       * Equip an already-owned avatar style (free).
       * @param {string} styleValue - DiceBear style key
       */
      equipAvatarStyle: (styleValue) => {
        const { ownedAvatarStyles } = get();
        if (!ownedAvatarStyles.includes(styleValue)) return false;
        set({ equippedAvatarStyle: styleValue });
        syncToSupabase(get());
        return true;
      },
    }),
    {
      name: 'soul_coins_economy',
      partialize: (state) => ({
        soulCoins: state.soulCoins,
        totalCoinsEarned: state.totalCoinsEarned,
        seasonXP: state.seasonXP,
        seasonLevel: state.seasonLevel,
        streakDays: state.streakDays,
        lastLoginDate: state.lastLoginDate,
        winStreak: state.winStreak,
        cratesCount: state.cratesCount,
        inventory: state.inventory,
        equipped: state.equipped,
        dailyQuests: state.dailyQuests,
        weeklyQuests: state.weeklyQuests,
        unlockedPassTiers: state.unlockedPassTiers,
        claimedPassTiers: state.claimedPassTiers,
        equippedAvatarStyle: state.equippedAvatarStyle,
        ownedAvatarStyles: state.ownedAvatarStyles,
      }),
    }
  )
);
