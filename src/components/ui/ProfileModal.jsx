/**
 * ProfileModal.jsx
 * Comprehensive Player Profile & Cosmetic Locker Modal.
 *
 * Features:
 *  1. Title & Badge: Prominently renders the equipped title (e.g., [Bluff King]) next to/under username.
 *  2. Equipped Overview: Interactive "Equipped Loadout" section showing Outfit, Accessory, Emote, Screen FX, and Title.
 *  3. Inventory Locker Tab: Displays all owned items with one-click Equip/Unequip buttons and Toasts.
 *  4. Profile Settings: Avatar style switcher, username editor, and Level milestone progression.
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem, RARITIES } from '../../data/economyCatalog';
import { getPlayerMilestone, ALL_AVATAR_STYLES, getUnlockedAvatarStyles } from '../../utils/milestones';
import { toast } from '../../store/toastStore';
import { playClickSound, vibrate, sfxState } from '../../utils/sfx';

function makeAvatarUrl(style, seed) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed || 'guest')}`;
}

function detectStyle(avatarUrl) {
  for (const s of ALL_AVATAR_STYLES) {
    if (avatarUrl && avatarUrl.includes(`/${s.value}/`)) return s.value;
  }
  return 'bottts';
}

export function getAccessoryStyle(accessoryId) {
  switch (accessoryId) {
    case 'acc_glowing_border':
      return {
        ring: 'ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.7)]',
        badge: '⭕',
        label: 'Lobby Plasma Ring',
        color: '#06b6d4',
      };
    case 'acc_cyber_halo':
      return {
        ring: 'ring-4 ring-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.7)]',
        badge: '😇',
        crest: '😇',
        label: 'Cybernetic Halo',
        color: '#d946ef',
      };
    case 'acc_golden_aura':
      return {
        ring: 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(234,179,8,0.8)] animate-pulse',
        badge: '✨',
        label: 'Radiant Sunburst Aura',
        color: '#eab308',
      };
    case 'acc_detective_badge':
      return {
        ring: 'ring-3 ring-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.5)]',
        badge: '🎖️',
        label: 'Chief Inspector Badge',
        color: '#94a3b8',
      };
    case 'acc_demon_horns':
      return {
        ring: 'ring-4 ring-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.7)]',
        badge: '😈',
        crest: '😈',
        label: 'Infernal Neon Horns',
        color: '#ec4899',
      };
    default:
      return {
        ring: 'ring-2 ring-white/20',
        badge: null,
        crest: null,
        label: null,
        color: '#ffffff',
      };
  }
}

export function ProfileModal({ isOpen, onClose }) {
  const { profile, updateProfile, signOut } = useAuthStore();
  const {
    inventory,
    equipped,
    equipItem,
    unequipItem,
    isEquipped,
    soulCoins,
    seasonLevel,
    equippedAvatarStyle,
    ownedAvatarStyles,
  } = useEconomyStore();

  const [activeTab, setActiveTab] = useState('loadout'); // 'loadout' | 'inventory' | 'settings'
  const [invFilter, setInvFilter] = useState('all');

  // Profile edit state
  const [username, setUsername] = useState('');
  const [style, setStyle] = useState('bottts');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpNeeded = level * 100;
  const xpPct = Math.min(Math.round((xp / xpNeeded) * 100), 100);
  const milestone = getPlayerMilestone(level);
  const unlockedStyles = getUnlockedAvatarStyles(level);

  // Equipped cosmetic representations
  const equippedTitleItem = useMemo(() => {
    return getStoreItem(equipped?.title) || { id: 'title_novice', name: equipped?.title || 'Novice', icon: '🌱', accent: '#94a3b8' };
  }, [equipped?.title]);

  const equippedOutfitItem = useMemo(() => {
    return getStoreItem(equipped?.outfit);
  }, [equipped?.outfit]);

  const equippedAccessoryItem = useMemo(() => {
    return getStoreItem(equipped?.accessory);
  }, [equipped?.accessory]);

  const equippedEmoteItem = useMemo(() => {
    return getStoreItem(equipped?.emote);
  }, [equipped?.emote]);

  const equippedScreenFXItem = useMemo(() => {
    return getStoreItem(equipped?.screenFX);
  }, [equipped?.screenFX]);

  const accessoryStyles = useMemo(() => {
    return getAccessoryStyle(equipped?.accessory);
  }, [equipped?.accessory]);

  useEffect(() => {
    if (isOpen && profile) {
      const u = profile.username || '';
      // Prefer economy store style (purchased), fall back to avatar_url detection
      const s = equippedAvatarStyle || detectStyle(profile.avatar_url);
      setUsername(u);
      setStyle(s);
      setPreviewUrl(makeAvatarUrl(s, u));
      setError('');
      setSuccess(false);
    }
  }, [isOpen, profile, equippedAvatarStyle]);

  useEffect(() => {
    setPreviewUrl(makeAvatarUrl(style, username || 'guest'));
  }, [username, style]);

  if (!isOpen) return null;

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
      toast.success('Profile updated!', 'Your changes have been saved');
      setTimeout(() => {
        setSuccess(false);
      }, 1200);
    } else {
      setError(res.error || 'Failed to save profile.');
    }
  };

  const handleEquip = (category, item) => {
    playClickSound();
    vibrate(40);
    const success = equipItem(category, item.id);
    if (success) {
      toast.equip(item.name, category);
    }
  };

  const handleUnequip = (category, item) => {
    playClickSound();
    vibrate(30);
    unequipItem(category);
    toast.info(`Unequipped ${item?.name || category}`);
  };

  // Build flattened list of all owned items for the Locker tab
  const allOwnedItems = [];
  const categories = ['outfits', 'accessories', 'emotes', 'screenFX', 'titles'];
  categories.forEach((cat) => {
    const ids = inventory[cat] || [];
    ids.forEach((id) => {
      const item = getStoreItem(id);
      if (item) {
        allOwnedItems.push({ ...item, categoryKey: cat });
      } else if (cat === 'titles') {
        allOwnedItems.push({
          id,
          name: id,
          category: 'titles',
          categoryKey: 'titles',
          icon: '🏷️',
          desc: 'Player title',
          rarity: 'common',
          accent: '#94a3b8',
        });
      }
    });
  });

  const filteredOwnedItems = invFilter === 'all'
    ? allOwnedItems
    : allOwnedItems.filter((i) => i.category === invFilter || i.categoryKey === invFilter);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Banner & Header */}
          <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/70 via-gray-900 to-indigo-950/70 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 end-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Profile Hero Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Avatar with dynamic equipped accessory glow & frame */}
              <div className="relative">
                {accessoryStyles.crest && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl z-10 animate-bounce">
                    {accessoryStyles.crest}
                  </span>
                )}
                <img
                  src={previewUrl || profile?.avatar_url}
                  alt={profile?.username}
                  className={`w-20 h-20 rounded-full bg-white/10 transition-all duration-300 ${accessoryStyles.ring}`}
                />
                {equippedOutfitItem && (
                  <span
                    className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-xs shadow-md"
                    title={`Equipped Outfit: ${equippedOutfitItem.name}`}
                  >
                    {equippedOutfitItem.icon}
                  </span>
                )}
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-violet-600 text-white font-black rounded-full text-[10px] shadow-md border border-white/20">
                  Lvl {level}
                </span>
              </div>

              {/* Player identity, equipped title & rank */}
              <div className="text-center sm:text-start flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-black text-white truncate">{profile?.username || 'Player'}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${milestone.color} ${milestone.bg} ${milestone.border}`}>
                    {milestone.title}
                  </span>
                </div>

                {/* Equipped Title Display */}
                <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wide border shadow-sm"
                    style={{
                      color: equippedTitleItem.accent || '#a78bfa',
                      borderColor: `${equippedTitleItem.accent || '#a78bfa'}50`,
                      background: `${equippedTitleItem.accent || '#a78bfa'}15`,
                    }}
                  >
                    <span>{equippedTitleItem.icon}</span>
                    <span>[{equippedTitleItem.name}]</span>
                  </span>
                </div>

                {/* Subtitle / Season info */}
                <p className="text-white/40 text-xs mt-1">
                  Season 1 · <span className="text-amber-400 font-bold">{soulCoins.toLocaleString()} SC</span> · Tier {seasonLevel} Pass
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mt-5 border-t border-white/5 pt-3">
              {[
                { id: 'loadout', label: 'Equipped Loadout', icon: '🎽' },
                { id: 'inventory', label: `My Locker (${allOwnedItems.length})`, icon: '🎒' },
                { id: 'settings', label: 'Profile Settings', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: EQUIPPED LOADOUT */}
            {activeTab === 'loadout' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-violet-300">
                    Active Equipped Cosmetics
                  </h3>
                  <span className="text-xs text-white/40">These alter your player card & avatar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Title */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-2xl">
                        {equippedTitleItem.icon}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/40">Equipped Title</p>
                        <p className="text-sm font-bold text-white leading-tight">[{equippedTitleItem.name}]</p>
                        <p className="text-[11px] text-white/50 line-clamp-1">{equippedTitleItem.desc || 'Active title badge'}</p>
                      </div>
                    </div>
                    {equippedTitleItem.id !== 'title_novice' && equippedTitleItem.name !== 'Novice' && (
                      <button
                        onClick={() => handleUnequip('title', equippedTitleItem)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* 2. Accessory / Avatar Frame */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl">
                        {equippedAccessoryItem ? equippedAccessoryItem.icon : '⭕'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/40">Avatar Frame / Aura</p>
                        <p className="text-sm font-bold text-white leading-tight">
                          {equippedAccessoryItem ? equippedAccessoryItem.name : 'Default Border'}
                        </p>
                        <p className="text-[11px] text-white/50 line-clamp-1">
                          {equippedAccessoryItem ? equippedAccessoryItem.desc : 'No frame equipped'}
                        </p>
                      </div>
                    </div>
                    {equippedAccessoryItem && (
                      <button
                        onClick={() => handleUnequip('accessory', equippedAccessoryItem)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* 3. Outfit */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl">
                        {equippedOutfitItem ? equippedOutfitItem.icon : '🧥'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/40">Equipped Outfit</p>
                        <p className="text-sm font-bold text-white leading-tight">
                          {equippedOutfitItem ? equippedOutfitItem.name : 'None'}
                        </p>
                        <p className="text-[11px] text-white/50 line-clamp-1">
                          {equippedOutfitItem ? equippedOutfitItem.desc : 'Equip outfits from your locker'}
                        </p>
                      </div>
                    </div>
                    {equippedOutfitItem && (
                      <button
                        onClick={() => handleUnequip('outfit', equippedOutfitItem)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* 4. Emote */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
                        {equippedEmoteItem ? equippedEmoteItem.icon : '🤫'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/40">Primary Emote</p>
                        <p className="text-sm font-bold text-white leading-tight">
                          {equippedEmoteItem ? equippedEmoteItem.name : '🤫 Hush'}
                        </p>
                        <p className="text-[11px] text-white/50 line-clamp-1">
                          {equippedEmoteItem ? equippedEmoteItem.desc : 'Triggered in game rounds'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. Screen FX */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl">
                        {equippedScreenFXItem ? equippedScreenFXItem.icon : '✨'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/40">Screen Effect</p>
                        <p className="text-sm font-bold text-white leading-tight">
                          {equippedScreenFXItem ? equippedScreenFXItem.name : 'Default Flare'}
                        </p>
                        <p className="text-[11px] text-white/50 line-clamp-1">
                          {equippedScreenFXItem ? equippedScreenFXItem.desc : 'Visual celebration FX upon winning'}
                        </p>
                      </div>
                    </div>
                    {equippedScreenFXItem && (
                      <button
                        onClick={() => handleUnequip('screenFX', equippedScreenFXItem)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MY LOCKER / INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                {/* Filter pills */}
                <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'outfits', label: 'Outfits 🧥' },
                    { id: 'accessories', label: 'Accessories ⭕' },
                    { id: 'emotes', label: 'Emotes 🤫' },
                    { id: 'screenFX', label: 'Screen FX ✨' },
                    { id: 'titles', label: 'Titles 🏷️' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setInvFilter(f.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        invFilter === f.id
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredOwnedItems.length === 0 ? (
                  <div className="text-center py-12 text-white/40 space-y-2">
                    <div className="text-4xl">🎒</div>
                    <p className="font-bold text-sm">No items owned in this category yet</p>
                    <p className="text-xs text-white/30">Visit the SouL Store or open Mystery Crates to unlock cosmetics!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredOwnedItems.map((item) => {
                      const active = isEquipped(item.id, item.category);
                      const rarity = RARITIES[item.rarity] || RARITIES.common;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            active
                              ? 'bg-violet-950/40 border-violet-500 shadow-md shadow-violet-900/20'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${rarity.color} ${rarity.border} ${rarity.bg}`}>
                                {rarity.name}
                              </span>
                              <p className="text-sm font-bold text-white truncate mt-0.5">{item.name}</p>
                              <p className="text-[11px] text-white/40 line-clamp-1">{item.desc}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {active ? (
                              <button
                                onClick={() => handleUnequip(item.category, item)}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold cursor-pointer"
                              >
                                Unequip
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEquip(item.category, item)}
                                className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/25 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                              >
                                Equip
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PROFILE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-5">
                {/* Error / Success Banners */}
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-900/30 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-medium">
                    Profile successfully updated!
                  </div>
                )}

                {/* 1. Account Info Section */}
                <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      👤 Account Info
                    </span>
                    <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold">
                      Level {level} ({milestone.title})
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">
                      Display Name ({username.length}/20)
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      placeholder="Enter your nickname..."
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-white/40 pt-1 border-t border-white/5">
                    <span>Account Status</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
                    </span>
                  </div>
                </div>

                {/* 2. Audio & Sound Settings */}
                <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                    🔊 Audio & Sound Effects
                  </span>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Sound Effects (SFX)</p>
                      <p className="text-[11px] text-white/40">In-game sound effects & audio cues</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        sfxState.toggle();
                        // Force re-render of modal
                        setSuccess(false);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        !sfxState.muted
                          ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}
                    >
                      {!sfxState.muted ? '🔊 Enabled' : '🔇 Muted'}
                    </button>
                  </div>
                </div>

                {/* 3. Theme & UI Preferences */}
                <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                    🎨 Visual Theme & Notifications
                  </span>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-sm font-semibold text-white">App Skin</p>
                      <p className="text-[11px] text-white/40">Cyberpunk Dark Glassmorphism</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 font-bold">
                      Active
                    </span>
                  </div>
                </div>

                {/* 4. SouL Store Avatar Styles Redirect Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-900/40 to-pink-900/40 border border-violet-500/30 text-start space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎨</span>
                    <h4 className="text-sm font-bold text-white">Looking for Avatar Styles?</h4>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Avatar style selection and customization are now centrally managed in the <strong className="text-violet-300">SouL Store → 🎨 Avatar Styles</strong> tab. Visit the store to view, unlock, and switch your 6 unique DiceBear avatars!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>

                  <button
                    onClick={async () => {
                      await signOut();
                      onClose();
                    }}
                    className="px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs border border-red-500/30 transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export { ProfileModal as ProfileSettingsModal };
export default ProfileModal;
