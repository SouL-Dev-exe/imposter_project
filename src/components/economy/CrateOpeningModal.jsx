/**
 * CrateOpeningModal.jsx
 * Mystery Crate (Loot Box) Engine with Anti-Duplicate Safeguard.
 * Cost: 1,000 SC (or 1 Free Crate).
 * Drop Probabilities: Common (50%), Rare (30%), Epic (15%), Legendary (5%).
 * Duplicate Protection: Automatically refunds 50% SC (+500 SC) with an animated banner.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { RARITIES } from '../../data/economyCatalog';
import { playCrateOpenSound, playCoinSound } from '../../utils/sfx';
import { toast } from '../../store/toastStore';

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

    // Simulated thrilling suspense delay (1.5s)
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
    }, 1500);
  };

  const handleReset = () => {
    setUnboxedResult(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 text-center"
        >
          {/* Close button */}
          <button
            onClick={() => {
              if (!opening) {
                setUnboxedResult(null);
                onClose();
              }
            }}
            disabled={opening}
            className="absolute top-4 end-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer disabled:opacity-30"
          >
            ✕
          </button>

          {/* Title */}
          <div className="mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Mystery Loot Box
            </span>
            <h2 className="text-2xl font-black text-white mt-2">Epic SouL Crate</h2>
            <p className="text-white/40 text-xs">
              Unbox exclusive outfits, badges, emotes, and FX
            </p>
          </div>

          {/* Crate Visual or Unboxed Result */}
          <div className="my-6 min-h-[200px] flex items-center justify-center relative">
            {!unboxedResult ? (
              <motion.div
                animate={
                  opening
                    ? {
                        rotate: [-6, 6, -6, 6, -10, 10, 0],
                        scale: [1, 1.1, 1.05, 1.15, 1.2],
                      }
                    : {
                        y: [0, -8, 0],
                      }
                }
                transition={
                  opening
                    ? { duration: 1.5, ease: 'easeInOut' }
                    : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative"
              >
                {/* Glow backdrop */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-purple-500/30 rounded-full blur-2xl -z-10" />

                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-500/20 via-purple-600/30 to-pink-500/20 border-2 border-amber-400/50 flex items-center justify-center text-6xl shadow-2xl shadow-amber-500/30">
                  🎁
                </div>

                {opening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-amber-300 animate-pulse"
                  >
                    Unlocking Vault...
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-full"
              >
                {/* Unboxed card */}
                <div
                  className={`p-6 rounded-3xl border-2 ${
                    RARITIES[unboxedResult.item.rarity]?.border || 'border-white/20'
                  } bg-gradient-to-b from-white/[0.07] to-black/40 relative overflow-hidden shadow-2xl`}
                >
                  {/* Duplicate Alert Banner */}
                  {unboxedResult.isDuplicate && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mb-3 p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>🛡️</span> Duplicate Owned! 50% Refund: +500 SC
                    </motion.div>
                  )}

                  <div className="text-5xl mb-2">{unboxedResult.item.icon}</div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      RARITIES[unboxedResult.item.rarity]?.color
                    } ${RARITIES[unboxedResult.item.rarity]?.border} ${
                      RARITIES[unboxedResult.item.rarity]?.bg
                    }`}
                  >
                    {RARITIES[unboxedResult.item.rarity]?.name}
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">
                    {unboxedResult.item.name}
                  </h3>
                  <p className="text-white/40 text-xs mt-1">{unboxedResult.item.desc}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Probabilities table */}
          {!unboxedResult && !opening && (
            <div className="grid grid-cols-4 gap-1 p-2 bg-black/40 border border-white/5 rounded-2xl mb-4 text-[11px]">
              <div>
                <span className="text-slate-400 font-bold block">50%</span>
                <span className="text-white/30 text-[9px]">Common</span>
              </div>
              <div>
                <span className="text-blue-400 font-bold block">30%</span>
                <span className="text-white/30 text-[9px]">Rare</span>
              </div>
              <div>
                <span className="text-purple-400 font-bold block">15%</span>
                <span className="text-white/30 text-[9px]">Epic</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold block">5%</span>
                <span className="text-white/30 text-[9px]">Legendary</span>
              </div>
            </div>
          )}

          {/* Action button */}
          <div>
            {!unboxedResult ? (
              <button
                onClick={handleOpen}
                disabled={!canOpen || opening}
                className={`w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  canOpen && !opening
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                }`}
              >
                <span>🎁</span>
                <span>
                  {opening
                    ? 'Opening Crate...'
                    : cratesCount > 0
                    ? `Open Free Crate (${cratesCount} available)`
                    : 'Open Crate (1,000 SC)'}
                </span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Open Another
                </button>
                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Balance info footer */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <span>
              Balance: <strong className="text-amber-300">{soulCoins.toLocaleString()} SC</strong>
            </span>
            <span>
              Free Crates: <strong className="text-purple-300">{cratesCount}</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
