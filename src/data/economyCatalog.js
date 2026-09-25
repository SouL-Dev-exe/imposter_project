/**
 * economyCatalog.js
 * Definitions for SouL Coins items, 50-tier Pass, Mystery Crates drop rates, and Economic Ranks.
 */
import { STORE_ITEMS } from './shopItems';
import { AVATAR_STYLES } from './avatarStyles';

export { STORE_ITEMS, AVATAR_STYLES };

export const ECONOMIC_RANKS = [
  { id: 'bronze', name: 'Bronze', minSC: 0, color: 'text-amber-600', border: 'border-amber-600/40', bg: 'bg-amber-600/10', icon: '🥉' },
  { id: 'silver', name: 'Silver', minSC: 1000, color: 'text-slate-300', border: 'border-slate-300/40', bg: 'bg-slate-300/10', icon: '🥈' },
  { id: 'gold', name: 'Gold', minSC: 5000, color: 'text-yellow-400', border: 'border-yellow-400/40', bg: 'bg-yellow-400/10', icon: '🥇' },
  { id: 'platinum', name: 'Platinum', minSC: 15000, color: 'text-cyan-400', border: 'border-cyan-400/40', bg: 'bg-cyan-400/10', icon: '💠' },
  { id: 'diamond', name: 'Diamond', minSC: 30000, color: 'text-sky-300', border: 'border-sky-300/40', bg: 'bg-sky-300/10', icon: '💎' },
  { id: 'master', name: 'SouL Master', minSC: 50000, color: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-400/10', icon: '👑' },
];

export function getEconomicRank(totalEarnedSC = 0) {
  for (let i = ECONOMIC_RANKS.length - 1; i >= 0; i--) {
    if (totalEarnedSC >= ECONOMIC_RANKS[i].minSC) {
      return ECONOMIC_RANKS[i];
    }
  }
  return ECONOMIC_RANKS[0];
}

export function normalizeCategory(category) {
  if (!category) return '';
  const c = category.toLowerCase();
  if (c === 'outfit' || c === 'outfits') return 'outfit';
  if (c === 'accessory' || c === 'accessories') return 'accessory';
  if (c === 'emote' || c === 'emotes') return 'emote';
  if (c === 'screenfx' || c === 'screen_fx') return 'screenFX';
  if (c === 'title' || c === 'titles') return 'title';
  return category;
}

export function normalizeInventoryCategory(category) {
  if (!category) return '';
  const c = category.toLowerCase();
  if (c === 'outfit' || c === 'outfits') return 'outfits';
  if (c === 'accessory' || c === 'accessories') return 'accessories';
  if (c === 'emote' || c === 'emotes') return 'emotes';
  if (c === 'screenfx' || c === 'screen_fx') return 'screenFX';
  if (c === 'title' || c === 'titles') return 'titles';
  return category;
}

export const RARITIES = {
  common: { id: 'common', name: 'Common', color: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500/10', dropRate: 0.50 },
  rare: { id: 'rare', name: 'Rare', color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10', dropRate: 0.30 },
  epic: { id: 'epic', name: 'Epic', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', dropRate: 0.15 },
  legendary: { id: 'legendary', name: 'Legendary', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', dropRate: 0.05 },
};

// ─── Daily Streak Ladder (+50 to +250 SC) ───────────────────────────────────
export const STREAK_LADDER = [
  { day: 1, sc: 50, crate: null, label: '+50 SC' },
  { day: 2, sc: 75, crate: null, label: '+75 SC' },
  { day: 3, sc: 100, crate: null, label: '+100 SC' },
  { day: 4, sc: 125, crate: null, label: '+125 SC' },
  { day: 5, sc: 150, crate: null, label: '+150 SC' },
  { day: 6, sc: 200, crate: null, label: '+200 SC' },
  { day: 7, sc: 250, crate: 'epic', label: '+250 SC & Free Epic Crate' },
];

// ─── 50-Tier Progression Pass Generation ────────────────────────────────────
export function generatePassTiers() {
  const tiers = [];
  for (let level = 1; level <= 50; level++) {
    const xpRequired = level * 200;
    let reward = null;

    if (level === 10) {
      reward = { type: 'item', itemId: 'outfit_cyber_visor', name: 'Cyberpunk Visor Suit', icon: '🥽', rarity: 'rare', sc: 300 };
    } else if (level === 20) {
      reward = { type: 'item', itemId: 'acc_cyber_halo', name: 'Cybernetic Halo', icon: '😇', rarity: 'rare', sc: 400 };
    } else if (level === 30) {
      reward = { type: 'item', itemId: 'fx_matrix_rain', name: 'Matrix Digital Rain FX', icon: '🟢', rarity: 'rare', sc: 500 };
    } else if (level === 40) {
      reward = { type: 'item', itemId: 'outfit_impostor_mask', name: 'Impostor Phantom Mask', icon: '🎭', rarity: 'legendary', sc: 800 };
    } else if (level === 50) {
      reward = { type: 'item', itemId: 'fx_cosmic_void', name: 'Cosmic Supernova Void & Apex Title', icon: '🌌', rarity: 'legendary', sc: 1500, extraTitle: 'title_apex_imposter' };
    } else if (level % 5 === 0) {
      reward = { type: 'crate', name: 'Free Epic Mystery Crate', icon: '🎁', crates: 1, sc: 250 };
    } else {
      const scVal = 100 + ((level % 4) * 50);
      reward = { type: 'coins', sc: scVal, name: `+${scVal} SouL Coins`, icon: '🪙' };
    }

    tiers.push({
      level,
      xpRequired,
      isMilestone: [10, 20, 30, 40, 50].includes(level),
      reward,
    });
  }
  return tiers;
}

export const PASS_TIERS = generatePassTiers();

/**
 * Universal lookup helper to resolve any item by ID or Name
 */
export function getStoreItem(idOrName) {
  if (!idOrName) return null;
  const clean = String(idOrName).trim();
  const lower = clean.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9]/g, '');

  return (
    STORE_ITEMS.find((i) => i.id === clean) ||
    STORE_ITEMS.find((i) => i.name.toLowerCase() === lower) ||
    STORE_ITEMS.find((i) => i.name.toLowerCase().replace(/[^a-z0-9]/g, '') === stripped) ||
    STORE_ITEMS.find((i) => i.id.replace(/^title_|^outfit_|^acc_|^emote_|^fx_/, '') === stripped) ||
    null
  );
}
