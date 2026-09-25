/**
 * defaultPacks.js
 * Built-in category pools and word packs for Undercover.
 */

import { STANDARDIZED_WORD_PACKS } from './wordPacks.js';

export const DEFAULT_PACKS = STANDARDIZED_WORD_PACKS.map((pack) => ({
  id: pack.id,
  name: pack.title,
  title: pack.title,
  titleEn: pack.titleEn,
  icon: pack.icon,
  description: pack.description,
  price: pack.price,
  isFree: pack.isFree,
  builtin: true,
  words: pack.words,
  pairs: pack.pairs,
}));

/** Flatten all static pairs from built-in packs */
export const ALL_BUILTIN_PAIRS = DEFAULT_PACKS.flatMap((pack) =>
  (pack.pairs || []).map((pair) => ({
    ...pair,
    packId: pack.id,
    packName: pack.name,
    category: pack.name,
  }))
);

export default DEFAULT_PACKS;
