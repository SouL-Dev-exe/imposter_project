/**
 * defaultPacks.js
 * Built-in word pairs for the Undercover / Pretender game.
 * Each pair has: wordA (civilian), wordB (impostor), category, and an id.
 */

export const DEFAULT_PACKS = [];

/** Flatten all pairs from all built-in packs into a single array */
export const ALL_BUILTIN_PAIRS = DEFAULT_PACKS.flatMap((pack) =>
  pack.pairs.map((pair) => ({ ...pair, packId: pack.id, packName: pack.name }))
);
