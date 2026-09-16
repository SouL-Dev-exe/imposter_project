import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';

// ─── Avatar Styles (Dicebear v9.x – all free) ─────────────────────────────────
const AVATAR_STYLES = [
  { value: 'bottts',       label: '🤖 Bottts (Robots)' },
  { value: 'adventurer',   label: '🧝 Adventurer' },
  { value: 'avataaars',    label: '🧑 Avataaars' },
  { value: 'identicon',    label: '🔷 Identicon' },
  { value: 'pixel-art',    label: '🕹️ Pixel Art' },
  { value: 'thumbs',       label: '👍 Thumbs' },
];

function makeAvatarUrl(style, seed) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed || 'guest')}`;
}

// Detect style from an existing avatar URL so the select stays in sync
function detectStyle(avatarUrl) {
  for (const s of AVATAR_STYLES) {
    if (avatarUrl && avatarUrl.includes(`/${s.value}/`)) return s.value;
  }
  return 'bottts';
}

// ─── Compact avatar button shown on Home page ─────────────────────────────────
export function ProfileCustomizer() {
  const { profile } = useAuthStore();
  const [open, setOpen] = useState(false);

  // Guest / logged-out: nothing to show
  if (!profile) return null;

  return (
    <>
      {/* Small clickable avatar */}
      <button
        onClick={() => setOpen(true)}
        title="Edit profile"
        className="group flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3 py-1 transition-all"
      >
        <img
          src={profile.avatar_url || makeAvatarUrl('bottts', profile.username)}
          alt="avatar"
          className="w-8 h-8 rounded-full bg-white/10 border border-white/20 group-hover:scale-110 transition-transform"
        />
        <span className="text-white text-xs font-bold max-w-[80px] truncate">{profile.username}</span>
        <span className="text-white/40 text-xs">⚙️</span>
      </button>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── Full modal for profile editing ───────────────────────────────────────────
export function ProfileSettingsModal({ isOpen, onClose }) {
  const { profile, updateProfile, signOut } = useAuthStore();

  const [username, setUsername]   = useState('');
  const [style, setStyle]         = useState('bottts');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  // ── Derived XP / Level values ──────────────────────────────────────────────
  const level    = profile?.level ?? 1;
  const xp       = profile?.xp    ?? 0;
  const xpNeeded = level * 100;  // 100 XP per level
  const xpPct    = Math.min(Math.round((xp / xpNeeded) * 100), 100);

  // Seed local state from the profile whenever we open the modal
  useEffect(() => {
    if (isOpen && profile) {
      const u = profile.username || '';
      const s = detectStyle(profile.avatar_url);
      setUsername(u);
      setStyle(s);
      setPreviewUrl(makeAvatarUrl(s, u));
      setError('');
      setSuccess(false);
    }
  }, [isOpen, profile]);

  // Live preview whenever username or style changes
  useEffect(() => {
    setPreviewUrl(makeAvatarUrl(style, username || 'guest'));
  }, [username, style]);

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty!');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    const avatar_url = makeAvatarUrl(style, username.trim());
    const res = await updateProfile({ username: username.trim(), avatar_url });

    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1200);
    } else {
      setError(res.error || 'Failed to save profile.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500" />

            <div className="p-6 space-y-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⚙️ Customize Profile
              </h2>

              {/* Level & XP Badge */}
              <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-white/10">
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-0.5">Level</span>
                  <span className="px-2.5 py-1 bg-indigo-600 text-white font-extrabold rounded-lg text-sm shadow-inner">
                    Lv. {level}
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10 shrink-0" />
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between text-xs text-white/50 mb-1.5">
                    <span>XP Progress</span>
                    <span className="font-bold text-white/70">{xp} / {xpNeeded} XP</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Avatar Preview */}
              <div className="flex flex-col items-center gap-2">
                <motion.img
                  key={previewUrl}
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full border-2 border-indigo-500 bg-slate-800 object-cover shadow-lg shadow-indigo-900/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <span className="text-xs text-white/40">Live Preview</span>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm text-white/60 mb-1 font-medium uppercase tracking-wider text-xs">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  maxLength={20}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Avatar Style Selector */}
              <div>
                <label className="block text-sm text-white/60 mb-1 font-medium uppercase tracking-wider text-xs">Avatar Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                        style === s.value
                          ? 'border-indigo-500 bg-indigo-600/20 text-white scale-105 shadow-md shadow-indigo-900/30'
                          : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <img
                        src={makeAvatarUrl(s.value, username || 'preview')}
                        alt={s.label}
                        className="w-10 h-10 rounded-full bg-white/10"
                      />
                      <span className="leading-tight text-center truncate w-full text-[10px]">{s.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error / Success Messages */}
              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">⚠️ {error}</p>
              )}
              {success && (
                <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">✅ Profile updated!</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSave}
                  disabled={loading || !username.trim()}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>

              {/* Sign Out */}
              <div className="pt-1 border-t border-white/10">
                <Button variant="ghost" fullWidth onClick={handleSignOut} className="!text-red-400 hover:!text-red-300">
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
