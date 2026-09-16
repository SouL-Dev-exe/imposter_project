/**
 * Home.jsx — Landing page with animated hero and navigation.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useGameStore } from '../store/gameStore';

const floatVariants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FEATURES = [
  { icon: '🎭', title: 'Two Game Modes', desc: 'Conscious Impostor or Blind Infiltrator' },
  { icon: '📱', title: 'Pass & Play', desc: 'One device, no internet needed' },
  { icon: '🎨', title: 'Custom Packs', desc: 'Create, share & import word packs' },
  { icon: '⏱️', title: 'Speed Timer', desc: 'Optional 30s countdown per clue' },
];

export default function Home() {
  const navigate = useNavigate();
  const { currentPhase, resetGame } = useGameStore();

  const hasActiveGame =
    currentPhase !== 'home' && currentPhase !== 'lobby' && currentPhase !== 'result';

  const handleResume = () => {
    const routes = {
      reveal: '/reveal',
      clues: '/clues',
      vote: '/vote',
      result: '/result',
    };
    navigate(routes[currentPhase] || '/lobby');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, delay: 3 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1.5 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Hero icon */}
        <motion.div variants={floatVariants} animate="animate" className="text-8xl select-none">
          🕵️
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Undercover
            </span>
          </h1>
          <p className="text-xl text-white/60 font-medium">The party deception game</p>
          <p className="text-white/40 text-sm">
            3–10 players · No internet required · Free forever
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} className="w-full space-y-3">
          {hasActiveGame && (
            <Button variant="warning" fullWidth size="xl" onClick={handleResume} icon="▶️">
              Resume Game
            </Button>
          )}
          <Button
            variant="primary"
            fullWidth
            size="xl"
            onClick={() => navigate('/lobby')}
            icon="🎮"
          >
            New Game
          </Button>
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => navigate('/packs')}
            icon="📦"
          >
            Word Packs
          </Button>
        </motion.div>

        {/* Features grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 w-full">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-center space-y-1"
            >
              <div className="text-2xl">{f.icon}</div>
              <p className="text-white text-xs font-bold">{f.title}</p>
              <p className="text-white/40 text-xs leading-tight">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p variants={fadeUp} className="text-white/20 text-xs text-center">
          Built for GitHub Pages · All data stays on your device
        </motion.p>
      </motion.div>
    </div>
  );
}
