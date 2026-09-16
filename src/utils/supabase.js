/**
 * supabase.js — Lightweight Supabase client using raw fetch (no npm package).
 *
 * NOTE: The SUPABASE_URL must be your actual project URL.
 * Replace "YOUR_PROJECT_URL_HERE" with your real Supabase project URL,
 * e.g. "https://abcdefghijklmnop.supabase.co"
 */
const SUPABASE_URL = 'https://noztwscjkhhegabziyzj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8KhOXwhz26lqXnBCPlSgg__28Pu8Dy';

const BASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

/**
 * Fetch all global word packs from Supabase.
 * Returns an array of normalised pack objects, or [] on error.
 */
export async function fetchCloudPacks() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/word_packs?select=*`, {
      headers: BASE_HEADERS,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const rows = await res.json();

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
    const res = await fetch(`${SUPABASE_URL}/rest/v1/word_packs`, {
      method: 'POST',
      headers: {
        ...BASE_HEADERS,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const rows = await res.json();
    return rows?.[0] ?? null;
  } catch (err) {
    console.error('[Supabase] Failed to save pack to cloud:', err.message);
    return null;
  }
}
