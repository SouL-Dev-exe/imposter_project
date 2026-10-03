import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://noztwscjkhhegabziyzj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8KhOXwhz26lqXnBCPlSgg__28Pu8Dy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Fetch all global word packs from Supabase matching the schema truth:
 * Table: public.word_packs
 * Columns: id (TEXT), created_by (UUID), icon, category, category_en, price, is_free, words (JSONB array), is_public
 */
export async function fetchCloudPacks() {
  try {
    const { data: rows, error } = await supabase
      .from('word_packs')
      .select('id, created_by, icon, category, category_en, price, is_free, words, is_public');

    if (error) throw error;
    if (!rows) return [];

    // Normalise each Supabase row into the app word pack shape
    return rows.map((row) => {
      const words = Array.isArray(row.words) ? row.words : [];
      const uniqueWords = [...new Set(words.filter(Boolean))];
      return {
        id: row.id.startsWith('cloud-') ? row.id : `cloud-${row.id}`,
        supabaseId: row.id,
        name: row.category,
        icon: row.icon || '☁️',
        category: row.category || '',
        categoryEn: row.category_en || row.category || '',
        price: row.price ?? 0,
        isFree: Boolean(row.is_free ?? true),
        isPublic: Boolean(row.is_public ?? true),
        builtin: false,
        cloud: true,
        words: uniqueWords,
        pairs: uniqueWords.length >= 2 ? [{
          id: `pair-${row.id}-0`,
          wordA: uniqueWords[0],
          wordB: uniqueWords[1],
          category: row.category || 'Cloud',
        }] : [],
        createdAt: Date.now(),
      };
    });
  } catch (err) {
    console.warn('[Supabase] Failed to fetch cloud packs — falling back to localStorage.', err?.message || err);
    return [];
  }
}

/**
 * Save a new custom pack to Supabase globally.
 * Table: public.word_packs
 * Columns: id, created_by, icon, category, category_en, price, is_free, words, is_public
 *
 * @param {{ id?: string, name: string, category?: string, categoryEn?: string, icon?: string, words?: string[], price?: number, isFree?: boolean }} pack
 * @returns {Promise<object|null>} The saved row data, or null on failure.
 */
export async function savePackToCloud(pack) {
  const words = Array.isArray(pack.words) && pack.words.length > 0
    ? pack.words
    : (pack.pairs || []).flatMap((p) => [p.wordA, p.wordB]).filter(Boolean);

  const uniqueWords = [...new Set(words.filter(Boolean))];
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || null;

  const packId = pack.id ? String(pack.id).replace(/^cloud-/, '') : `pack_${Date.now()}`;
  const categoryName = pack.category || pack.name || 'مجموعة مخصصة';

  const payload = {
    id: packId,
    created_by: userId,
    icon: pack.icon || '📦',
    category: categoryName,
    category_en: pack.categoryEn || categoryName,
    price: pack.price ?? 0,
    is_free: pack.isFree ?? true,
    words: uniqueWords,
    is_public: true,
  };

  try {
    const { data: rows, error } = await supabase
      .from('word_packs')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (error) throw error;

    return rows?.[0] ?? payload;
  } catch (err) {
    console.error('[Supabase] Failed to save pack to cloud:', err?.message || err);
    return null;
  }
}

// ─── Admin secret ─────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'aze1974';

/**
 * Delete a cloud word pack from Supabase.
 *
 * @param {string} supabaseId - The ID of the pack in public.word_packs
 * @param {string} inputPassword - The password entered by the user
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deletePackFromCloud(supabaseId, inputPassword) {
  if (!inputPassword || inputPassword !== ADMIN_PASSWORD) {
    return { success: false, error: 'Incorrect admin password.' };
  }

  const cleanId = String(supabaseId).replace(/^cloud-/, '');

  try {
    const { error } = await supabase
      .from('word_packs')
      .delete()
      .eq('id', cleanId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('[Supabase] Failed to delete pack:', err?.message || err);
    return { success: false, error: 'Failed to delete. Check your connection.' };
  }
}

export default supabase;
