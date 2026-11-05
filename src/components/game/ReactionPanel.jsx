/**
 * ReactionPanel.jsx — Tactical Quick-Signal Floating Triggers
 * Replaces all emojis with crisp Lucide vector tactical signals and smooth spring physics.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Flame, Eye, HelpCircle, Smile, Crosshair } from 'lucide-react';
import { useMultiplayerStore } from '../../store/multiplayerStore';

const SIGNALS = [
  { id: 'skull', key: 'skull', icon: Skull, label: 'Killed', color: 'text-red-500 border-red-500/30 bg-red-950/60' },
  { id: 'flame', key: 'flame', icon: Flame, label: 'Sus', color: 'text-amber-500 border-amber-500/30 bg-amber-950/60' },
  { id: 'eye', key: 'eye', icon: Eye, label: 'Watched', color: 'text-sky-400 border-sky-500/30 bg-sky-950/60' },
  { id: 'help', key: 'doubt', icon: HelpCircle, label: 'Doubt', color: 'text-zinc-200 border-zinc-700 bg-zinc-900/80' },
  { id: 'smile', key: 'amused', icon: Smile, label: 'Amused', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/60' },
  { id: 'crosshair', key: 'target', icon: Crosshair, label: 'Target', color: 'text-red-400 border-red-500/30 bg-red-950/60' },
];

function resolveSignalIcon(key) {
  if (key === '\uD83D\uDC80' || key === 'skull') return SIGNALS[0];
  if (key === '\uD83D\uDD25' || key === 'flame') return SIGNALS[1];
  if (key === '\uD83D\uDC40' || key === 'eye') return SIGNALS[2];
  if (key === '\uD83E\uDD14' || key === 'doubt') return SIGNALS[3];
  if (key === '\uD83E\uDD23' || key === 'amused') return SIGNALS[4];
  if (key === '\uD83C\uDFAF' || key === 'target') return SIGNALS[5];
  return { icon: Crosshair, color: 'text-zinc-200 border-zinc-700 bg-zinc-900/80' };
}

export function ReactionPanel() {
  const { reactions, sendReaction } = useMultiplayerStore();

  return (
    <>
      {/* Floating Tactical Signal Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => {
            const sig = resolveSignalIcon(r.emoji);
            const Icon = sig.icon;
            const xDrift = (Math.random() - 0.5) * 60;

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 80, x: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: -240,
                  x: xDrift,
                  scale: [0.6, 1.15, 1, 0.85],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-24 end-8 pointer-events-none"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center backdrop-blur-md shadow-lg ${sig.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Reaction Quick Bar */}
      <div className="fixed bottom-3 end-4 z-40 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-1.5 rounded-xl shadow-2xl flex items-center gap-1">
        {SIGNALS.map((signal) => {
          const Icon = signal.icon;
          return (
            <motion.button
              key={signal.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={() => sendReaction(signal.key)}
              className="w-8 h-8 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-center transition cursor-pointer text-zinc-300 hover:text-zinc-100"
              title={signal.label}
              type="button"
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

export default ReactionPanel;
