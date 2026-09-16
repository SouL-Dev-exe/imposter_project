/**
 * gameLogic.js
 * Pure functions for all core game mechanics:
 *  - Role assignment
 *  - Win condition checking
 *  - Final guess evaluation
 */

import { ALL_BUILTIN_PAIRS } from '../data/defaultPacks';

// ─── Role types ──────────────────────────────────────────────────────────────
export const ROLES = {
  CIVILIAN: 'civilian',
  IMPOSTOR: 'impostor',
  MR_WHITE: 'mrwhite',
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
 * Pick a random word pair from the selected pack / all packs.
 * @param {string|null} packId - specific pack id or null for random
 * @param {Array} customPacks - user's custom packs from localStorage
 */
export function pickRandomPair(packId, customPacks = [], cloudPacks = []) {
  const allPairs = [...ALL_BUILTIN_PAIRS];

  // Merge custom pack pairs (locally created)
  for (const cp of customPacks) {
    for (const pair of cp.pairs) {
      allPairs.push({ ...pair, packId: cp.id, packName: cp.name });
    }
  }

  // Merge cloud pack pairs (from Supabase)
  for (const cp of cloudPacks) {
    for (const pair of cp.pairs) {
      allPairs.push({ ...pair, packId: cp.id, packName: cp.name });
    }
  }

  let pool = allPairs;
  if (packId && packId !== 'all') {
    pool = allPairs.filter((p) => p.packId === packId);
  }
  if (pool.length === 0) pool = allPairs;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Assign roles to players and set their secret words.
 *
 * @param {string[]} playerNames
 * @param {'conscious'|'blind'} gameMode
 * @param {{ mrWhite: boolean, undercoverCouple: boolean }} options
 * @param {object} wordPair  - { wordA, wordB, category }
 * @returns {object[]} players with { name, role, word, category, hasRevealed: false }
 */
export function assignRoles(playerNames, gameMode, options, wordPair) {
  const count = playerNames.length;
  const roles = new Array(count).fill(ROLES.CIVILIAN);

  // Determine how many impostors
  let impostorCount = 1;
  if (options.undercoverCouple && count >= 6) {
    impostorCount = 2;
  }

  // Optionally add Mr. White
  let mrWhiteIndex = -1;

  // Assign impostor positions
  const shuffledIndices = shuffle([...Array(count).keys()]);
  const impostorIndices = shuffledIndices.slice(0, impostorCount);
  for (const idx of impostorIndices) {
    roles[idx] = ROLES.IMPOSTOR;
  }

  // Assign Mr. White (must not be an impostor)
  if (options.mrWhite && count >= 4) {
    const remaining = shuffledIndices.slice(impostorCount);
    if (remaining.length > 0) {
      mrWhiteIndex = remaining[0];
      roles[mrWhiteIndex] = ROLES.MR_WHITE;
    }
  }

  // Build player objects
  const players = playerNames.map((name, i) => {
    const role = roles[i];
    let word = '';

    if (role === ROLES.CIVILIAN) {
      word = wordPair.wordA;
    } else if (role === ROLES.IMPOSTOR) {
      if (gameMode === GAME_MODES.CONSCIOUS) {
        // Conscious impostor: told they are the impostor, shown only category
        word = ''; // displayed as "YOU ARE THE IMPOSTOR"
      } else {
        // Blind impostor: sees the other word
        word = wordPair.wordB;
      }
    } else if (role === ROLES.MR_WHITE) {
      word = ''; // Blank / category only
    }

    return {
      id: `player-${i}`,
      name,
      role,
      word,
      category: wordPair.category,
      hasRevealed: false,
      isEliminated: false,
    };
  });

  return players;
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
 * @returns {{ phase: 'impostor_final_guess'|'civilians_win'|'impostors_win'|'continue', eliminatedPlayer: object|null }}
 */
export function checkWinCondition(players, eliminatedName, gameMode) {
  if (!eliminatedName) {
    // Tie: nobody is eliminated, game continues
    return { phase: 'continue', eliminatedPlayer: null };
  }

  const eliminatedPlayer = players.find((p) => p.name === eliminatedName);
  if (!eliminatedPlayer) return { phase: 'continue', eliminatedPlayer: null };

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

