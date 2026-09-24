/**
 * SouLStoreModal.jsx
 * The SouL Store and Inventory Customization modal.
 * 5 Tabbed Sections: Outfits, Accessories, Emotes, Screen FX, Banners & Titles.
 * Handles Purchase, Equip, and Unequip state dynamically.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { STORE_ITEMS, RARITIES } from '../../data/economyCatalog';
import { toast } from '../../store/toastStore';
import { playClickSound, vibrate } from '../../utils/sfx';

const CATEGORY_TABS = [
  { id: 'outfits', label: 'Outfits & Clothes', icon: '🧥' },
  { id: 'accessories', label: 'Avatar Accessories', icon: '⭕' },
  { id: 'emotes', label: 'Emotes & Expressions', icon: '🤫' },
  { id: 'screenFX', label: 'Screen FX', icon: '✨' },
  { id: 'titles', label: 'Banners & Titles', icon: '🏷️' },
];

export default function SouLStoreModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('outfits');
  const [feedback, setFeedback] = useState(null);

  const {
    soulCoins,
    inventory,
    equipped,
    purchaseItem,
    equipItem,
    unequipItem,
  } = useEconomyStore();

  if (!isOpen) return null;

  const currentItems = STORE_ITEMS.filter((item) => item.category === activeTab);

  const handleBuy = (item) => {
    playClickSound();
    vibrate(50);
    const res = purchaseItem(item.id);
    if (res.success) {
      setFeedback({ type: 'success', msg: `Purchased ${item.name}!` });
      toast.success(`Purchased ${item.name}!`, `Added to your inventory`);
    } else {
      setFeedback({ type: 'error', msg: res.error || 'Purchase failed.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEquip = (category, itemId) => {
    const success = equipItem(category, itemId);
    if (success) {
      const item = STORE_ITEMS.find((i) => i.id === itemId);
      toast.equip(item?.name || 'Item', category);
      setFeedback({ type: 'info', msg: 'Item equipped!' });
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleUnequip = (category) => {
    playClickSound();
    vibrate(30);
    unequipItem(category);
    setFeedback({ type: 'info', msg: 'Item unequipped.' });
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-gradient-to-r from-violet-950/60 via-gray-900 to-indigo-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
                🛒
              </div>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  SouL Store & Locker
                </h2>
                <p className="text-white/40 text-xs">
                  Unlock cosmetics, outfits, screen effects & titles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* SC balance badge */}
              <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <span>🪙</span> {soulCoins.toLocaleString()} SC
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
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
                className={`px-4 py-2 text-center text-xs font-bold ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'
                    : feedback.type === 'error'
                    ? 'bg-red-500/20 text-red-300 border-b border-red-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-b border-blue-500/30'
                }`}
              >
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex overflow-x-auto p-2.5 gap-1.5 border-b border-white/10 bg-black/30 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Catalog grid */}
          <div className="overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 flex-1">
            {currentItems.map((item) => {
              const isOwned = inventory[item.category]?.includes(item.id);
              const isEquipped = equipped[item.category] === item.id;
              const rarityInfo = RARITIES[item.rarity] || RARITIES.common;
              const canAfford = soulCoins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-violet-950/30 border-violet-500/60 shadow-lg shadow-violet-900/30'
                      : isOwned
                      ? 'bg-white/[0.04] border-white/20'
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top rarity & equipped badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${rarityInfo.color} ${rarityInfo.border} ${rarityInfo.bg}`}
                    >
                      {rarityInfo.name}
                    </span>

                    {isEquipped ? (
                      <span className="text-[10px] font-bold text-violet-400 bg-violet-500/20 border border-violet-500/40 px-2 py-0.5 rounded-full">
                        ✓ Equipped
                      </span>
                    ) : isOwned ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Owned
                      </span>
                    ) : null}
                  </div>

                  {/* Icon & Details */}
                  <div className="text-center my-2">
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-2 transition-transform hover:scale-110"
                      style={{
                        background: `radial-gradient(circle, ${item.accent}30 0%, transparent 70%)`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight mb-1">{item.name}</h3>
                    <p className="text-[11px] text-white/40 leading-snug line-clamp-2">{item.desc}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    {isEquipped ? (
                      <button
                        onClick={() => handleUnequip(item.category)}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        Unequip
                      </button>
                    ) : isOwned ? (
                      <button
                        onClick={() => handleEquip(item.category, item.id)}
                        className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 cursor-pointer"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25 cursor-pointer hover:scale-[1.02] active:scale-98'
                            : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <span>🪙</span>
                        <span>{item.price === 0 ? 'Free' : `${item.price.toLocaleString()} SC`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer status */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/50">
            <span>
              Category: <strong className="text-white font-semibold">{CATEGORY_TABS.find((t) => t.id === activeTab)?.label}</strong>
            </span>
            <span>
              Total Items: <strong className="text-white font-semibold">{currentItems.length}</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
