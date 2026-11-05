/**
 * SouLStoreModal.jsx — Agency Armory & Black Market Store
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Sparkles, 
  Shirt, 
  Tag, 
  Shield, 
  Smile, 
  X, 
  Lock, 
  Check, 
  Coins 
} from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { useAuthStore } from '../../store/authStore';
import { STORE_ITEMS } from '../../data/economyCatalog';
import { AVATAR_STYLES } from '../../data/avatarStyles';
import { toast } from '../../store/toastStore';
import { playClickSound, playCoinSound, vibrate } from '../../utils/sfx';
import SpyItemCard from './SpyItemCard';

const spring = { type: 'spring', stiffness: 500, damping: 28 };

function OperativeCoverCard({ style, avatarSeed, isEquipped, isOwned, isLocked, onAction }) {
  const previewUrl = `https://api.dicebear.com/9.x/${style.value}/svg?seed=${encodeURIComponent(avatarSeed)}`;

  return (
    <div
      onClick={onAction}
      className={`relative bg-zinc-950 border transition-all duration-200 p-3 flex flex-col rounded-xl group cursor-pointer font-sans ${
        isEquipped
          ? 'border-red-600 bg-red-950/15'
          : isOwned
          ? 'border-zinc-800 hover:border-zinc-700'
          : 'border-zinc-850 hover:border-zinc-750'
      }`}
    >
      {/* Top Status Bar */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-900 pb-1.5 mb-2 font-mono">
        <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-bold uppercase text-zinc-300">
          {isLocked ? `LVL ${style.minLevel}` : isOwned ? 'UNLOCKED' : 'AVAILABLE'}
        </span>
        <span className="text-zinc-600 font-bold truncate max-w-[80px]">
          #{style.value}
        </span>
      </div>

      {/* Live Avatar Preview */}
      <div className="my-2 flex items-center justify-center p-2.5 bg-zinc-900/60 border border-zinc-850 rounded-lg group-hover:border-zinc-750 transition-colors">
        {isLocked ? (
          <div className="w-14 h-14 flex items-center justify-center text-zinc-600">
            <Lock size={26} />
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={style.label}
            className="w-14 h-14 object-contain rounded"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(avatarSeed)}`;
            }}
          />
        )}
      </div>

      {/* Style Title */}
      <div className="mt-1 mb-2 text-center min-w-0">
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide truncate group-hover:text-red-400 transition-colors">
          {style.label}
        </h4>
        {style.desc && (
          <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 leading-tight">{style.desc}</p>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        disabled={isLocked}
        className={`mt-auto w-full py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors rounded-lg border flex items-center justify-center gap-1.5 ${
          isLocked
            ? 'bg-zinc-900/40 text-zinc-600 border-zinc-900 cursor-not-allowed'
            : isEquipped
            ? 'bg-zinc-800 text-zinc-200 border-zinc-700 cursor-default'
            : isOwned
            ? 'bg-zinc-900 text-zinc-300 border-zinc-750 hover:bg-zinc-800 cursor-pointer'
            : 'bg-red-600 hover:bg-red-500 text-white border-red-500 cursor-pointer'
        }`}
      >
        {isLocked ? (
          <>
            <Lock size={11} />
            <span>Clearance Lvl {style.minLevel}</span>
          </>
        ) : isEquipped ? (
          <>
            <Check size={11} strokeWidth={3} />
            <span>Active</span>
          </>
        ) : isOwned ? (
          'Deploy Cover'
        ) : (
          `Acquire · ${style.price.toLocaleString()} SC`
        )}
      </button>
    </div>
  );
}

const CATEGORY_TABS = [
  { id: 'avatarStyles', label: 'Operative Covers', icon: User },
  { id: 'accessories', label: 'Tactical Gear', icon: Sparkles },
  { id: 'outfits', label: 'Field Attire', icon: Shirt },
  { id: 'titles', label: 'Covert Dossiers', icon: Tag },
  { id: 'screenFX', label: 'Surveillance FX', icon: Shield },
  { id: 'emotes', label: 'Cipher Comms', icon: Smile },
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

  const handleStyleAction = async (style, isOwnedStyle, isLocked) => {
    playClickSound();
    vibrate(40);
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
        toast.success(`Authorized ${style.label}!`, `${style.price.toLocaleString()} Credits spent`);
        setFeedback({ type: 'success', msg: `Transfer Authorized: ${style.label} deployed!` });
      } else {
        setFeedback({ type: 'error', msg: res.error || 'Authorization failed.' });
      }
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleBuy = (item) => {
    playClickSound();
    vibrate(40);
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
    vibrate(25);
    unequipItem(category);
    setFeedback({ type: 'info', msg: 'Gear recalled from field.' });
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={spring}
          className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-850 bg-zinc-900/50 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg text-xs font-mono">
                <Coins size={14} className="text-amber-400" />
                <span className="font-bold text-amber-400 tabular-nums">{soulCoins.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500 font-semibold">SC</span>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <h2 className="text-xs font-bold tracking-wider text-white uppercase">
                Agency Armory &amp; Store
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono">
                Field Cosmetics &amp; Identity Covers
              </p>
            </div>
          </div>

          {/* Feedback banner */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`py-2 px-4 text-center text-xs font-medium border-b ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50'
                    : feedback.type === 'error'
                    ? 'bg-red-950/40 text-red-300 border-red-900/50'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal scrollable category tabs */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-850 bg-zinc-950 overflow-x-auto no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 rounded-lg border ${
                    isActive
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Card Grid */}
          {activeTab === 'avatarStyles' ? (
            <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 bg-zinc-950">
              {AVATAR_STYLES.map((style) => {
                const isActive = equippedAvatarStyle === style.value;
                const isOwnedStyle = ownedAvatarStyles.includes(style.value) || style.price === 0;
                const isLocked = (seasonLevel ?? 1) < style.minLevel;

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
            <div className="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 flex-1 bg-zinc-950">
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
                      if (active) handleUnequip(targetItem.category);
                      else if (owned) handleEquip(targetItem.category, targetItem.id);
                      else handleBuy(targetItem);
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>
              Category: <strong className="text-zinc-300">{CATEGORY_TABS.find((t) => t.id === activeTab)?.label}</strong>
            </span>
            <span>
              {activeTab === 'avatarStyles' ? AVATAR_STYLES.length : currentItems.length} items available
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
