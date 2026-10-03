import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { LiveChat } from '../components/game/LiveChat';
import { PlayerCard } from '../components/game/PlayerCard';

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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4">
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

  // 2. In a room — Locked to 100dvh with internal scrolling
  return (
    <div className="h-[100dvh] flex flex-col pt-16 p-3 sm:p-4 max-w-4xl w-full mx-auto relative overflow-hidden">
      {/* Top Header */}
      <div className="flex-none absolute top-4 start-4 end-4 flex justify-between items-center z-20">
        <Button variant="ghost" size="sm" onClick={handleLeave} icon="⬅️">
          {t('online.leave_room')}
        </Button>
        <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">{t('online.room_code_label')}</span>
          <span className="text-white font-black tracking-widest">{roomCode}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 sm:gap-6 min-h-0 overflow-hidden">

        {/* Left side: Players column with internal scroll & sticky actions */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-none mb-2">
            <h2 className="text-lg sm:text-2xl font-black text-white text-center md:text-start">
              {isArabic ? `اللاعبون (${players.length}/10)` : `Players (${players.length}/10)`}
            </h2>
          </div>

          {/* Player Grid - Internal scrolling */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar-thin scrollbar-thumb-slate-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full">
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
                <div key={i} className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 opacity-50">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5" />
                  <div className="w-12 h-2.5 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Host Action Controls — Fixed at bottom of player panel */}
          <div className="flex-none pt-2">
            {isHost && (
              <div>
                <Button variant="primary" fullWidth size="lg" disabled={players.length < 3} icon="🚀">
                  {t('online.start_game')}
                </Button>
                {players.length < 3 && (
                  <p className="text-white/40 text-xs text-center mt-1.5">{t('online.waiting_players')}</p>
                )}
              </div>
            )}
            {!isHost && (
              <div className="text-center py-1">
                <p className="text-violet-300 font-medium text-xs sm:text-sm animate-pulse">{t('online.waiting_host')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Chat */}
        <div className="w-full md:w-80 flex-none md:flex-1 flex flex-col h-[270px] md:h-full min-h-0">
          <LiveChat />
        </div>

      </div>
    </div>
  );
}
