/**
 * economyCatalog.js
 * Definitions for SouL Coins items, 50-tier Pass, Mystery Crates drop rates, and Economic Ranks.
 */

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

export const STORE_ITEMS = [
  // ─── 1. Outfits & Clothes ──────────────────────────────────────────────────
  {
    id: 'outfit_detective',
    category: 'outfits',
    name: 'Detective Trenchcoat',
    rarity: 'rare',
    price: 600,
    icon: '🧥',
    desc: 'Classic noir style for the eagle-eyed civilian.',
    accent: '#3b82f6',
  },
  {
    id: 'outfit_cyber_visor',
    category: 'outfits',
    name: 'Cyberpunk Visor',
    rarity: 'epic',
    price: 1200,
    icon: '🥽',
    desc: 'HUD analysis to spot lies across neon grids.',
    accent: '#a855f7',
  },
  {
    id: 'outfit_impostor_mask',
    category: 'outfits',
    name: 'Impostor Phantom Mask',
    rarity: 'legendary',
    price: 2500,
    icon: '🎭',
    desc: 'Shifting obsidian mask that conceals all tells.',
    accent: '#f59e0b',
  },
  {
    id: 'outfit_neon_hoodie',
    category: 'outfits',
    name: 'Neon Rebel Hoodie',
    rarity: 'common',
    price: 350,
    icon: '🥼',
    desc: 'Comfy streetwear glowing with cybernetic flair.',
    accent: '#94a3b8',
  },
  {
    id: 'outfit_space_suit',
    category: 'outfits',
    name: 'Astro Infiltrator Suit',
    rarity: 'epic',
    price: 1500,
    icon: '🧑‍🚀',
    desc: 'Pressurized stealth suit built for sabotage.',
    accent: '#8b5cf6',
  },
  {
    id: 'outfit_royal_cloak',
    category: 'outfits',
    name: 'Sovereign Velvet Cape',
    rarity: 'legendary',
    price: 3000,
    icon: '🦹',
    desc: 'Worn only by the true sovereigns of deduction.',
    accent: '#f59e0b',
  },

  // ─── 2. Avatar Accessories ─────────────────────────────────────────────────
  {
    id: 'acc_glowing_border',
    category: 'accessories',
    name: 'Lobby Plasma Ring',
    rarity: 'rare',
    price: 500,
    icon: '⭕',
    desc: 'A shimmering ring of plasma around your player card.',
    accent: '#06b6d4',
  },
  {
    id: 'acc_cyber_halo',
    category: 'accessories',
    name: 'Cybernetic Halo',
    rarity: 'epic',
    price: 1100,
    icon: '😇',
    desc: 'A floating holographic crest of pure deception.',
    accent: '#d946ef',
  },
  {
    id: 'acc_golden_aura',
    category: 'accessories',
    name: 'Radiant Sunburst Aura',
    rarity: 'legendary',
    price: 2200,
    icon: '✨',
    desc: 'Gold particles orbit your avatar in real-time.',
    accent: '#eab308',
  },
  {
    id: 'acc_detective_badge',
    category: 'accessories',
    name: 'Chief Inspector Badge',
    rarity: 'common',
    price: 250,
    icon: '🎖️',
    desc: 'Polished silver star proving your civic duty.',
    accent: '#64748b',
  },
  {
    id: 'acc_demon_horns',
    category: 'accessories',
    name: 'Infernal Neon Horns',
    rarity: 'epic',
    price: 1400,
    icon: '😈',
    desc: 'Embrace your inner betrayer with violet flame.',
    accent: '#ec4899',
  },

  // ─── 3. Emotes & Expressions ──────────────────────────────────────────────
  {
    id: 'emote_hush',
    category: 'emotes',
    name: '🤫 Hush',
    rarity: 'common',
    price: 150,
    icon: '🤫',
    desc: 'Keep quiet when the suspicious questions fly.',
    accent: '#94a3b8',
  },
  {
    id: 'emote_inspect',
    category: 'emotes',
    name: '🔍 Inspect',
    rarity: 'rare',
    price: 300,
    icon: '🔍',
    desc: 'Scan the room for false slip-ups and sweaty palms.',
    accent: '#3b82f6',
  },
  {
    id: 'emote_crown',
    category: 'emotes',
    name: '👑 Crown',
    rarity: 'legendary',
    price: 1200,
    icon: '👑',
    desc: 'Flex your victory over the baffled lobby.',
    accent: '#eab308',
  },
  {
    id: 'emote_mystery',
    category: 'emotes',
    name: '🎭 Mystery',
    rarity: 'rare',
    price: 350,
    icon: '🎭',
    desc: 'Are you the civilian, or are you Mr. White?',
    accent: '#8b5cf6',
  },
  {
    id: 'emote_on_fire',
    category: 'emotes',
    name: '🔥 On Fire',
    rarity: 'epic',
    price: 700,
    icon: '🔥',
    desc: 'Celebrate an unstoppable winning streak.',
    accent: '#f97316',
  },
  {
    id: 'emote_mind_blown',
    category: 'emotes',
    name: '🤯 Mind Blown',
    rarity: 'rare',
    price: 400,
    icon: '🤯',
    desc: 'When the impostor reveals the truth at the end.',
    accent: '#ec4899',
  },

  // ─── 4. Screen FX ─────────────────────────────────────────────────────────
  {
    id: 'fx_matrix_rain',
    category: 'screenFX',
    name: 'Matrix Digital Rain',
    rarity: 'epic',
    price: 1000,
    icon: '🟢',
    desc: 'Green code cascades during your role reveal.',
    accent: '#22c55e',
  },
  {
    id: 'fx_cosmic_void',
    category: 'screenFX',
    name: 'Cosmic Supernova Void',
    rarity: 'legendary',
    price: 2400,
    icon: '🌌',
    desc: 'Deep purple cosmic nebula explosion upon victory.',
    accent: '#a855f7',
  },
  {
    id: 'fx_cyber_glitch',
    category: 'screenFX',
    name: 'Cyber Glitch Strobe',
    rarity: 'rare',
    price: 650,
    icon: '⚡',
    desc: 'Static chromatic aberration when voting begins.',
    accent: '#06b6d4',
  },
  {
    id: 'fx_gold_confetti',
    category: 'screenFX',
    name: 'Royal Gold Confetti',
    rarity: 'rare',
    price: 550,
    icon: '🎉',
    desc: 'Luxurious gold ribbons shower the winning team.',
    accent: '#eab308',
  },
  {
    id: 'fx_blood_moon',
    category: 'screenFX',
    name: 'Crimson Eclipse',
    rarity: 'legendary',
    price: 2600,
    icon: '🩸',
    desc: 'Blood red cinematic flare when Impostors conquer.',
    accent: '#ef4444',
  },

  // ─── 5. Banners & Titles ──────────────────────────────────────────────────
  {
    id: 'title_novice',
    category: 'titles',
    name: 'Novice',
    rarity: 'common',
    price: 0,
    icon: '🌱',
    desc: 'Default title for fresh recruits.',
    accent: '#94a3b8',
  },
  {
    id: 'title_mastermind',
    category: 'titles',
    name: 'The Mastermind',
    rarity: 'legendary',
    price: 1800,
    icon: '🧠',
    desc: 'Plays both sides and never gives up the word.',
    accent: '#f59e0b',
  },
  {
    id: 'title_infiltrator',
    category: 'titles',
    name: 'Infiltrator',
    rarity: 'epic',
    price: 900,
    icon: '🕶️',
    desc: 'Walks among civilians without a ripple.',
    accent: '#8b5cf6',
  },
  {
    id: 'title_bluff_king',
    category: 'titles',
    name: 'Bluff King',
    rarity: 'rare',
    price: 600,
    icon: '🃏',
    desc: 'Makes everyone vote out their own best friend.',
    accent: '#3b82f6',
  },
  {
    id: 'title_ghost',
    category: 'titles',
    name: 'Silent Phantom',
    rarity: 'rare',
    price: 550,
    icon: '👻',
    desc: 'Speaks two words and still escapes the vote.',
    accent: '#06b6d4',
  },
  {
    id: 'title_soul_legend',
    category: 'titles',
    name: 'SouL Legend',
    rarity: 'legendary',
    price: 3500,
    icon: '👑',
    desc: 'The undisputed grand champion of Undercover.',
    accent: '#eab308',
  },
];

// ─── Daily Streak Ladder ────────────────────────────────────────────────────
export const STREAK_LADDER = [
  { day: 1, sc: 50, crate: null, label: '+50 SC' },
  { day: 2, sc: 100, crate: null, label: '+100 SC' },
  { day: 3, sc: 150, crate: null, label: '+150 SC' },
  { day: 4, sc: 200, crate: null, label: '+200 SC' },
  { day: 5, sc: 300, crate: null, label: '+300 SC' },
  { day: 6, sc: 500, crate: null, label: '+500 SC' },
  { day: 7, sc: 1000, crate: 'epic', label: '+1,000 SC & Free Epic Crate' },
];

// ─── 50-Tier Progression Pass Generation ────────────────────────────────────
// Formula: Tier Level requires level * 200 XP.
export function generatePassTiers() {
  const tiers = [];
  for (let level = 1; level <= 50; level++) {
    const xpRequired = level * 200;
    let reward = null;

    if (level === 10) {
      reward = { type: 'item', itemId: 'outfit_cyber_visor', name: 'Cyberpunk Visor', icon: '🥽', rarity: 'epic', sc: 300 };
    } else if (level === 20) {
      reward = { type: 'item', itemId: 'acc_cyber_halo', name: 'Cybernetic Halo', icon: '😇', rarity: 'epic', sc: 400 };
    } else if (level === 30) {
      reward = { type: 'item', itemId: 'fx_matrix_rain', name: 'Matrix Digital Rain FX', icon: '🟢', rarity: 'epic', sc: 500 };
    } else if (level === 40) {
      reward = { type: 'item', itemId: 'outfit_impostor_mask', name: 'Legendary Phantom Mask', icon: '🎭', rarity: 'legendary', sc: 800 };
    } else if (level === 50) {
      reward = { type: 'item', itemId: 'fx_cosmic_void', name: 'Cosmic Supernova Void & SouL Legend', icon: '🌌', rarity: 'legendary', sc: 1500, extraTitle: 'title_soul_legend' };
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
