import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import { useLanguageStore } from '../store/languageStore';
import { AuthModal } from '../components/ui/AuthModal';
import { UserAvatar } from '../components/ui/UserAvatar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const navigate = useNavigate();
  const { currentPhase } = useGameStore();
  const { profile } = useAuthStore();
  const { equippedAvatarStyle, equipped } = useEconomyStore();
  const { t } = useLanguageStore();
  const strings = t();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const username = profile?.username || 'Player';

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

  const handleOnlineClick = () => {
    if (!profile) {
      setShowAuthModal(true);
    } else {
      navigate('/online');
    }
  };

  const featuresList = [
    { icon: '🎭', title: strings.home.features.modes, desc: strings.home.features.modesDesc },
    { icon: '📱', title: strings.home.features.passPlay, desc: strings.home.features.passPlayDesc },
    { icon: '🌐', title: strings.home.features.online, desc: strings.home.features.onlineDesc },
    { icon: '🎨', title: strings.home.features.customPacks, desc: strings.home.features.customPacksDesc },
  ];

  return (
    <div className="min-h-full w-full flex flex-col bg-transparent text-zinc-100 relative overflow-y-auto overflow-x-hidden pb-12 font-mono">
      {/* Top Single-Row Responsive Navigation Bar */}
      <Navbar />

      {/* Surveillance background subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-950/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, delay: 3 }}
        />
      </div>

      {/* Main hero content container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          className="flex flex-col items-center gap-6 max-w-md w-full"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Hero Icon with Reticle Target */}
          <motion.div variants={floatVariants} animate="animate" className="select-none py-1 relative">
            <div className="relative flex items-center justify-center p-3 border border-red-600/40 bg-zinc-950/90 shadow-[0_0_25px_rgba(220,38,38,0.25)]">
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-red-600" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-red-600" />
              <UserAvatar
                username={username}
                avatarStyle={equippedAvatarStyle}
                equipped={equipped}
                size="xl"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={fadeUp} className="text-center space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-mono font-black tracking-widest uppercase">
              <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-600 bg-clip-text text-transparent">
                {strings.home.title}
              </span>
            </h1>
            <p className="text-sm font-mono text-zinc-300 font-bold tracking-wider uppercase">{strings.home.tagline}</p>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
              {strings.home.subtitle}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="w-full space-y-3">
            {hasActiveGame && (
              <Button variant="warning" fullWidth size="xl" onClick={handleResume} icon="▶️">
                {strings.home.resumeGame}
              </Button>
            )}
            
            <Button variant="primary" fullWidth size="xl" onClick={handleOnlineClick} icon="🎯">
              {strings.home.playOnline}
            </Button>

            <Button
              variant="secondary"
              fullWidth
              size="lg"
              onClick={() => navigate('/lobby')}
              icon="📱"
            >
              {strings.home.localMode}
            </Button>
            
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/packs')}
              icon="📁"
            >
              {strings.home.wordPacks}
            </Button>
          </motion.div>

          {/* Features grid with tactical borders */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 w-full pt-2">
            {featuresList.map((f, idx) => (
              <div
                key={idx}
                className="bg-zinc-950/80 border border-zinc-800 hover:border-red-900/80 p-3 text-center space-y-1 relative group transition-colors"
              >
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-red-600/40" />
                <div className="text-xl sm:text-2xl">{f.icon}</div>
                <p className="text-zinc-200 text-xs font-mono font-bold uppercase tracking-wider">{f.title}</p>
                <p className="text-zinc-500 text-[10px] leading-tight font-mono">{f.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeUp} className="w-full pt-2">
            <Footer />
          </motion.div>
        </motion.div>
      </main>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
