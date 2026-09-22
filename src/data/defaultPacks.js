/**
 * defaultPacks.js
 * Built-in category pools for the Undercover / Pretender game.
 * Uses dynamic CATEGORY_POOLS with 20+ words each for zero memorization.
 */

import { CATEGORY_POOLS } from './categoryPools.js';

export const DEFAULT_PACKS = CATEGORY_POOLS.map((pool) => ({
  id: pool.id,
  name: pool.category,
  icon: pool.icon,
  builtin: true,
  words: pool.words,
  pairs: [],
}));

/** Flatten all static pairs from built-in packs if any */
export const ALL_BUILTIN_PAIRS = DEFAULT_PACKS.flatMap((pack) =>
  (pack.pairs || []).map((pair) => ({ ...pair, packId: pack.id, packName: pack.name }))
);
