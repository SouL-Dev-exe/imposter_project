/**
 * economyStore.js
 * Purely client-side state store for SouL Coins (SC), Season Pass, Store, Quests, and Mystery Crates.
 * Fully persisted in LocalStorage under key 'soul_coins_economy'.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateMatchRewards } from '../utils/economyRewards';
import { STORE_ITEMS, STREAK_LADDER, PASS_TIERS, RARITIES } from '../data/economyCatalog';

const DEFAULT_DAILY_QUESTS = [
  { id: 'q1', desc: 'Play 3 matches', progress: 0, target: 3, reward: 150, claimed: false },
  { id: 'q2', desc: 'Win 1 match as Impostor', progress: 0, target: 1, reward: 200, claimed: false },
  { id: 'q3', desc: 'Vote correctly against Impostor', progress: 0, target: 1, reward: 100, claimed: false },
];

const DEFAULT_WEEKLY_QUESTS = [
  { id: 'w1', desc: 'Play 20 matches', progress: 0, target: 20, reward: 1000, claimed: false },
  { id: 'w2', desc: 'Complete 10 daily quests', progress: 0, target: 10, reward: 1500, rewardCrate: 'epic', claimed: false },
];

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

export const useEconomyStore = create(
  persist(
    (set, get) => ({
      soulCoins: 500,
      totalCoinsEarned: 500,
      seasonXP: 0,
      seasonLevel: 1,
      streakDays: 1,
      lastLoginDate: getTodayString(),
      winStreak: 0,
      cratesCount: 0,
      streakRewardPending: null,

      inventory: {
        outfits: [],
        accessories: [],
        emotes: ['emote_hush'],
        screenFX: [],
        titles: ['title_novice'],
      },

      equipped: {
        outfit: null,
        accessory: null,
        emote: 'emote_hush',
        screenFX: null,
        title: 'title_novice',
      },

      dailyQuests: DEFAULT_DAILY_QUESTS,
      weeklyQuests: DEFAULT_WEEKLY_QUESTS,
      unlockedPassTiers: [1],
      claimedPassTiers: [],

      // ─── 1. Startup & Daily Login Check ────────────────────────────────────
      checkDailyLogin: () => {
        const today = getTodayString();
        const { lastLoginDate, streakDays } = get();

        if (lastLoginDate === today) {
          // Already logged in today
          return null;
        }

        const diff = getDayDiff(lastLoginDate, today);
        let newStreak = streakDays;

        if (diff === 1) {
          // Consecutive day
          newStreak = Math.min(streakDays + 1, 7);
        } else if (diff > 1) {
          // Missed > 1 day, reset streak
          newStreak = 1;
        }

        // Streak ladder reward
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
          // Refresh daily quests if new day
          dailyQuests: DEFAULT_DAILY_QUESTS,
        }));

        return {
          day: newStreak,
          sc: scReward,
          crate: ladderReward.crate,
        };
      },

      clearStreakNotification: () => {
        set({ streakRewardPending: null });
      },

      // ─── 2. Match Rewards Execution ────────────────────────────────────────
      recordMatchOutcome: ({
        isVictory = false,
        isCorrectVote = false,
        isImpostor = false,
      }) => {
        const state = get();
        const breakdown = calculateMatchRewards({
          isVictory,
          isCorrectVote,
          currentWinStreak: state.winStreak,
          currentXP: state.seasonXP,
          currentLevel: state.seasonLevel,
        });

        // Compute unlocked pass tiers up to newLevel
        const newUnlockedTiers = Array.from({ length: breakdown.newLevel }, (_, i) => i + 1);

        // Update Quest progress
        const updatedDailyQuests = state.dailyQuests.map((q) => {
          let add = 0;
          if (q.id === 'q1') add = 1; // Play 3 matches
          if (q.id === 'q2' && isImpostor && isVictory) add = 1; // Win as Impostor
          if (q.id === 'q3' && isCorrectVote) add = 1; // Correct vote
          return {
            ...q,
            progress: Math.min(q.target, q.progress + add),
          };
        });

        const updatedWeeklyQuests = state.weeklyQuests.map((q) => {
          let add = 0;
          if (q.id === 'w1') add = 1; // Play 20 matches
          return {
            ...q,
            progress: Math.min(q.target, q.progress + add),
          };
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

        return breakdown;
      },

      // ─── 3. Quest Claiming ─────────────────────────────────────────────────
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

        // If daily quest claimed, bump weekly quest w2 (Complete 10 daily quests)
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

        return true;
      },

      // ─── 4. SouL Store Purchases & Equipping ────────────────────────────────
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
          inventory: {
            ...s.inventory,
            [category]: newCategoryInventory,
          },
          equipped: {
            ...s.equipped,
            ...(shouldAutoEquip ? { [category]: itemId } : {}),
          },
        }));

        return { success: true, item };
      },

      equipItem: (category, itemId) => {
        const { inventory } = get();
        if (itemId && !inventory[category]?.includes(itemId)) {
          return false;
        }
        set((s) => ({
          equipped: {
            ...s.equipped,
            [category]: itemId,
          },
        }));
        return true;
      },

      unequipItem: (category) => {
        set((s) => ({
          equipped: {
            ...s.equipped,
            [category]: category === 'title' ? 'title_novice' : null,
          },
        }));
      },

      // ─── 5. SouL Pass Claims ───────────────────────────────────────────────
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

        return claimable.length;
      },

      // ─── 6. Mystery Crates (Loot Box Engine with Duplicate Protection) ──────
      openCrate: () => {
        const { cratesCount, soulCoins, inventory } = get();
        const CRATE_COST = 1000;
        const usedFreeCrate = cratesCount > 0;

        if (!usedFreeCrate && soulCoins < CRATE_COST) {
          return { success: false, error: 'Insufficient SouL Coins (1,000 SC required)' };
        }

        // RNG Drop Probabilities: Common (50%), Rare (30%), Epic (15%), Legendary (5%)
        const roll = Math.random();
        let selectedRarity = 'common';
        if (roll < RARITIES.legendary.dropRate) {
          selectedRarity = 'legendary';
        } else if (roll < RARITIES.legendary.dropRate + RARITIES.epic.dropRate) {
          selectedRarity = 'epic';
        } else if (roll < RARITIES.legendary.dropRate + RARITIES.epic.dropRate + RARITIES.rare.dropRate) {
          selectedRarity = 'rare';
        } else {
          selectedRarity = 'common';
        }

        // Pick an item from STORE_ITEMS with selected rarity
        const candidateItems = STORE_ITEMS.filter((i) => i.rarity === selectedRarity);
        const rolledItem =
          candidateItems[Math.floor(Math.random() * candidateItems.length)] || STORE_ITEMS[0];

        // Duplicate Safeguard: If already owned in inventory, automatically trigger 50% SC Refund (+500 SC)
        const isDuplicate = Boolean(inventory[rolledItem.category]?.includes(rolledItem.id));
        const refundAmount = isDuplicate ? 500 : 0;

        // Apply deduction & additions
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

          return {
            cratesCount: newCratesCount,
            soulCoins: newSC,
            inventory: updatedInventory,
          };
        });

        return {
          success: true,
          item: rolledItem,
          rarity: selectedRarity,
          isDuplicate,
          refundAmount,
          usedFreeCrate,
        };
      },
    }),
    {
      name: 'soul_coins_economy',
    }
  )
);
