/**
 * ProfileModal.jsx — Agent dossier: loadout, locker, settings.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Package, 
  Settings, 
  X, 
  Volume2, 
  VolumeX, 
  Shield, 
  Shirt, 
  Sparkles, 
  Tag, 
  Smile, 
  ArrowRight,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem, RARITIES } from '../../data/economyCatalog';
import { getPlayerMilestone } from '../../utils/milestones';
import { toast } from '../../store/toastStore';
import { playClickSound, vibrate, sfxState } from '../../utils/sfx';
import SouLStoreModal from '../economy/SouLStoreModal';
import { getAccessoryStyle } from '../../utils/accessories';

export { getAccessoryStyle };

const spring = { type: 'spring', stiffness: 500, damping: 28 };

const TABS = [
  { id: 'loadout', label: 'Loadout', icon: UserCheck },
  { id: 'inventory', label: 'Locker', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'outfits', label: 'Outfits' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'emotes', label: 'Emotes' },
  { id: 'screenFX', label: 'Screen FX' },
  { id: 'titles', label: 'Titles' },
];

function Panel({ title, right, children, className = '' }) {
  return (
    <section className={`bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">{title}</span>
        {right}
      </div>
      {children}
    </section>
  );
}

function LoadoutSlot({ icon, label, name, desc, onClear, clearLabel = 'Remove', wide }) {
  return (
    <div className={`p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-xl text-zinc-300">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-mono text-zinc-500">{label}</p>
          <p className="text-xs font-bold text-white truncate">{name}</p>
          <p className="text-[10px] text-zinc-400 truncate">{desc}</p>
        </div>
      </div>
      {onClear && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={spring}
          onClick={onClear}
          className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors shrink-0"
        >
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
    if (!id || id === 'Novice' || id === 'title_novice') return { id: 'title_novice', name: 'Novice', accent: '#dc2626', desc: 'Default title for fresh recruits.' };
    const found = getStoreItem(id);
    if (found) return found;
    const displayName = id.replace(/^title_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { id, name: displayName, accent: '#dc2626', desc: 'Player title' };
  }, [equipped?.title]);

  const outfit = useMemo(() => getStoreItem(equipped?.outfit), [equipped?.outfit]);
  const accessory = useMemo(() => getStoreItem(equipped?.accessory), [equipped?.accessory]);
  const emote = useMemo(() => getStoreItem(equipped?.emote), [equipped?.emote]);
  const screenFX = useMemo(() => getStoreItem(equipped?.screenFX), [equipped?.screenFX]);

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
    vibrate(30);
    if (equipItem(category, item.id)) toast.equip(item.name, category);
  };

  const handleUnequip = (category, item) => {
    playClickSound();
    vibrate(20);
    unequipItem(category);
    toast.info(`Unequipped ${item?.name || category}`);
  };

  const allOwnedItems = [];
  ['outfits', 'accessories', 'emotes', 'screenFX', 'titles'].forEach((cat) => {
    (inventory?.[cat] || []).forEach((id) => {
      const item = getStoreItem(id);
      if (item) allOwnedItems.push({ ...item, categoryKey: cat });
      else if (cat === 'titles') {
        allOwnedItems.push({ id, name: id, category: 'titles', categoryKey: 'titles', desc: 'Player title', rarity: 'common' });
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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Operative Dossier"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={spring}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92dvh]"
            >
              {/* Header */}
              <div className="relative p-4 sm:p-5 border-b border-zinc-850 bg-zinc-900/40 shrink-0">
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={spring}
                  className="absolute top-4 right-4 w-7 h-7 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                >
                  <X size={15} />
                </motion.button>

                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                      {profile?.username || 'Guest'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${milestone.bg} ${milestone.color}`}>
                        {milestone.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Level {level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-zinc-850 bg-zinc-950 px-4 shrink-0">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'border-red-600 text-white'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-red-500' : 'text-zinc-500'} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                <AnimatePresence mode="wait">
                  {/* TAB 1: LOADOUT */}
                  {activeTab === 'loadout' && (
                    <motion.div
                      key="loadout"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      <Panel title="Active Loadout Slots">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <LoadoutSlot
                            icon={<Shirt size={18} />}
                            label="Field Attire"
                            name={outfit?.name || 'Standard Covert'}
                            desc={outfit?.description || 'Default field outfit'}
                            onClear={outfit ? () => handleUnequip('outfit', outfit) : null}
                          />
                          <LoadoutSlot
                            icon={<Sparkles size={18} />}
                            label="Tactical Accessory"
                            name={accessory?.name || 'None'}
                            desc={accessory?.description || 'No accessory active'}
                            onClear={accessory ? () => handleUnequip('accessory', accessory) : null}
                          />
                          <LoadoutSlot
                            icon={<Tag size={18} />}
                            label="Operative Title"
                            name={equippedTitleItem.name}
                            desc={equippedTitleItem.desc}
                            onClear={!isDefaultTitle ? () => handleUnequip('title', equippedTitleItem) : null}
                          />
                          <LoadoutSlot
                            icon={<Smile size={18} />}
                            label="Quick Emote"
                            name={emote?.name || 'None'}
                            desc={emote?.description || 'No emote equipped'}
                            onClear={emote ? () => handleUnequip('emote', emote) : null}
                          />
                        </div>
                      </Panel>
                    </motion.div>
                  )}

                  {/* TAB 2: INVENTORY / LOCKER */}
                  {activeTab === 'inventory' && (
                    <motion.div
                      key="inventory"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-3.5"
                    >
                      {/* Filter pills */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {FILTERS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setInvFilter(f.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                              invFilter === f.id
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {filtered.length === 0 ? (
                        <div className="text-center py-10 bg-zinc-900/30 border border-zinc-850 rounded-xl">
                          <Package size={32} className="mx-auto text-zinc-600 mb-2" />
                          <p className="text-sm font-semibold text-zinc-400">Locker Empty</p>
                          <p className="text-xs text-zinc-500 mt-1">Acquire cosmetic gear in the store.</p>
                          <button
                            type="button"
                            onClick={() => setStoreOpen(true)}
                            className="mt-3 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Browse Store
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {filtered.map((item) => {
                            const active = isEquipped(item.id, item.category);
                            return (
                              <div
                                key={item.id}
                                className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                  <p className="text-[10px] text-zinc-500 uppercase font-mono">{item.category}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => active ? handleUnequip(item.category, item) : handleEquip(item.category, item)}
                                  className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                                    active
                                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                      : 'bg-red-600 hover:bg-red-500 text-white'
                                  }`}
                                >
                                  {active ? 'Unequip' : 'Equip'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 3: SETTINGS */}
                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      <Panel title="Operative Codename">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={20}
                            placeholder="Enter call-sign..."
                            className="w-full px-3.5 h-10 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                          />
                          {error && (
                            <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                              <AlertCircle size={13} />
                              <span>{error}</span>
                            </p>
                          )}
                          {success && (
                            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              <span>Profile updated successfully!</span>
                            </p>
                          )}
                        </div>
                      </Panel>

                      <Panel title="Audio Settings">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-white">Sound Effects</p>
                            <p className="text-[11px] text-zinc-500">In-game sound fx cues and haptics</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { playClickSound(); sfxState.toggle(); forceSfx((n) => n + 1); }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-colors flex items-center gap-1.5 ${
                              !sfxState.muted
                                ? 'bg-red-600 text-white border-red-500'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            {!sfxState.muted ? <Volume2 size={13} /> : <VolumeX size={13} />}
                            <span>{!sfxState.muted ? 'Enabled' : 'Muted'}</span>
                          </button>
                        </div>
                      </Panel>

                      <div className="flex gap-2 pt-2 border-t border-zinc-850">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={loading}
                          className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <Save size={14} />
                          <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => { await signOut(); onClose(); }}
                          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-red-400 font-semibold text-xs rounded-lg border border-zinc-800 cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
