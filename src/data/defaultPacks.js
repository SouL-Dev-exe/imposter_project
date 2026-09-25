/**
 * defaultPacks.js
 * Built-in category pools and word packs for Undercover.
 */

import { wordPacks } from './wordPacks.js';

export const DEFAULT_PACKS = wordPacks.map((pack) => ({
  id: pack.id,
  name: pack.category,
  category: pack.category,
  categoryEn: pack.categoryEn,
  icon: pack.icon,
  price: pack.price,
  isFree: pack.isFree,
  builtin: true,
  words: pack.words,
  pairs: [],
}));

export const ALL_BUILTIN_PAIRS = [];

export default DEFAULT_PACKS;
