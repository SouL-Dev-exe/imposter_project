/**
 * gameLogic.js
 * Pure functions for all core game mechanics:
 *  - Role assignment
 *  - Win condition checking
 *  - Final guess evaluation
 */

import { ALL_BUILTIN_PAIRS } from '../data/defaultPacks.js';
import { CATEGORY_POOLS } from '../data/categoryPools.js';

// ─── Role types ──────────────────────────────────────────────────────────────
export const ROLES = {
  CIVILIAN: 'civilian',
  IMPOSTOR: 'impostor',
  MR_WHITE: 'mrwhite',
  FAKE_IMPOSTOR: 'fake_impostor',
};

// ─── Game modes ──────────────────────────────────────────────────────────────
export const GAME_MODES = {
  CONSCIOUS: 'conscious', // Impostor knows they are the impostor, sees only the category
  BLIND: 'blind',         // Impostor sees Word B (different word), doesn't know they're the impostor
};

/**
 * Shuffle an array in-place using Fisher-Yates.
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Random Pair Picker Logic from Dynamic Category Pools.
 * Draws 2 unique words from the chosen category pool and randomizes wordA/wordB 50% of the time.
 * @param {object|string} [categoryPool] - specific category pool or category name/id, or null for random
 * @returns {{ wordA: string, wordB: string, category: string }}
 */
export function getRandomPairFromPool(categoryPool) {
  // If categoryPool is a string, find matching pool by category name or id
  let pool = categoryPool;
  if (typeof categoryPool === 'string') {
    pool = CATEGORY_POOLS.find(
      (c) => c.category === categoryPool || c.id === categoryPool
    );
  }

  // Pick a random category if none passed or not found
  if (!pool || !pool.words || pool.words.length < 2) {
    pool = CATEGORY_POOLS[Math.floor(Math.random() * CATEGORY_POOLS.length)];
  }

  // Shuffle words array and pick top 2
  const shuffledWords = [...pool.words].sort(() => Math.random() - 0.5);

  const wordA = shuffledWords[0];
  const wordB = shuffledWords[1];

  // Randomize assignment order so wordA isn't always Civilian
  const flip = Math.random() < 0.5;

  return {
    wordA: flip ? wordA : wordB,
    wordB: flip ? wordB : wordA,
    category: pool.category,
  };
}

/**
 * Pick a random word pair from the selected pack / all packs.
 * Falls back to dynamic category pools if no static pairs exist.
 * @param {string|null} packId - specific pack id or null for random
 * @param {Array} customPacks - user's custom packs from localStorage
 * @param {Array} cloudPacks - packs from Supabase
 */
export function pickRandomPair(packId, customPacks = [], cloudPacks = []) {
  // Check if packId corresponds to a category pool
  const matchingPool = CATEGORY_POOLS.find(
    (c) => c.id === packId || c.category === packId
  );
  if (matchingPool) {
    return getRandomPairFromPool(matchingPool);
  }

  const allPairs = [...ALL_BUILTIN_PAIRS];

  // Merge custom pack pairs (locally created)
  for (const cp of customPacks) {
    for (const pair of cp.pairs || []) {
      allPairs.push({ ...pair, packId: cp.id, packName: cp.name });
    }
  }

  // Merge cloud pack pairs (from Supabase)
  for (const cp of cloudPacks) {
    for (const pair of cp.pairs || []) {
      allPairs.push({ ...pair, packId: cp.id, packName: cp.name });
    }
  }

  let pool = allPairs;
  if (packId && packId !== 'all') {
    pool = allPairs.filter((p) => p.packId === packId);
  }

  if (pool.length === 0) {
    return getRandomPairFromPool();
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Assign roles to players and set their secret words.
 *
 * @param {string[]|object[]} playerNames
 * @param {'conscious'|'blind'|object} gameModeOrOptions
 * @param {object} [optionsOrWordPair]
 * @param {object} [maybeWordPair]
 * @returns {object[]} players with { id, name, role, word, category, hasRevealed: false, isEliminated: false }
 */
export function assignRoles(playerNames, gameModeOrOptions, optionsOrWordPair, maybeWordPair) {
  let gameMode = GAME_MODES.CONSCIOUS;
  let options = {};
  let wordPair = {};

  if (maybeWordPair !== undefined) {
    gameMode = gameModeOrOptions;
    options = optionsOrWordPair || {};
    wordPair = maybeWordPair || {};
  } else {
    options = gameModeOrOptions || {};
    wordPair = optionsOrWordPair || {};
    gameMode = options.gameMode || GAME_MODES.CONSCIOUS;
  }

  if (!wordPair || !wordPair.wordA) {
    wordPair = getRandomPairFromPool();
  }

  const total = playerNames.length;
  let roles = [];

  // Determine how many special roles exist
  if (options.undercoverCouple && total >= 6) {
    roles.push(ROLES.IMPOSTOR, ROLES.IMPOSTOR);
  } else {
    roles.push(ROLES.IMPOSTOR);
  }

  if (options.mrWhite && total >= 4) {
    roles.push(ROLES.MR_WHITE);
  }

  // Add Fake Impostor if enabled and 6+ players
  if (options.fakeImpostor && total >= 6) {
    roles.push(ROLES.FAKE_IMPOSTOR);
  }

  // Fill the rest with Civilians
  while (roles.length < total) {
    roles.push(ROLES.CIVILIAN);
  }

  // Shuffle roles randomly
  roles = shuffle(roles);

  return playerNames.map((player, index) => {
    const role = roles[index];
    let word = wordPair.wordA; // Default Civilian word

    if (role === ROLES.IMPOSTOR) {
      if (gameMode === GAME_MODES.CONSCIOUS && options.gameMode !== GAME_MODES.BLIND) {
        word = '';
      } else {
        word = wordPair.wordB;
      }
    } else if (role === ROLES.MR_WHITE) {
      word = '';
    } else if (role === ROLES.FAKE_IMPOSTOR || role === 'fake_impostor') {
      // Fake Impostor gets wordB so they receive a related secondary word to bluff with
      word = wordPair.wordB;
    }

    const playerName = typeof player === 'object' ? player.name : player;
    const playerId = typeof player === 'object' && player.id ? player.id : `player-${index}`;

    return {
      ...(typeof player === 'object' ? player : {}),
      id: playerId,
      name: playerName,
      role,
      word,
      category: wordPair.category,
      hasRevealed: false,
      isEliminated: false,
    };
  });
}

/**
 * Tally votes and return the player name with the most votes.
 * In case of a tie, returns null.
 * @param {object} votes  - { voterName: votedForName }
 * @returns {{ eliminated: string|null, isTie: boolean, tally: object }}
 */
export function tallyVotes(votes) {
  const tally = {};
  for (const voted of Object.values(votes)) {
    tally[voted] = (tally[voted] || 0) + 1;
  }

  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return { eliminated: null, isTie: false, tally };

  const [topName, topCount] = entries[0];
  const isTie = entries.length > 1 && entries[1][1] === topCount;

  return { eliminated: isTie ? null : topName, isTie, tally };
}

/**
 * Check the win condition after a vote elimination.
 *
 * @param {object[]} players  - all player objects
 * @param {string|null} eliminatedName  - name of eliminated player (null = tie)
 * @param {'conscious'|'blind'} gameMode
 * @returns {{ phase: 'fake_impostor_win'|'impostor_final_guess'|'civilians_win'|'impostors_win'|'continue', eliminatedPlayer: object|null }}
 */
export function checkWinCondition(players, eliminatedName, gameMode) {
  if (!eliminatedName) {
    // Tie: nobody is eliminated, game continues
    return { phase: 'continue', eliminatedPlayer: null };
  }

  const eliminatedPlayer = players.find((p) => p.name === eliminatedName);
  if (!eliminatedPlayer) return { phase: 'continue', eliminatedPlayer: null };

  // Fake Impostor instant win
  if (eliminatedPlayer.role === ROLES.FAKE_IMPOSTOR || eliminatedPlayer.role === 'fake_impostor') {
    return { phase: 'fake_impostor_win', eliminatedPlayer };
  }

  const isImpostor =
    eliminatedPlayer.role === ROLES.IMPOSTOR ||
    eliminatedPlayer.role === ROLES.MR_WHITE;

  if (isImpostor) {
    // The impostor was caught — they get a final guess
    return { phase: 'impostor_final_guess', eliminatedPlayer };
  }

  // An innocent was eliminated — impostors win
  return { phase: 'impostors_win', eliminatedPlayer };
}

/**
 * Evaluate the impostor's final word guess.
 * @param {string} guess
 * @param {string} secretWord  - the civilians' Word A
 * @returns {boolean}
 */
export function evaluateFinalGuess(guess, secretWord) {
  if (!guess || !secretWord) return false;
  return guess.trim().toLowerCase() === secretWord.trim().toLowerCase();
}

/**
 * Generate candidate choices for the final guess (including the correct secretWord and distractors).
 * @param {string} secretWord
 * @param {object} [wordPair]
 * @param {number} [count=4]
 * @returns {string[]} shuffled list of choice words
 */
export function generateFinalGuessChoices(secretWord, wordPair = null, count = 4) {
  if (!secretWord) return [];

  const choices = new Set();
  choices.add(secretWord);

  if (wordPair?.wordB && wordPair.wordB.toLowerCase() !== secretWord.toLowerCase()) {
    choices.add(wordPair.wordB);
  }

  // Gather distractor words from ALL_BUILTIN_PAIRS
  const candidates = [];
  for (const p of ALL_BUILTIN_PAIRS) {
    if (p.wordA && p.wordA.toLowerCase() !== secretWord.toLowerCase()) {
      candidates.push(p.wordA);
    }
    if (p.wordB && p.wordB.toLowerCase() !== secretWord.toLowerCase()) {
      candidates.push(p.wordB);
    }
  }

  // Shuffle candidate pool and pick distractors until we reach `count`
  const shuffledCandidates = shuffle(candidates);
  for (const word of shuffledCandidates) {
    if (choices.size >= count) break;
    choices.add(word);
  }

  // Convert set back to array and shuffle options so secretWord isn't always first
  return shuffle(Array.from(choices));
}

/**
 * Generate a unique ID string.
 */
export function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

