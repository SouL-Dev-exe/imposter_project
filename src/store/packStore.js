/**
 * packStore.js
 * Zustand store for custom word packs.
 * Persisted to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/gameLogic';

export const usePackStore = create(
  persist(
    (set, get) => ({
      customPacks: [], // Array of custom pack objects

      /**
       * Add a new empty custom pack.
       */
      addPack: (name, icon = '📦') => {
        const newPack = {
          id: `custom-${generateId()}`,
          name,
          icon,
          builtin: false,
          pairs: [],
          createdAt: Date.now(),
        };
        set((s) => ({ customPacks: [...s.customPacks, newPack] }));
        return newPack.id;
      },

      /**
       * Update a pack's metadata.
       */
      updatePack: (packId, updates) =>
        set((s) => ({
          customPacks: s.customPacks.map((p) =>
            p.id === packId ? { ...p, ...updates } : p
          ),
        })),

      /**
       * Delete a custom pack.
       */
      deletePack: (packId) =>
        set((s) => ({
          customPacks: s.customPacks.filter((p) => p.id !== packId),
        })),

      /**
       * Add a word pair to a pack.
       */
      addPair: (packId, wordA, wordB, category) => {
        const newPair = { id: `pair-${generateId()}`, wordA, wordB, category };
        set((s) => ({
          customPacks: s.customPacks.map((p) =>
            p.id === packId ? { ...p, pairs: [...p.pairs, newPair] } : p
          ),
        }));
      },

      /**
       * Update an existing word pair.
       */
      updatePair: (packId, pairId, updates) =>
        set((s) => ({
          customPacks: s.customPacks.map((p) =>
            p.id === packId
              ? {
                  ...p,
                  pairs: p.pairs.map((pair) =>
                    pair.id === pairId ? { ...pair, ...updates } : pair
                  ),
                }
              : p
          ),
        })),

      /**
       * Delete a word pair from a pack.
       */
      deletePair: (packId, pairId) =>
        set((s) => ({
          customPacks: s.customPacks.map((p) =>
            p.id === packId
              ? { ...p, pairs: p.pairs.filter((pair) => pair.id !== pairId) }
              : p
          ),
        })),

      /**
       * Export a pack as a downloadable JSON file.
       */
      exportPack: (packId) => {
        const pack = get().customPacks.find((p) => p.id === packId);
        if (!pack) return;
        const json = JSON.stringify(pack, null, 2);
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
       * Returns a promise that resolves when the import is done.
       */
      importPack: (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target.result);
              // Validate structure
              if (!data.name || !Array.isArray(data.pairs)) {
                reject(new Error('Invalid pack format: missing name or pairs array.'));
                return;
              }
              // Assign a new local ID and mark as custom
              const imported = {
                ...data,
                id: `custom-${generateId()}`,
                builtin: false,
                createdAt: Date.now(),
                // Ensure all pairs have unique IDs
                pairs: data.pairs.map((pair) => ({
                  ...pair,
                  id: `pair-${generateId()}`,
                  wordA: pair.wordA || '',
                  wordB: pair.wordB || '',
                  category: pair.category || 'Imported',
                })),
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
    }
  )
);
