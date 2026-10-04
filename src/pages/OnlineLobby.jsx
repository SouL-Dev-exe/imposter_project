import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { LiveChat } from '../components/game/LiveChat';
import SouLStoreModal from '../components/economy/SouLStoreModal';
import UserAvatar from '../components/ui/UserAvatar';
import VoiceChat from '../components/VoiceChat';

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
  const [showStore, setShowStore] = useState(false);
  const [voicePeers, setVoicePeers] = useState(new Set());

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
    <div className="h-[100dvh] flex flex-col max-w-4xl w-full mx-auto overflow-hidden">

      {/* ── Clean Header — Fix 2: no absolute positioning, no RTL collision ── */}
      <header className="flex-none w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-2 z-20">

        {/* Left: Room Code + Avatar Shop shortcut + Voice Chat */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">{t('online.room_code_label')}</span>
            <span className="font-mono font-bold text-xs text-indigo-400 tracking-wider">
              {roomCode || '----'}
            </span>
          </div>
          {/* Current avatar / Store button — click to open SouL Store & Locker */}
          <button
            onClick={() => setShowStore(true)}
            title={isArabic ? 'متجر الأفاتار والملابس' : 'SouL Store & Locker'}
            className="bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-lg p-1 transition cursor-pointer flex items-center gap-1.5"
          >
            <UserAvatar
              username={profile?.username || 'me'}
              avatarUrl={profile?.avatar_url}
              size="xs"
              showBadge={false}
            />
            <span className="text-[11px] font-bold text-violet-300 hidden sm:inline">
              {isArabic ? 'المتجر والملابس' : 'Store & Locker'}
            </span>
          </button>

          {/* Real-time WebRTC Voice Chat */}
          <VoiceChat
            roomId={roomId}
            currentUser={{ id: user?.id || profile?.username, name: profile?.username }}
            players={players}
            onVoicePeersChange={setVoicePeers}
          />
        </div>

        {/* Right: Player Count + Leave Button */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
            {t('online.players_count', { count: players.length })}
          </span>
          <button
            onClick={handleLeave}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 py-1 text-xs font-mono font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            🚪 <span className="hidden sm:inline">{t('online.leave_room')}</span>
          </button>
        </div>
      </header>

      {/* Unified SouL Store & Locker Modal */}
      {showStore && (
        <SouLStoreModal
          isOpen={showStore}
          initialTab="avatarStyles"
          onClose={() => setShowStore(false)}
        />
      )}

      {/* Pad content area */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden min-h-0">

        {/* Main Container */}
        <div className="flex-1 flex flex-col md:flex-row gap-3 sm:gap-6 min-h-0 overflow-hidden">

          {/* Left side: Players column with internal scroll & sticky actions */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-none mb-2">
              <h2 className="text-lg sm:text-2xl font-mono font-black text-red-100 text-center md:text-start uppercase tracking-wider">
                {t('online.players_count', { count: players.length })}
              </h2>
            </div>

            {/* Player Grid - 10 fixed slots */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full">
                {Array.from({ length: 10 }).map((_, index) => {
                  const p = players[index];
                  const pUserId = p ? (p.userId || p.user_id || p.id) : null;
                  const isInVoice = Boolean(
                    pUserId &&
                    (voicePeers.has(pUserId) ||
                     voicePeers.has(p?.name) ||
                     voicePeers.has(p?.username) ||
                     voicePeers.has(p?.id))
                  );

                  return (
                    <div
                      key={p ? (p.id || p.playerId) : `empty-${index}`}
                      className={`relative rounded-2xl border flex flex-col items-center justify-center gap-1 p-2.5 transition-all ${p
                          ? isInVoice
                            ? 'bg-slate-800/95 border-emerald-500/50 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                            : 'bg-slate-800/90 border-indigo-500/40 shadow-md shadow-indigo-900/20'
                          : 'bg-white/5 border-white/5 border-dashed opacity-50'
                        }`}
                      style={{ minHeight: '88px' }}
                    >
                      {p ? (
                        <>
                          {/* Active Speaking / Voice Indicator */}
                          {isInVoice && (
                            <div
                              className="absolute top-1.5 start-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-1 py-0.5 rounded-md text-[10px] flex items-center gap-0.5 animate-pulse"
                              title="متصل بالمحادثة الصوتية"
                            >
                              <span>🎙️</span>
                            </div>
                          )}

                          {/* UserAvatar handles DiceBear URL, accessories & fallbacks */}
                          <UserAvatar
                            username={p.name || p.username || 'Player'}
                            avatarUrl={p.avatar_url}
                            size="sm"
                            showBadge={false}
                            className="mb-0.5"
                          />
                          <span className="text-xs font-bold text-white text-center truncate max-w-full px-1">
                            {p.name || p.username || 'Player'}
                          </span>
                          {p.is_host && (
                            <span className="text-[9px] font-semibold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                              👑 Host
                            </span>
                          )}
                          {p.userId === user?.id && (
                            <span className="text-[9px] text-indigo-300 font-semibold">أنت</span>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white/5" />
                          <span className="text-[10px] text-slate-500">انتظار...</span>
                        </>
                      )}
                    </div>
                  );
                })}
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
      </div>{/* end: Pad content area */}
    </div>
  );
}
