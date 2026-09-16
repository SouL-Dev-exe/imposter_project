import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';
import RankBadge from './RankBadge';
import { LanguageToggle } from './LanguageToggle';
import { getPlayerMilestone, ALL_AVATAR_STYLES, getUnlockedAvatarStyles } from '../../utils/milestones';

function makeAvatarUrl(style, seed) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed || 'guest')}`;
}

// Detect style from an existing avatar URL so the select stays in sync
function detectStyle(avatarUrl) {
  for (const s of ALL_AVATAR_STYLES) {
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

  // ── Derived XP / Level / Milestone values ─────────────────────────────────
  const level     = profile?.level ?? 1;
  const xp        = profile?.xp    ?? 0;
  const xpNeeded  = level * 100;  // 100 XP per level
  const xpPct     = Math.min(Math.round((xp / xpNeeded) * 100), 100);
  const milestone      = getPlayerMilestone(level);
  const unlockedStyles = getUnlockedAvatarStyles(level);

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

              {/* Level, XP & Milestone Rank Badge */}
              <div className={`p-4 rounded-2xl border ${milestone.border} ${milestone.bg} space-y-3 transition-all shadow-inner`}>
                <div className="flex items-center gap-3">
                  <RankBadge milestone={milestone} className="w-12 h-12 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-extrabold text-sm sm:text-base tracking-wide truncate ${milestone.color}`}>
                        {milestone.title}
                      </span>
                      <span className="px-2 py-0.5 bg-black/40 text-slate-200 font-extrabold rounded-md text-xs border border-white/10 shrink-0">
                        Lv. {level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Perk: <span className="font-medium text-slate-200">{milestone.perk}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between text-xs text-white/60 mb-1 font-medium">
                    <span>XP Progress</span>
                    <span className="font-bold text-white/90">{xp} / {xpNeeded} XP</span>
                  </div>
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full"
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

              {/* Avatar Style Selector (Level-Gated) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-white/60 font-medium uppercase tracking-wider text-xs">Avatar Style</label>
                  <span className="text-[10px] text-white/40">Level required to unlock</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_AVATAR_STYLES.map((s) => {
                    const isUnlocked = unlockedStyles.includes(s.value);
                    const isSelected = style === s.value;

                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => isUnlocked && setStyle(s.value)}
                        disabled={!isUnlocked}
                        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600/20 text-white scale-105 shadow-md shadow-indigo-900/30'
                            : isUnlocked
                            ? 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                            : 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={makeAvatarUrl(s.value, username || 'preview')}
                            alt={s.label}
                            className={`w-10 h-10 rounded-full bg-white/10 object-cover ${!isUnlocked ? 'filter grayscale brightness-75' : ''}`}
                          />
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-xs shadow-inner">
                              🔒
                            </div>
                          )}
                        </div>
                        <span className="leading-tight text-center truncate w-full text-[10px]">
                          {s.label}
                        </span>
                        {!isUnlocked ? (
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            Lv. {s.minLevel}
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-400 font-bold">Unlocked</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Settings Row */}
              <div>
                <LanguageToggle variant="settings-row" />
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
