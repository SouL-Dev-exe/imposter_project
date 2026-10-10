import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { useAuthStore } from '../../store/authStore';
import { STORE_ITEMS } from '../../data/economyCatalog';
import { AVATAR_STYLES } from '../../data/avatarStyles';
import { toast } from '../../store/toastStore';
import { playClickSound, playCoinSound, vibrate } from '../../utils/sfx';
import SpyItemCard from './SpyItemCard';

/* ============================================================
   OPERATIVE COVER CARD
   Fixes: truncated names, overflow watermark, live DiceBear preview
   ============================================================ */
function OperativeCoverCard({ style, avatarSeed, isEquipped, isOwned, isLocked, onAction }) {
  const previewUrl = `https://api.dicebear.com/9.x/${style.value}/svg?seed=${encodeURIComponent(avatarSeed)}`;

  return (
    <div
      onClick={onAction}
      className={`relative bg-zinc-950/90 border transition-all duration-200 p-3 flex flex-col overflow-hidden group cursor-pointer ${
        isEquipped
          ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] bg-red-950/10'
          : isOwned
          ? 'border-zinc-700 hover:border-zinc-500'
          : 'border-zinc-900 hover:border-red-900/60'
      }`}
    >
      {/* Background watermark — clipped cleanly inside the card */}
      <div
        aria-hidden="true"
        className="absolute right-1 bottom-1 font-black text-xl select-none pointer-events-none uppercase text-zinc-900/40 max-w-[80%] truncate leading-none"
      >
        {isLocked ? 'LOCKED' : isOwned ? 'CLEARED' : 'RESTRICTED'}
      </div>

      {/* TOP STATUS BAR */}
      <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 border-b border-zinc-900 pb-1.5 mb-2 gap-1 min-w-0">
        <span className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 font-bold uppercase truncate max-w-[72px] shrink-0">
          {isLocked ? `LVL ${style.minLevel}` : isOwned ? 'STANDARD' : 'RESTRICTED'}
        </span>
        <span className="tracking-widest text-zinc-600 truncate min-w-0">
          #{style.value}
        </span>
      </div>

      {/* LIVE AVATAR PREVIEW */}
      <div className="my-2 flex items-center justify-center p-2 bg-zinc-900/50 border border-zinc-900 group-hover:border-red-900/40 transition-colors">
        {isLocked ? (
          <div className="w-16 h-16 flex items-center justify-center text-3xl text-red-500 filter drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]">
            🔒
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={style.label}
            className="w-16 h-16 object-contain rounded-full"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(avatarSeed)}`;
            }}
          />
        )}
      </div>

      {/* STYLE TITLE */}
      <div className="mt-1 mb-3 text-center min-w-0">
        <h4 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wide truncate group-hover:text-red-400 transition-colors">
          {style.label}
        </h4>
        {style.desc && (
          <p className="text-[9px] text-zinc-600 mt-0.5 line-clamp-1 leading-tight">{style.desc}</p>
        )}
      </div>

      {/* ACTION BUTTON */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onAction(); }}
        disabled={isLocked}
        className={`mt-auto w-full py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all rounded-none ${
          isLocked
            ? 'bg-zinc-900/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            : isEquipped
            ? 'bg-red-600 text-black shadow-[0_0_10px_rgba(220,38,38,0.5)] cursor-default'
            : isOwned
            ? 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 cursor-pointer'
            : 'bg-red-950/60 text-red-300 border border-red-800/80 hover:bg-red-600 hover:text-black cursor-pointer'
        }`}
      >
        {isLocked
          ? `🔒 CLEARANCE LVL ${style.minLevel}`
          : isEquipped
          ? '✓ ENGAGED'
          : isOwned
          ? 'DEPLOY TO FIELD'
          : `ACQUIRE // ${style.price.toLocaleString()} SC`}
      </button>
    </div>
  );
}

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
  const avatarSeed  = profile?.username || 'guest';

  if (!isOpen) return null;

  const currentItems = STORE_ITEMS.filter((item) => item.category === activeTab);

  const handleStyleAction = async (style, isOwnedStyle, isLocked) => {
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

          {/* ── MODAL HEADER ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-red-900/40 bg-zinc-900/50 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {/* Close button */}
              <button
                onClick={onClose}
                className="w-8 h-8 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-white border border-zinc-800 hover:border-red-700 flex items-center justify-center text-sm transition-colors cursor-pointer"
                title="Abort"
              >
                ✕
              </button>
              {/* Black Funds badge */}
              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-900/60 px-3 py-1 font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-zinc-400">BLACK FUNDS:</span>
                <span className="font-bold text-amber-400">{soulCoins.toLocaleString()}</span>
                <span className="text-[9px] text-red-400">CREDITS</span>
              </div>
            </div>

            {/* Title — hidden on very small screens */}
            <div className="text-right hidden sm:block">
              <h2 className="font-mono text-sm font-black tracking-widest text-zinc-100 uppercase">
                AGENCY ARMORY // BLACK MARKET
              </h2>
              <p className="font-mono text-[10px] text-zinc-500 tracking-wider">
                CONFIDENTIAL FIELD ASSETS &amp; CLASSIFIED GEAR
              </p>
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

          {/* ── HORIZONTAL SCROLLABLE CATEGORY TABS ───────────────────────── */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-zinc-900 bg-black/60 overflow-x-auto no-scrollbar flex-nowrap scroll-smooth font-mono">
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

          {/* ── CARD GRID ─────────────────────────────────────────────────── */}
          {activeTab === 'avatarStyles' ? (
            /* Avatar Styles → OperativeCoverCard with live DiceBear previews */
            <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 bg-black/40">
              {AVATAR_STYLES.map((style) => {
                const isActive      = equippedAvatarStyle === style.value;
                const isOwnedStyle  = ownedAvatarStyles.includes(style.value) || style.price === 0;
                const isLocked      = (seasonLevel ?? 1) < style.minLevel;

                return (
                  <OperativeCoverCard
                    key={style.value}
                    style={style}
                    avatarSeed={avatarSeed}
                    isEquipped={isActive}
                    isOwned={isOwnedStyle}
                    isLocked={isLocked}
                    onAction={() => handleStyleAction(style, isOwnedStyle, isLocked)}
                  />
                );
              })}
            </div>
          ) : (
            /* All other tabs → existing SpyItemCard */
            <div className="overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 flex-1 bg-black/40">
              {currentItems.map((item) => {
                const owned  = isOwned(item.id, item.category);
                const active = isEquipped(item.id, item.category);

                return (
                  <SpyItemCard
                    key={item.id}
                    item={item}
                    isEquipped={active}
                    isOwned={owned}
                    onAction={(targetItem) => {
                      if (active)       handleUnequip(targetItem.category);
                      else if (owned)   handleEquip(targetItem.category, targetItem.id);
                      else              handleBuy(targetItem);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* ── TACTICAL DOSSIER FOOTER ──────────────────────────────────── */}
          <div className="px-4 py-2.5 border-t border-red-900/30 bg-black/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono tracking-wider">
            <span className="uppercase">
              PROTOCOL: <strong className="text-zinc-200">{CATEGORY_TABS.find((t) => t.id === activeTab)?.label}</strong>
            </span>
            <span className="uppercase">
              DOSSIERS: <strong className="text-red-400">
                {activeTab === 'avatarStyles' ? AVATAR_STYLES.length : currentItems.length} ACTIVE
              </strong>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

