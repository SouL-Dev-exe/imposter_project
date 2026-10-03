import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { LiveChat } from '../components/game/LiveChat';
import { ReactionPanel } from '../components/game/ReactionPanel';
import { PlayerCard } from '../components/game/PlayerCard';
import Soundboard from '../components/Soundboard';

export default function OnlineLobby() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, user, isGuest, fetchProfile } = useAuthStore();
  const {
    roomCode, roomId, isHost, players,
    createRoom, joinRoom, leaveRoom, fetchRoomPlayers
  } = useMultiplayerStore();

  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSoundboardModal, setShowSoundboardModal] = useState(false);

  const isArabic = i18n?.language?.startsWith('ar');

  // If user somehow gets here without a profile, kick them back & force fresh fetch
  useEffect(() => {
    if (!profile) {
      navigate('/');
      return;
    }
    if (user?.id && !isGuest && fetchProfile) {
      fetchProfile(user.id);
    }
    if (roomId && fetchRoomPlayers) {
      fetchRoomPlayers(roomId);
    }
  }, [profile, user, isGuest, roomId, navigate, fetchProfile, fetchRoomPlayers]);

  // Clean up room instantly when host closes tab or refreshes browser
  useEffect(() => {
    if (!roomCode || !isHost) return;
    const handleBeforeUnload = () => leaveRoom();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomCode, isHost, leaveRoom]);

  const handleCreate = async () => {
    if (!profile?.username) {
      setError(t('auth.play_as_guest'));
      return;
    }
    setLoading(true);
    setError('');
    const res = await createRoom();
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    if (!profile?.username) {
      setError(t('auth.play_as_guest'));
      return;
    }
    setLoading(true);
    setError('');
    const res = await joinRoom(joinCode.trim());
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  // 1. Not in a room yet
  if (!roomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-4 start-4" icon="⬅️">
          {t('online.back')}
        </Button>

        <motion.div
          className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              {t('online.title')}
            </h1>
            <p className="text-white/40 text-sm">{t('online.subtitle')}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button variant="primary" fullWidth size="xl" onClick={handleCreate} disabled={loading} icon="👑">
              {loading ? t('online.creating') : t('online.host_room')}
            </Button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-white/30 text-xs uppercase tracking-widest font-bold">{t('online.or')}</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={t('online.room_code_placeholder')}
                maxLength={4}
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 text-center font-black text-xl text-white uppercase tracking-widest focus:outline-none focus:border-violet-500"
              />
              <Button variant="secondary" onClick={handleJoin} disabled={loading || joinCode.length < 2}>
                {t('online.join')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. In a room
  return (
    <div className="min-h-screen flex flex-col pt-16 p-4 max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="absolute top-4 start-4 end-4 flex justify-between items-center z-20">
        <Button variant="ghost" size="sm" onClick={handleLeave} icon="⬅️">
          {t('online.leave_room')}
        </Button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSoundboardModal(true)}
            className="bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/40 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <span>🔊</span>
            <span className="hidden sm:inline">Soundboard</span>
          </button>
          <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">{t('online.room_code_label')}</span>
            <span className="text-white font-black tracking-widest">{roomCode}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6">

        {/* Left side: Players */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-black text-white text-center md:text-start">
            {isArabic ? `اللاعبون (${players.length}/10)` : `Players (${players.length}/10)`}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {players.map((p, idx) => (
                <PlayerCard
                  key={p.id || idx}
                  player={{ ...p, isMe: p.id === user?.id }}
                  index={idx}
                  isHost={p.is_host || idx === 0}
                />
              ))}
            </AnimatePresence>

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 10 - players.length) }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-3 flex flex-col items-center justify-center gap-2 opacity-50">
                <div className="w-16 h-16 rounded-full bg-white/5" />
                <div className="w-16 h-3 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>

          {/* Host Controls */}
          {isHost && (
            <div className="pt-4">
              <Button variant="primary" fullWidth size="xl" disabled={players.length < 3} icon="🚀">
                {t('online.start_game')}
              </Button>
              {players.length < 3 && (
                <p className="text-white/40 text-xs text-center mt-2">{t('online.waiting_players')}</p>
              )}
            </div>
          )}
          {!isHost && (
            <div className="pt-4 text-center">
              <p className="text-violet-300 font-medium animate-pulse">{t('online.waiting_host')}</p>
            </div>
          )}
        </div>

        {/* Right side: Chat & Reactions */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="flex-1 min-h-[300px]">
            <LiveChat />
          </div>
        </div>

      </div>

      <ReactionPanel />

      {/* Soundboard Modal */}
      <AnimatePresence>
        {showSoundboardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSoundboardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl"
            >
              <Soundboard roomId={roomId} onClose={() => setShowSoundboardModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
