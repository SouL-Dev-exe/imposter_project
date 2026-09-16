import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://noztwscjkhhegabziyzj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8KhOXwhz26lqXnBCPlSgg__28Pu8Dy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all global word packs from Supabase.
 * Returns an array of normalised pack objects, or [] on error.
 */
export async function fetchCloudPacks() {
  try {
    const { data: rows, error } = await supabase
      .from('word_packs')
      .select('*');

    if (error) throw error;

    // Normalise each Supabase row into the same shape used by the app
    return rows.map((row) => ({
      id: `cloud-${row.id}`,
      supabaseId: row.id,
      name: row.pack_name,
      icon: row.icon || '☁️',
      category: row.category || '',
      builtin: false,
      cloud: true,
      pairs: (row.word_pairs || []).map((wp, i) => ({
        id: `cloud-pair-${row.id}-${i}`,
        wordA: wp.word_a || '',
        wordB: wp.word_b || '',
        category: row.category || wp.category || 'Cloud',
      })),
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch cloud packs — falling back to localStorage.', err.message);
    return [];
  }
}

/**
 * Save a new custom pack to Supabase globally.
 *
 * @param {{ name: string, category: string, icon?: string, pairs: {wordA, wordB}[] }} pack
 * @returns {Promise<object|null>} The saved row data, or null on failure.
 */
export async function savePackToCloud(pack) {
  const payload = {
    pack_name: pack.name,
    category: pack.category || pack.name,
    icon: pack.icon || '📦',
    word_pairs: pack.pairs.map((p) => ({
      word_a: p.wordA,
      word_b: p.wordB,
      category: p.category || pack.category || 'Custom',
    })),
  };

  try {
    const { data: rows, error } = await supabase
      .from('word_packs')
      .insert([payload])
      .select();

    if (error) throw error;

    return rows?.[0] ?? null;
  } catch (err) {
    console.error('[Supabase] Failed to save pack to cloud:', err.message);
    return null;
  }
}

// ─── Admin secret (change this to your own password) ─────────────────────────
// This is checked client-side before sending the DELETE request.
const ADMIN_PASSWORD = 'aze1974';

/**
 * Delete a cloud word pack from Supabase.
 * Requires the correct admin password to proceed.
 *
 * @param {string} supabaseId - The raw UUID of the pack in Supabase
 * @param {string} inputPassword - The password entered by the user in the UI
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deletePackFromCloud(supabaseId, inputPassword) {
  if (!inputPassword || inputPassword !== ADMIN_PASSWORD) {
    return { success: false, error: 'Incorrect admin password.' };
  }

  try {
    const { error } = await supabase
      .from('word_packs')
      .delete()
      .eq('id', supabaseId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('[Supabase] Failed to delete pack:', err.message);
    return { success: false, error: 'Failed to delete. Check your connection.' };
  }
}
