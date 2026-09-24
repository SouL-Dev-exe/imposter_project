/**
 * packStore.js
 * Zustand store for custom word packs.
 * Persisted to localStorage with optional Supabase cloud sync.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/gameLogic';
import { fetchCloudPacks, savePackToCloud, deletePackFromCloud } from '../utils/supabase';

export const usePackStore = create(
  persist(
    (set, get) => ({
      customPacks: [],   // Locally created packs (persisted to localStorage)
      cloudPacks: [],    // Read-only packs fetched from Supabase
      cloudStatus: 'idle', // 'idle' | 'loading' | 'synced' | 'error' | 'offline'

      // ─── Cloud sync ──────────────────────────────────────────────────────────

      /**
       * Fetch global packs from Supabase on app launch.
       * Falls back to localStorage (cloudPacks stays stale but usable).
       */
      syncCloudPacks: async () => {
        set({ cloudStatus: 'loading' });
        const packs = await fetchCloudPacks();
        if (packs.length > 0) {
          set({ cloudPacks: packs, cloudStatus: 'synced' });
        } else {
          // fetchCloudPacks already logged the error; keep existing cloudPacks
          set((s) => ({ cloudStatus: s.cloudPacks.length > 0 ? 'synced' : 'offline' }));
        }
      },

      /**
       * Push a finished local pack to Supabase, then refresh the cloudPacks list.
       * Returns { success: boolean, error?: string }
       */
      publishPackToCloud: async (packId) => {
        const pack = get().customPacks.find((p) => p.id === packId);
        if (!pack) return { success: false, error: 'Pack not found.' };
        const words = pack.words && pack.words.length > 0
          ? pack.words
          : (pack.pairs || []).flatMap((p) => [p.wordA, p.wordB]).filter(Boolean);
        if (words.length === 0) return { success: false, error: 'Pack has no words.' };

        const saved = await savePackToCloud({ ...pack, words });
        if (!saved) return { success: false, error: 'Failed to upload pack. Check your connection.' };

        // Re-fetch so everyone sees the new pack
        await get().syncCloudPacks();
        return { success: true };
      },

      /**
       * Delete a cloud pack by its Supabase UUID (password-protected).
       * Returns { success: boolean, error?: string }
       */
      deleteCloudPack: async (supabaseId, packName, inputPassword) => {
        const result = await deletePackFromCloud(supabaseId, inputPassword);
        if (result.success) {
          // Remove from local cloudPacks state immediately (no re-fetch needed)
          set((s) => ({
            cloudPacks: s.cloudPacks.filter((p) => p.supabaseId !== supabaseId),
          }));
        }
        return result;
      },

      // ─── Local CRUD ──────────────────────────────────────────────────────────

      /** Add a new empty custom pack. */
      addPack: (name, icon = '📦') => {
        const newPack = {
          id: `custom-${generateId()}`,
          name,
          icon,
          builtin: false,
          cloud: false,
          words: [],
          pairs: [],
          createdAt: Date.now(),
        };
        set((s) => ({ customPacks: [...s.customPacks, newPack] }));
        return newPack.id;
      },

      /** Update a pack's metadata. */
      updatePack: (packId, updates) =>
        set((s) => ({
          customPacks: s.customPacks.map((p) =>
            p.id === packId ? { ...p, ...updates } : p
          ),
        })),

      /** Delete a custom pack. */
      deletePack: (packId) =>
        set((s) => ({
          customPacks: s.customPacks.filter((p) => p.id !== packId),
        })),

      /** Add a word to a pack. */
      addWord: (packId, word) => {
        const trimmed = word?.trim();
        if (!trimmed) return;
        set((s) => ({
          customPacks: s.customPacks.map((p) => {
            if (p.id !== packId) return p;
            const currentWords = p.words && p.words.length > 0
              ? p.words
              : (p.pairs || []).flatMap((pair) => [pair.wordA, pair.wordB]).filter(Boolean);
            if (currentWords.includes(trimmed)) return p;
            return {
              ...p,
              words: [...currentWords, trimmed],
            };
          }),
        }));
      },

      /** Delete a word from a pack. */
      deleteWord: (packId, wordOrIndex) => {
        set((s) => ({
          customPacks: s.customPacks.map((p) => {
            if (p.id !== packId) return p;
            const currentWords = p.words && p.words.length > 0
              ? p.words
              : (p.pairs || []).flatMap((pair) => [pair.wordA, pair.wordB]).filter(Boolean);
            return {
              ...p,
              words: typeof wordOrIndex === 'number'
                ? currentWords.filter((_, idx) => idx !== wordOrIndex)
                : currentWords.filter((w) => w !== wordOrIndex),
            };
          }),
        }));
      },

      /** Add a word pair to a pack (legacy compatibility). */
      addPair: (packId, wordA, wordB, category) => {
        const newPair = { id: `pair-${generateId()}`, wordA, wordB, category };
        set((s) => ({
          customPacks: s.customPacks.map((p) => {
            if (p.id !== packId) return p;
            const existingWords = p.words || [];
            const newWords = [...existingWords];
            if (wordA && !newWords.includes(wordA)) newWords.push(wordA);
            if (wordB && !newWords.includes(wordB)) newWords.push(wordB);
            return {
              ...p,
              words: newWords,
              pairs: [...(p.pairs || []), newPair],
            };
          }),
        }));
      },

      /** Update an existing word pair (legacy compatibility). */
      updatePair: (packId, pairId, updates) =>
        set((s) => ({
          customPacks: s.customPacks.map((p) =>
            p.id === packId
              ? {
                  ...p,
                  pairs: (p.pairs || []).map((pair) =>
                    pair.id === pairId ? { ...pair, ...updates } : pair
                  ),
                }
              : p
          ),
        })),

      /** Delete a word pair from a pack (legacy compatibility). */
      deletePair: (packId, pairId) =>
        set((s) => ({
          customPacks: s.customPacks.map((p) =>
            p.id === packId
              ? { ...p, pairs: (p.pairs || []).filter((pair) => pair.id !== pairId) }
              : p
          ),
        })),

      /** Export a pack as a downloadable JSON file in the new single-word pool format. */
      exportPack: (packId) => {
        const pack = get().customPacks.find((p) => p.id === packId);
        if (!pack) return;
        const words = pack.words && pack.words.length > 0
          ? pack.words
          : (pack.pairs || []).flatMap((p) => [p.wordA, p.wordB]).filter(Boolean);
        const exportData = {
          name: pack.name,
          icon: pack.icon || '📦',
          words,
        };
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pack.name.replace(/\s+/g, '_')}_pack.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      /**
       * Import a pack from a JSON file.
       * Supports both new { name, icon, words: [...] } and legacy { name, icon, pairs: [...] } formats.
       */
      importPack: (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target.result);
              if (!data.name || (!Array.isArray(data.words) && !Array.isArray(data.pairs))) {
                reject(new Error('Invalid pack format: missing name or words array.'));
                return;
              }
              const words = Array.isArray(data.words)
                ? data.words.map((w) => String(w).trim()).filter(Boolean)
                : (data.pairs || []).flatMap((p) => [p.wordA, p.wordB]).filter(Boolean);

              const imported = {
                id: `custom-${generateId()}`,
                name: data.name,
                icon: data.icon || '📦',
                builtin: false,
                cloud: false,
                createdAt: Date.now(),
                words,
                pairs: data.pairs || [],
              };
              set((s) => ({ customPacks: [...s.customPacks, imported] }));
              resolve(imported);
            } catch (err) {
              reject(new Error('Failed to parse JSON file.'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file.'));
          reader.readAsText(file);
        });
      },
    }),
    {
      name: 'undercover-custom-packs',
      // Only persist local custom packs and cached cloud packs to localStorage
      partialize: (state) => ({
        customPacks: state.customPacks,
        cloudPacks: state.cloudPacks,
      }),
    }
  )
);
