// src/data/categoryPools.js
import { STANDARDIZED_WORD_PACKS } from './wordPacks.js';

export const CATEGORY_POOLS = STANDARDIZED_WORD_PACKS.map((pack) => ({
  id: pack.id,
  icon: pack.icon,
  category: pack.title,
  titleEn: pack.titleEn,
  description: pack.description,
  price: pack.price,
  isFree: pack.isFree,
  words: pack.words,
  pairs: pack.pairs,
}));

export default CATEGORY_POOLS;
