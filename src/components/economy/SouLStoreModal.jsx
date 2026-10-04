import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { useAuthStore } from '../../store/authStore';
import { STORE_ITEMS } from '../../data/economyCatalog';
import { AVATAR_STYLES } from '../../data/avatarStyles';
import { toast } from '../../store/toastStore';
import { playClickSound, playCoinSound, vibrate } from '../../utils/sfx';
import SpyItemCard from './SpyItemCard';

const CATEGORY_TABS = [
  { id: 'avatarStyles', label: 'OPERATIVE COVERS', icon: '👤' },
  { id: 'accessories', label: 'TACTICAL GEAR', icon: '⭕' },
  { id: 'outfits', label: 'FIELD ATTIRE', icon: '🧥' },
  { id: 'titles', label: 'COVERT DOSSIERS', icon: '🏷️' },
  { id: 'screenFX', label: 'SURVEILLANCE FX', icon: '✨' },
  { id: 'emotes', label: 'CIPHER COMMS', icon: '🤫' },
];

export default function SouLStoreModal({ isOpen, onClose, initialTab = 'avatarStyles' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [feedback, setFeedback] = useState(null);

  const {
    soulCoins,
    purchaseItem,
    equipItem,
    unequipItem,
    isOwned,
    isEquipped,
    seasonLevel,
    equippedAvatarStyle,
    ownedAvatarStyles,
    purchaseAvatarStyle,
    equipAvatarStyle,
  } = useEconomyStore();

  const { profile } = useAuthStore();
  const avatarSeed = profile?.username || 'guest';

  if (!isOpen) return null;

  const currentItems = STORE_ITEMS.filter((item) => item.category === activeTab);

  const handleBuy = (item) => {
    playClickSound();
    vibrate(50);
    const res = purchaseItem(item.id);
    if (res.success) {
      playCoinSound();
      setFeedback({ type: 'success', msg: `Transfer Authorized: ${item.name} acquired!` });
      toast.success(`Acquired ${item.name}!`, `Added to operative locker`);
    } else {
      setFeedback({ type: 'error', msg: res.error || 'Authorization denied. Insufficient credits.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEquip = (category, itemId) => {
    const success = equipItem(category, itemId);
    if (success) {
      const item = STORE_ITEMS.find((i) => i.id === itemId);
      toast.equip(item?.name || 'Item', category);
      setFeedback({ type: 'info', msg: 'Gear deployed to field!' });
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleUnequip = (category) => {
    playClickSound();
    vibrate(30);
    unequipItem(category);
    setFeedback({ type: 'info', msg: 'Gear recalled from field.' });
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-red-900/60 shadow-[0_0_50px_rgba(220,38,38,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Tactical Reticle Corner Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-600 pointer-events-none z-20" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-600 pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-600 pointer-events-none z-20" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-600 pointer-events-none z-20" />

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-red-900/40 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-950/60 border border-red-700/60 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                🎯
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-red-100 flex items-center gap-2 uppercase tracking-wider">
                  AGENCY ARMORY // BLACK MARKET
                </h2>
                <p className="text-zinc-500 text-[10px] sm:text-xs tracking-widest uppercase">
                  CONFIDENTIAL FIELD ASSETS & CLASSIFIED GEAR
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              {/* Black Funds badge */}
              <div className="px-3 py-1.5 bg-red-950/50 border border-red-900/70 text-red-200 text-xs flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-zinc-400">BLACK FUNDS:</span>
                <span className="font-bold text-amber-400">{soulCoins.toLocaleString()}</span>
                <span className="text-[9px] text-red-400">CREDITS</span>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-red-700 flex items-center justify-center text-sm transition-colors cursor-pointer"
                title="Abort"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                dir="ltr"
                className={`px-4 py-2 text-center text-xs font-bold font-mono tracking-wider uppercase ${
                  feedback.type === 'success'
                    ? 'bg-red-950/80 text-emerald-300 border-b border-emerald-600/40'
                    : feedback.type === 'error'
                    ? 'bg-red-950/90 text-red-300 border-b border-red-600/60'
                    : 'bg-zinc-900 text-amber-300 border-b border-amber-600/40'
                }`}
              >
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tactical Horizontal Category Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 px-3 w-full flex-nowrap scroll-smooth border-b border-zinc-900 bg-black/60 font-mono">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-black border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-red-900/60 hover:text-zinc-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Catalog grid — Avatar Styles or regular items using SpyItemCard */}
          {activeTab === 'avatarStyles' ? (
            <div className="overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 flex-1 bg-black/40">
              {AVATAR_STYLES.map((style) => {
                const isActive = equippedAvatarStyle === style.value;
                const isOwnedStyle = ownedAvatarStyles.includes(style.value);
                const isLocked = (seasonLevel ?? 1) < style.minLevel;
                const avatarUrl = `https://api.dicebear.com/9.x/${style.value}/svg?seed=${encodeURIComponent(avatarSeed)}`;

                const styleItem = {
                  id: style.value,
                  name: style.label,
                  description: isLocked ? `[RESTRICTED] Requires Clearance Level ${style.minLevel}` : (style.desc || 'Classified operative identity veil.'),
                  price: style.price,
                  rarity: isLocked ? `REQ-LVL-${style.minLevel}` : style.price === 0 ? 'STANDARD' : 'RESTRICTED',
                  icon: isLocked ? (
                    <span className="text-3xl text-red-500">🔒</span>
                  ) : (
                    <img
                      src={avatarUrl}
                      alt={style.label}
                      className="w-16 h-16 object-contain p-1"
                      loading="lazy"
                    />
                  ),
                };

                const handleStyleAction = async () => {
                  playClickSound();
                  vibrate(50);
                  if (isLocked) {
                    setFeedback({ type: 'error', msg: `Clearance Denied. Reach Level ${style.minLevel} to unlock.` });
                    setTimeout(() => setFeedback(null), 3000);
                    return;
                  }
                  if (isOwnedStyle || style.price === 0) {
                    const ok = await equipAvatarStyle(style.value);
                    if (ok || style.value === 'bottts') {
                      toast.equip(style.label.replace(/^[^\s]+\s/, ''), 'Cover Identity');
                      setFeedback({ type: 'info', msg: `${style.label} deployed to field!` });
                      setTimeout(() => setFeedback(null), 2000);
                    }
                  } else {
                    const res = await purchaseAvatarStyle(style.value, style.price);
                    if (res.success) {
                      playCoinSound();
                      toast.success(`Authorized ${style.label}!`, `${style.price.toLocaleString()} Credits spent · Gear deployed`);
                      setFeedback({ type: 'success', msg: `Transfer Authorized: ${style.label} deployed!` });
                    } else {
                      setFeedback({ type: 'error', msg: res.error || 'Authorization failed.' });
                    }
                    setTimeout(() => setFeedback(null), 3000);
                  }
                };

                return (
                  <SpyItemCard
                    key={style.value}
                    item={styleItem}
                    isEquipped={isActive}
                    isOwned={isOwnedStyle || style.price === 0}
                    onAction={handleStyleAction}
                  />
                );
              })}
            </div>
          ) : (
            <div className="overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 flex-1 bg-black/40">
              {currentItems.map((item) => {
                const owned = isOwned(item.id, item.category);
                const active = isEquipped(item.id, item.category);

                return (
                  <SpyItemCard
                    key={item.id}
                    item={item}
                    isEquipped={active}
                    isOwned={owned}
                    onAction={(targetItem) => {
                      if (active) {
                        handleUnequip(targetItem.category);
                      } else if (owned) {
                        handleEquip(targetItem.category, targetItem.id);
                      } else {
                        handleBuy(targetItem);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Tactical Dossier Footer */}
          <div className="p-3 sm:p-4 border-t border-red-900/30 bg-black/80 flex items-center justify-between text-xs text-zinc-500 font-mono tracking-wider">
            <span className="uppercase text-[11px]">
              PROTOCOL: <strong className="text-zinc-200">{CATEGORY_TABS.find((t) => t.id === activeTab)?.label}</strong>
            </span>
            <span className="uppercase text-[11px]">
              DOSSIERS: <strong className="text-red-400">{activeTab === 'avatarStyles' ? AVATAR_STYLES.length : currentItems.length} ACTIVE</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

