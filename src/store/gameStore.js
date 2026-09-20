/**
 * gameStore.js
 * Zustand store for all active game session state.
 * Persisted to localStorage so refreshing doesn't wipe the session.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState = {
  // Lobby config
  playerNames: [],          // string[]
  gameMode: 'conscious',    // 'conscious' | 'blind'
  options: {
    mrWhite: false,
    undercoverCouple: false,
    fakeImpostor: false,
    speedTimer: false,
    timerSeconds: 30,
  },
  selectedPackId: 'all',    // 'all' | specific pack id

  // Active game session
  players: [],              // Full player objects with roles
  currentPhase: 'home',     // 'home' | 'lobby' | 'reveal' | 'clues' | 'vote' | 'result'
  currentRevealIndex: 0,    // Which player is revealing right now
  currentClueIndex: 0,      // Whose turn to give a clue
  votes: {},                // { voterName: votedForName }
  eliminatedPlayer: null,   // Player object who was voted out
  winner: null,             // 'civilians' | 'impostors'
  wordPair: null,           // { wordA, wordB, category, packName }
  finalGuessResult: null,   // null | true | false
  roundNumber: 1,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Lobby setup ─────────────────────────────────────────────────────────
      setPlayerNames: (names) => set({ playerNames: names }),
      setGameMode: (mode) => set({ gameMode: mode }),
      setOptions: (opts) => set((s) => ({ options: { ...s.options, ...opts } })),
      setSelectedPackId: (id) => set({ selectedPackId: id }),

      // ── Game lifecycle ───────────────────────────────────────────────────────
      /**
       * Start a new game: set players and word pair, move to reveal phase.
       */
      startGame: (players, wordPair) =>
        set({
          players,
          wordPair,
          currentPhase: 'reveal',
          currentRevealIndex: 0,
          currentClueIndex: 0,
          votes: {},
          eliminatedPlayer: null,
          winner: null,
          finalGuessResult: null,
          roundNumber: 1,
        }),

      /**
       * Mark the current player as having viewed their role.
       */
      markRevealed: (playerId) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId ? { ...p, hasRevealed: true } : p
          ),
          currentRevealIndex: s.currentRevealIndex + 1,
        })),

      /**
       * Move to the clue phase.
       */
      goToClues: () => set({ currentPhase: 'clues', currentClueIndex: 0 }),

      /**
       * Advance the clue turn to the next player.
       */
      nextClueTurn: () =>
        set((s) => ({
          currentClueIndex: s.currentClueIndex + 1,
        })),

      /**
       * Move to the voting phase.
       */
      goToVote: () => set({ currentPhase: 'vote', votes: {} }),

      /**
       * Cast a vote.
       */
      castVote: (voterName, votedFor) =>
        set((s) => ({ votes: { ...s.votes, [voterName]: votedFor } })),

      /**
       * Set the eliminated player after vote tally.
       */
      setEliminatedPlayer: (player) => set({ eliminatedPlayer: player }),

      /**
       * Set game phase.
       */
      setPhase: (phase) => set({ currentPhase: phase }),

      /**
       * Set winner.
       */
      setWinner: (winner) => set({ winner, currentPhase: 'result' }),

      /**
       * Set the final guess result (true = impostor wins, false = civilians win).
       */
      setFinalGuessResult: (result) => set({ finalGuessResult: result }),

      /**
       * Reset everything back to home.
       */
      resetGame: () => set({ ...initialState, currentPhase: 'home' }),

      /**
       * Reset to lobby while keeping player names and settings.
       */
      resetToLobby: () =>
        set((s) => ({
          ...initialState,
          playerNames: s.playerNames,
          gameMode: s.gameMode,
          options: s.options,
          selectedPackId: s.selectedPackId,
          currentPhase: 'lobby',
        })),

      // ── Helpers ─────────────────────────────────────────────────────────────
      getActivePlayers: () => get().players.filter((p) => !p.isEliminated),
      getImpostors: () => get().players.filter((p) => p.role === 'impostor' || p.role === 'mrwhite'),
      getCivilians: () => get().players.filter((p) => p.role === 'civilian'),
    }),
    {
      name: 'undercover-game-session',
      // Only persist the config, not the full game state (to avoid stale mid-game state)
      partialize: (state) => ({
        playerNames: state.playerNames,
        gameMode: state.gameMode,
        options: state.options,
        selectedPackId: state.selectedPackId,
        // Also persist active session so refresh works mid-game
        players: state.players,
        currentPhase: state.currentPhase,
        currentRevealIndex: state.currentRevealIndex,
        currentClueIndex: state.currentClueIndex,
        votes: state.votes,
        eliminatedPlayer: state.eliminatedPlayer,
        winner: state.winner,
        wordPair: state.wordPair,
        finalGuessResult: state.finalGuessResult,
        roundNumber: state.roundNumber,
      }),
    }
  )
);
