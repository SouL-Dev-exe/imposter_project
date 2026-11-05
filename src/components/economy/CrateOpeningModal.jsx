/**
 * CrateOpeningModal.jsx
 * Mystery Crate Engine with Anti-Duplicate Safeguard.
 * Cost: 1,000 SC (or 1 Free Crate).
 * Drop Probabilities: Common (50%), Rare (30%), Epic (15%), Legendary (5%).
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Shield, Sparkles, Coins, Check } from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { RARITIES } from '../../data/economyCatalog';
import { playCrateOpenSound } from '../../utils/sfx';
import { toast } from '../../store/toastStore';

const spring = { type: 'spring', stiffness: 500, damping: 28 };

export default function CrateOpeningModal({ isOpen, onClose }) {
  const [opening, setOpening] = useState(false);
  const [unboxedResult, setUnboxedResult] = useState(null);

  const { soulCoins, cratesCount, openCrate } = useEconomyStore();

  if (!isOpen) return null;

  const canOpen = cratesCount > 0 || soulCoins >= 1000;

  const handleOpen = () => {
    if (!canOpen || opening) return;
    setOpening(true);
    setUnboxedResult(null);
    playCrateOpenSound();

    setTimeout(() => {
      const res = openCrate();
      setOpening(false);
      if (res.success) {
        setUnboxedResult(res);
        if (res.isDuplicate) {
          toast.coin(res.refundAmount, 'Duplicate item converted to SC');
        } else if (res.item) {
          toast.success(`Unboxed ${res.item.name}!`, `${res.rarity.toUpperCase()} rarity reward`);
        }
      }
    }, 1200);
  };

  const handleReset = () => {
    setUnboxedResult(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={spring}
          className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 text-center space-y-4"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              if (!opening) {
                setUnboxedResult(null);
                onClose();
              }
            }}
            disabled={opening}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30"
          >
            <X size={15} />
          </button>

          {/* Title */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/30 border border-amber-900/50 px-2.5 py-0.5 rounded-full">
              Field Asset Supply
            </span>
            <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">Tactical Supply Crate</h2>
            <p className="text-zinc-500 text-xs font-mono mt-0.5">
              Unlock exclusive outfits, badges, and surveillance FX
            </p>
          </div>

          {/* Crate Visual or Unboxed Result */}
          <div className="my-3 min-h-[160px] flex items-center justify-center relative">
            {!unboxedResult ? (
              <motion.div
                animate={
                  opening
                    ? {
                        rotate: [-5, 5, -5, 5, -8, 8, 0],
                        scale: [1, 1.05, 1, 1.1, 1.15],
                      }
                    : {
                        y: [0, -6, 0],
                      }
                }
                transition={
                  opening
                    ? { duration: 1.2, ease: 'easeInOut' }
                    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative"
              >
                <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 shadow-md">
                  <Package size={44} />
                </div>

                {opening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono font-bold text-amber-400"
                  >
                    Deciphering Vault...
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring}
                className="w-full"
              >
                <div
                  className={`p-4 rounded-xl border ${
                    RARITIES[unboxedResult.item.rarity]?.border || 'border-zinc-700'
                  } bg-zinc-900/60 relative overflow-hidden`}
                >
                  {/* Duplicate Alert Banner */}
                  {unboxedResult.isDuplicate && (
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mb-2.5 p-1.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 font-mono"
                    >
                      <Shield size={12} />
                      <span>Duplicate Owned! 50% Refund: +500 SC</span>
                    </motion.div>
                  )}

                  <div className="text-3xl mb-1">{unboxedResult.item.icon}</div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      RARITIES[unboxedResult.item.rarity]?.color
                    } ${RARITIES[unboxedResult.item.rarity]?.border} ${
                      RARITIES[unboxedResult.item.rarity]?.bg
                    }`}
                  >
                    {RARITIES[unboxedResult.item.rarity]?.name}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">
                    {unboxedResult.item.name}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{unboxedResult.item.desc}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Probabilities table */}
          {!unboxedResult && !opening && (
            <div className="grid grid-cols-4 gap-1 p-2 bg-zinc-900/50 border border-zinc-850 rounded-xl text-[10px] font-mono">
              <div>
                <span className="text-zinc-300 font-bold block">50%</span>
                <span className="text-zinc-500 text-[9px]">Common</span>
              </div>
              <div>
                <span className="text-blue-400 font-bold block">30%</span>
                <span className="text-zinc-500 text-[9px]">Rare</span>
              </div>
              <div>
                <span className="text-red-400 font-bold block">15%</span>
                <span className="text-zinc-500 text-[9px]">Epic</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold block">5%</span>
                <span className="text-zinc-500 text-[9px]">Legendary</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            {!unboxedResult ? (
              <button
                type="button"
                onClick={handleOpen}
                disabled={!canOpen || opening}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Package size={14} />
                <span>
                  {cratesCount > 0 ? `Open Crate (${cratesCount} available)` : `Unlock · 1,000 SC`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Open Another Crate
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
