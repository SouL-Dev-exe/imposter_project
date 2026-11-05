/**
 * ProfileModal.jsx — Agent dossier: loadout, locker, settings.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem, RARITIES } from '../../data/economyCatalog';
import { getPlayerMilestone } from '../../utils/milestones';
import { toast } from '../../store/toastStore';
import { playClickSound, vibrate, sfxState } from '../../utils/sfx';
import SouLStoreModal from '../economy/SouLStoreModal';
import { getAccessoryStyle } from '../../utils/accessories';
import { Corners, ClassifiedTag } from './HudFrame';

export { getAccessoryStyle };

const spring = { type: 'spring', stiffness: 500, damping: 28 };
const HOT_RARITIES = ['legendary', 'epic', 'mythic'];

const TABS = [
  { id: 'loadout', label: 'Loadout', icon: '🎽' },
  { id: 'inventory', label: 'Locker', icon: '🎒' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'outfits', label: 'Outfits 🧥' },
  { id: 'accessories', label: 'Accessories ⭕' },
  { id: 'emotes', label: 'Emotes 🤫' },
  { id: 'screenFX', label: 'Screen FX ✨' },
  { id: 'titles', label: 'Titles 🏷️' },
];

const ghostBtn =
  'px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black border border-zinc-700 text-zinc-400 hover:text-white hover:border-red-600 cursor-pointer transition-colors shrink-0';

function Panel({ title, right, children, className = '' }) {
  return (
    <section className={`relative bg-black/60 border border-zinc-800 p-4 space-y-3 ${className}`}>
      <Corners size="w-2 h-2" thick="border" color="border-zinc-700" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.2em] min-w-0 break-words">{title}</span>
        {right}
      </div>
      {children}
    </section>
  );
}

function LoadoutSlot({ icon, label, name, desc, onClear, clearLabel = 'Remove', wide }) {
  return (
    <div className={`p-3.5 bg-black border border-zinc-800 hover:border-red-900/70 transition-colors flex items-center justify-between gap-3 min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 shrink-0 bg-zinc-950 border border-red-900/60 flex items-center justify-center text-2xl shadow-inset-red">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em]">{label}</p>
          <p className="text-sm font-bold text-white leading-tight break-words">{name}</p>
          <p className="text-[11px] text-zinc-500 line-clamp-1">{desc}</p>
        </div>
      </div>
      {onClear && (
        <motion.button whileTap={{ scale: 0.93 }} transition={spring} onClick={onClear} className={ghostBtn}>
          {clearLabel}
        </motion.button>
      )}
    </div>
  );
}

export function ProfileModal({ isOpen, onClose, defaultTab = 'loadout' }) {
  const { profile, updateProfile, signOut } = useAuthStore();
  const { inventory, equipped, equipItem, unequipItem, isEquipped, soulCoins, seasonLevel, equippedAvatarStyle } = useEconomyStore();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [invFilter, setInvFilter] = useState('all');
  const [storeOpen, setStoreOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [, forceSfx] = useState(0);
  const successTimer = useRef(null);

  const level = profile?.level ?? 1;
  const milestone = getPlayerMilestone(level);

  const equippedTitleItem = useMemo(() => {
    const id = equipped?.title;
    if (!id || id === 'Novice' || id === 'title_novice') return { id: 'title_novice', name: 'Novice', icon: '🌱', desc: 'Default title for fresh recruits.' };
    const found = getStoreItem(id);
    if (found) return found;
    const displayName = id.replace(/^title_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { id, name: displayName, icon: '🏷️', desc: 'Player title' };
  }, [equipped?.title]);

  const outfit = useMemo(() => getStoreItem(equipped?.outfit), [equipped?.outfit]);
  const accessory = useMemo(() => getStoreItem(equipped?.accessory), [equipped?.accessory]);
  const emote = useMemo(() => getStoreItem(equipped?.emote), [equipped?.emote]);
  const screenFX = useMemo(() => getStoreItem(equipped?.screenFX), [equipped?.screenFX]);
  const accessoryStyles = useMemo(() => getAccessoryStyle(equipped?.accessory), [equipped?.accessory]);

  const avatarUrl = useMemo(() => {
    const s = equippedAvatarStyle || 'bottts';
    return `https://api.dicebear.com/9.x/${s}/svg?seed=${encodeURIComponent(username || profile?.username || 'guest')}`;
  }, [equippedAvatarStyle, username, profile?.username]);

  useEffect(() => {
    if (isOpen && profile) {
      setUsername(profile.username || '');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, profile]);

  useEffect(() => () => clearTimeout(successTimer.current), []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && !storeOpen && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [isOpen, onClose, storeOpen]);

  const handleSave = async () => {
    if (!username.trim()) return setError('Username cannot be empty!');
    setLoading(true);
    setError('');
    setSuccess(false);
    const res = await updateProfile({ username: username.trim(), avatar_url: avatarUrl });
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      toast.success('Profile updated!', 'Your changes have been saved');
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(false), 1800);
    } else {
      setError(res.error || 'Failed to save profile.');
    }
  };

  const handleEquip = (category, item) => {
    playClickSound();
    vibrate(40);
    if (equipItem(category, item.id)) toast.equip(item.name, category);
  };
  const handleUnequip = (category, item) => {
    playClickSound();
    vibrate(30);
    unequipItem(category);
    toast.info(`Unequipped ${item?.name || category}`);
  };

  const allOwnedItems = [];
  ['outfits', 'accessories', 'emotes', 'screenFX', 'titles'].forEach((cat) => {
    (inventory?.[cat] || []).forEach((id) => {
      const item = getStoreItem(id);
      if (item) allOwnedItems.push({ ...item, categoryKey: cat });
      else if (cat === 'titles') {
        allOwnedItems.push({ id, name: id, category: 'titles', categoryKey: 'titles', icon: '🏷️', desc: 'Player title', rarity: 'common' });
      }
    });
  });
  const filtered = invFilter === 'all' ? allOwnedItems : allOwnedItems.filter((i) => i.category === invFilter || i.categoryKey === invFilter);
  const isDefaultTitle = equippedTitleItem.id === 'title_novice' || equippedTitleItem.name === 'Novice';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile"
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Agent dossier"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-red-900/60 shadow-[0_0_50px_rgba(220,38,38,0.25)] overflow-hidden flex flex-col max-h-[94dvh]"
            >
              <Corners size="w-4 h-4" />
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_#dc2626] shrink-0" />

              {/* Header */}
              <div className="relative p-4 sm:p-6 border-b border-red-900/40 bg-gradient-to-b from-red-950/30 to-zinc-950 shrink-0">
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.88 }}
                  transition={spring}
                  className="absolute top-3 end-3 w-8 h-8 bg-black border border-zinc-800 hover:border-red-600 text-zinc-400 hover:text-white flex items-center justify-center text-sm cursor-pointer z-10"
                  aria-label="Close"
                >
                  ✕
                </motion.button>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="relative shrink-0">
                    {accessoryStyles.crest && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl z-10 animate-bounce">{accessoryStyles.crest}</span>
                    )}
                    <div className="relative p-1 border border-red-700/70 bg-black shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                      <Corners size="w-1.5 h-1.5" thick="border" color="border-white" />
                      <img
                        src={avatarUrl}
                        alt={profile?.username || 'Avatar'}
                        width={80}
                        height={80}
                        className={`w-20 h-20 rounded-full bg-zinc-900 transition-all duration-300 ${accessoryStyles.ring || ''}`}
                      />
                    </div>
                    {outfit && (
                      <span className="absolute -bottom-1.5 -left-1.5 w-6 h-6 bg-black border border-zinc-600 flex items-center justify-center text-xs" title={`Outfit: ${outfit.name}`}>
                        {outfit.icon}
                      </span>
                    )}
                    <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-red-600 text-white font-black text-[10px] border border-red-300/50 shadow-[0_0_10px_rgba(220,38,38,0.6)]">
                      LVL {level}
                    </span>
                  </div>

                  <div className="text-center sm:text-start flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 min-w-0">
                      <h2 className="text-xl font-black text-white uppercase tracking-wider break-words max-w-full">{profile?.username || 'Agent'}</h2>
                      <ClassifiedTag tone="white">{milestone.title}</ClassifiedTag>
                    </div>
                    <div className="mt-1.5 flex justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border border-red-700/70 bg-red-950/40 text-white max-w-full">
                        <span className="shrink-0">{equippedTitleItem.icon}</span>
                        <span className="truncate">{equippedTitleItem.name}</span>
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[11px] mt-1.5 uppercase tracking-wider">
                      Season 1 · <span className="text-white font-bold">{Number(soulCoins ?? 0).toLocaleString()} SC</span> · Tier {seasonLevel}
                    </p>
                  </div>
                </div>

                <div role="tablist" className="relative grid grid-cols-3 gap-1 mt-5 bg-black p-1 border border-zinc-800">
                  {TABS.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => { playClickSound(); setActiveTab(tab.id); }}
                        className={`relative py-2.5 px-1 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-w-0 ${active ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
                      >
                        {active && (
                          <motion.span layoutId="profile-tab" className="absolute inset-0 bg-red-600 shadow-[0_0_14px_rgba(220,38,38,0.5)]" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
                        )}
                        <span className="relative">{tab.icon}</span>
                        <span className="relative truncate">
                          {tab.label}{tab.id === 'inventory' ? ` (${allOwnedItems.length})` : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                    className="space-y-5"
                  >
                    {activeTab === 'loadout' && (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">// Active loadout</h3>
                          <span className="text-[11px] text-zinc-600">Alters your player card &amp; avatar</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <LoadoutSlot icon={equippedTitleItem.icon} label="Equipped title" name={equippedTitleItem.name} desc={equippedTitleItem.desc || 'Active title badge'} onClear={isDefaultTitle ? undefined : () => handleUnequip('title', equippedTitleItem)} clearLabel="Reset" />
                          <LoadoutSlot icon={accessory ? accessory.icon : '⭕'} label="Avatar frame / aura" name={accessory ? accessory.name : 'Default border'} desc={accessory ? accessory.desc : 'No frame equipped'} onClear={accessory ? () => handleUnequip('accessory', accessory) : undefined} />
                          <LoadoutSlot icon={outfit ? outfit.icon : '🧥'} label="Outfit" name={outfit ? outfit.name : 'None'} desc={outfit ? outfit.desc : 'Equip outfits from your locker'} onClear={outfit ? () => handleUnequip('outfit', outfit) : undefined} />
                          <LoadoutSlot icon={emote ? emote.icon : '🤫'} label="Primary emote" name={emote ? emote.name : '🤫 Hush'} desc={emote ? emote.desc : 'Triggered in game rounds'} />
                          <LoadoutSlot wide icon={screenFX ? screenFX.icon : '✨'} label="Screen effect" name={screenFX ? screenFX.name : 'Default flare'} desc={screenFX ? screenFX.desc : 'Visual celebration FX upon winning'} onClear={screenFX ? () => handleUnequip('screenFX', screenFX) : undefined} />
                        </div>
                      </>
                    )}

                    {activeTab === 'inventory' && (
                      <>
                        <div className="flex gap-1.5 pb-3 border-b border-zinc-900 overflow-x-auto no-scrollbar sm:flex-wrap">
                          {FILTERS.map((f) => (
                            <motion.button
                              key={f.id}
                              whileTap={{ scale: 0.93 }}
                              transition={spring}
                              onClick={() => { playClickSound(); setInvFilter(f.id); }}
                              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                                invFilter === f.id ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(220,38,38,0.4)]' : 'bg-black text-zinc-500 border-zinc-800 hover:text-white hover:border-red-900'
                              }`}
                            >
                              {f.label}
                            </motion.button>
                          ))}
                        </div>

                        {filtered.length === 0 ? (
                          <div className="text-center py-12 text-zinc-500 space-y-2">
                            <div className="text-4xl">🎒</div>
                            <p className="font-bold text-sm uppercase tracking-wider">Locker empty</p>
                            <p className="text-xs text-zinc-600">Visit the Armory or open Mystery Crates to unlock cosmetics.</p>
                          </div>
                        ) : (
                          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map((item) => {
                              const active = isEquipped(item.id, item.category);
                              const rarity = RARITIES?.[item.rarity] || RARITIES?.common || { name: 'Common' };
                              const hot = HOT_RARITIES.includes(String(item.rarity).toLowerCase());
                              return (
                                <motion.div
                                  layout
                                  key={item.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`relative p-3 border flex items-center justify-between gap-3 min-w-0 transition-[border-color,box-shadow] ${
                                    active ? 'bg-red-950/30 border-red-600 shadow-[0_0_18px_rgba(220,38,38,0.3)]' : 'bg-black border-zinc-800 hover:border-zinc-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                                    <div className="min-w-0">
                                      <ClassifiedTag tone={hot ? 'red' : 'muted'}>{rarity.name}</ClassifiedTag>
                                      <p className="text-sm font-bold text-white truncate mt-0.5">{item.name}</p>
                                      <p className="text-[11px] text-zinc-500 line-clamp-1">{item.desc}</p>
                                    </div>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.93 }}
                                    transition={spring}
                                    onClick={() => (active ? handleUnequip(item.categoryKey || item.category, item) : handleEquip(item.categoryKey || item.category, item))}
                                    className={`shrink-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer border ${
                                      active ? 'bg-black text-zinc-300 border-zinc-600 hover:border-red-600' : 'bg-red-600 text-white border-red-400/60 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                                    }`}
                                  >
                                    {active ? 'Unequip' : 'Equip'}
                                  </motion.button>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </>
                    )}

                    {activeTab === 'settings' && (
                      <>
                        <AnimatePresence>
                          {error && (
                            <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 bg-red-950/60 border border-red-600/60 text-red-300 text-xs font-medium overflow-hidden break-words">
                              ⚠ {error}
                            </motion.div>
                          )}
                          {success && (
                            <motion.div role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 bg-black border border-white/40 text-white text-xs font-bold uppercase tracking-wider overflow-hidden">
                              ✓ Profile updated
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Panel title="👤 Display name & account" right={<ClassifiedTag tone="muted">Lvl {level} · {milestone.title}</ClassifiedTag>}>
                          <div>
                            <label htmlFor="profile-name" className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-[0.2em]">
                              Call-sign ({username.length}/20)
                            </label>
                            <input
                              id="profile-name"
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              maxLength={20}
                              placeholder="Enter your nickname…"
                              className="w-full px-3 h-11 bg-black border border-zinc-800 text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-red-600 focus:shadow-[0_0_14px_rgba(220,38,38,0.3)] transition-all"
                            />
                          </div>
                          <div className="flex justify-between items-center text-xs text-zinc-500 pt-2 border-t border-zinc-900">
                            <span className="uppercase tracking-wider">Account status</span>
                            <span className="text-white font-bold flex items-center gap-1.5 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 bg-red-600 animate-pulse shadow-[0_0_6px_#dc2626]" /> Connected
                            </span>
                          </div>
                        </Panel>

                        <Panel title="🔊 Audio">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white">Sound effects</p>
                              <p className="text-[11px] text-zinc-500">In-game synthesized audio cues</p>
                            </div>
                            <motion.button
                              type="button"
                              role="switch"
                              aria-checked={!sfxState.muted}
                              whileTap={{ scale: 0.93 }}
                              transition={spring}
                              onClick={() => { playClickSound(); sfxState.toggle(); forceSfx((n) => n + 1); }}
                              className={`px-3 py-2 font-bold text-[11px] uppercase tracking-wider border cursor-pointer shrink-0 transition-colors ${
                                !sfxState.muted ? 'bg-red-600 border-red-400/60 text-white shadow-[0_0_14px_rgba(220,38,38,0.4)]' : 'bg-black border-zinc-700 text-zinc-500'
                              }`}
                            >
                              {!sfxState.muted ? '🔊 Enabled' : '🔇 Muted'}
                            </motion.button>
                          </div>
                        </Panel>

                        <Panel title="🎨 Avatar customization">
                          <motion.button
                            type="button"
                            onClick={() => { playClickSound(); setStoreOpen(true); }}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.98 }}
                            transition={spring}
                            className="w-full p-4 bg-black border border-red-900/70 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] text-start cursor-pointer group transition-[border-color,box-shadow]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xl group-hover:scale-110 transition-transform shrink-0">🎨</span>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors break-words">Looking for avatars? Visit the Armory</h4>
                                  <p className="text-[11px] text-zinc-500 mt-0.5">Unlock &amp; equip 20 unique DiceBear avatar styles.</p>
                                </div>
                              </div>
                              <span className="text-red-600 group-hover:translate-x-1 transition-transform font-bold shrink-0">→</span>
                            </div>
                          </motion.button>
                        </Panel>

                        <div className="flex gap-3 pt-4 border-t border-zinc-900">
                          <motion.button
                            onClick={handleSave}
                            disabled={loading}
                            whileHover={loading ? undefined : { scale: 1.02 }}
                            whileTap={loading ? undefined : { scale: 0.97 }}
                            transition={spring}
                            className="flex-1 h-12 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-[0.25em] border border-red-400/60 shadow-[0_0_25px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-wait cursor-pointer flex items-center justify-center gap-2"
                          >
                            {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                            {loading ? 'Saving…' : 'Save settings'}
                          </motion.button>
                          <motion.button
                            onClick={async () => { await signOut(); onClose(); }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            transition={spring}
                            className="px-4 h-12 bg-black hover:bg-red-950/50 text-red-400 font-bold text-[11px] uppercase tracking-wider border border-red-900/70 hover:border-red-500 cursor-pointer"
                          >
                            Sign out
                          </motion.button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SouLStoreModal isOpen={storeOpen} onClose={() => setStoreOpen(false)} initialTab="avatarStyles" />
    </>
  );
}

export { ProfileModal as ProfileSettingsModal };
export default ProfileModal;
