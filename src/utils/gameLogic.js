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
 * Pick ONE random pack from the selected packs/categories,
 * and then choose TWO distinct words from that SAME pack.
 * This guarantees civilian and undercover words are ALWAYS from the same category.
 *
 * @param {object|string|string[]} [categoryPoolOrCategories] - specific category pool, array of category IDs, or 'all'/null
 * @param {Array} [customPacks=[]]
 * @param {Array} [cloudPacks=[]]
 * @returns {{ wordA: string, wordB: string, civilian: string, undercover: string, civilianWord: string, undercoverWord: string, category: string, mrWhiteCategory: string }}
 */
export function getRandomPairFromPool(categoryPoolOrCategories, customPacks = [], cloudPacks = []) {
  const allAvailablePacks = [...CATEGORY_POOLS, ...customPacks, ...cloudPacks];
  let activePacks = [];

  if (Array.isArray(categoryPoolOrCategories)) {
    if (categoryPoolOrCategories.includes('all') || categoryPoolOrCategories.length === 0) {
      activePacks = allAvailablePacks;
    } else {
      activePacks = allAvailablePacks.filter(
        (p) =>
          categoryPoolOrCategories.includes(p.id) ||
          categoryPoolOrCategories.includes(p.category) ||
          categoryPoolOrCategories.includes(p.name)
      );
    }
  } else if (typeof categoryPoolOrCategories === 'string') {
    if (categoryPoolOrCategories === 'all' || !categoryPoolOrCategories) {
      activePacks = allAvailablePacks;
    } else {
      activePacks = allAvailablePacks.filter(
        (p) =>
          p.id === categoryPoolOrCategories ||
          p.category === categoryPoolOrCategories ||
          p.name === categoryPoolOrCategories
      );
    }
  } else if (categoryPoolOrCategories && typeof categoryPoolOrCategories === 'object') {
    activePacks = [categoryPoolOrCategories];
  } else {
    activePacks = allAvailablePacks;
  }

  // Fallback if no matching packs found
  if (!activePacks || activePacks.length === 0) {
    activePacks = CATEGORY_POOLS;
  }

  // 1. Pick ONE random pack from the selected active packs
  const selectedPack = activePacks[Math.floor(Math.random() * activePacks.length)] || CATEGORY_POOLS[0];

  let civilianWord = 'تفاحة';
  let undercoverWord = 'برتقالة';

  // 2. Pick TWO distinct words from THIS SAME PACK
  if (Array.isArray(selectedPack.words) && selectedPack.words.length >= 2) {
    const shuffledWords = [...selectedPack.words].sort(() => 0.5 - Math.random());
    civilianWord = shuffledWords[0];
    undercoverWord = shuffledWords[1] || shuffledWords[0];
  } else if (Array.isArray(selectedPack.pairs) && selectedPack.pairs.length > 0) {
    const randomPair = selectedPack.pairs[Math.floor(Math.random() * selectedPack.pairs.length)];
    civilianWord = randomPair.civilian || randomPair.wordA || 'تفاحة';
    undercoverWord = randomPair.undercover || randomPair.wordB || civilianWord;
  } else if (Array.isArray(selectedPack.words) && selectedPack.words.length === 1) {
    civilianWord = selectedPack.words[0];
    undercoverWord = selectedPack.words[0];
  }

  const categoryName = selectedPack.category || selectedPack.name || 'عام';

  // 3. Return game data
  return {
    wordA: civilianWord,
    wordB: undercoverWord,
    civilian: civilianWord,
    undercover: undercoverWord,
    civilianWord: civilianWord,
    undercoverWord: undercoverWord, // Undercover gets a word from the SAME category
    category: categoryName,
    mrWhiteCategory: categoryName, // Mr. White gets only category name
  };
}

/**
 * Pick a random word pair from the selected categories/packs.
 * Picks one pack first, then picks two words from that same pack.
 *
 * @param {string|string[]|null} packIdOrCategories - specific pack ID, array of category IDs, or 'all'
 * @param {Array} customPacks - user's custom packs from localStorage
 * @param {Array} cloudPacks - packs from Supabase
 */
export function pickRandomPair(packIdOrCategories, customPacks = [], cloudPacks = []) {
  const ids = Array.isArray(packIdOrCategories)
    ? packIdOrCategories
    : [packIdOrCategories || 'all'];

  return getRandomPairFromPool(ids, customPacks, cloudPacks);
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

  if (!wordPair || (!wordPair.wordA && !wordPair.civilian)) {
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

  const defaultWordA = wordPair.wordA || wordPair.civilian;
  const defaultWordB = wordPair.wordB || wordPair.undercover || defaultWordA;

  return playerNames.map((player, index) => {
    const role = roles[index];
    let word = defaultWordA; // Default Civilian word

    if (role === ROLES.IMPOSTOR) {
      if (gameMode === GAME_MODES.CONSCIOUS && options.gameMode !== GAME_MODES.BLIND) {
        word = '';
      } else {
        word = defaultWordB;
      }
    } else if (role === ROLES.MR_WHITE) {
      word = '';
    } else if (role === ROLES.FAKE_IMPOSTOR || role === 'fake_impostor') {
      // Fake Impostor gets wordB so they receive a related secondary word to bluff with
      word = defaultWordB;
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
 * In case of a tie, returns null for eliminated and populates tiedPlayers array.
 * @param {object|Array} votes  - { voterId: votedTargetId } or array of vote entries
 * @returns {{ eliminated: string|null, isTie: boolean, tiedPlayers: string[], tally: object }}
 */
export function tallyVotes(votes = {}) {
  const tally = {};
  
  if (Array.isArray(votes)) {
    for (const v of votes) {
      const target = v.target_id || v.voted_id || v.votedFor || v.target;
      if (target) tally[target] = (tally[target] || 0) + 1;
    }
  } else if (votes && typeof votes === 'object') {
    for (const voted of Object.values(votes)) {
      if (voted) tally[voted] = (tally[voted] || 0) + 1;
    }
  }

  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return { eliminated: null, isTie: false, tiedPlayers: [], tally: {} };

  const [topName, topCount] = entries[0];
  const tiedEntries = entries.filter((e) => e[1] === topCount);
  const isTie = tiedEntries.length > 1;
  const tiedPlayers = tiedEntries.map((e) => e[0]);

  return {
    eliminated: isTie ? null : topName,
    isTie,
    tiedPlayers: isTie ? tiedPlayers : [],
    tally,
  };
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

