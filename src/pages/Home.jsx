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
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-x-hidden">
      {/* Top Single-Row Responsive Navigation Bar */}
      <Navbar />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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

      {/* Main hero content container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          className="flex flex-col items-center gap-6 max-w-md w-full"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Hero Icon — Clean Fixed-Size User Avatar */}
          <motion.div variants={floatVariants} animate="animate" className="select-none py-1">
            <div className="relative flex items-center justify-center p-2 rounded-full">
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
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {strings.home.title}
              </span>
            </h1>
            <p className="text-lg text-white/60 font-medium">{strings.home.tagline}</p>
            <p className="text-white/40 text-xs sm:text-sm">
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
            
            <Button variant="primary" fullWidth size="xl" onClick={handleOnlineClick} icon="🌐">
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
              icon="📦"
            >
              {strings.home.wordPacks}
            </Button>
          </motion.div>

          {/* Features grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 w-full pt-2">
            {featuresList.map((f, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center space-y-1"
              >
                <div className="text-xl sm:text-2xl">{f.icon}</div>
                <p className="text-white text-xs font-bold">{f.title}</p>
                <p className="text-white/40 text-[11px] leading-tight">{f.desc}</p>
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
