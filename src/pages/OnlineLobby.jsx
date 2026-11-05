/**
 * OnlineLobby.jsx — Multiplayer room hosting and joining screen.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  Users, 
  LogOut, 
  Mic, 
  Play, 
  Package, 
  Wifi, 
  Copy, 
  Check 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useLanguageStore } from '../store/languageStore';
import { LiveChat } from '../components/game/LiveChat';
import SouLStoreModal from '../components/economy/SouLStoreModal';
import UserAvatar from '../components/ui/UserAvatar';
import VoiceChat from '../components/VoiceChat';
import { LanguageToggle } from '../components/ui/LanguageToggle';

export default function OnlineLobby() {
  const { t, isRTL } = useLanguageStore();
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

  const isArabic = isRTL;

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

  useEffect(() => {
    if (!roomCode || !isHost) return;
    const handleBeforeUnload = () => leaveRoom();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomCode, isHost, leaveRoom]);

  const handleCreate = async () => {
    if (!profile?.username) {
      setError(t('auth.play_as_guest') || 'Sign in or set codename first');
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
      setError(t('auth.play_as_guest') || 'Sign in or set codename first');
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
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white relative">
        <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-4 start-4" icon={ArrowLeft}>
          {t('online.back') || 'Back'}
        </Button>
        <LanguageToggle variant="chip" className="absolute top-4 end-4" />

        <motion.div
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 w-full max-w-sm space-y-6 shadow-xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-red-500 mb-2">
              <Wifi size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {t('online.title') || 'Online Operations'}
            </h1>
            <p className="text-zinc-500 text-xs font-mono">{t('online.subtitle') || 'Host or connect to a covert match'}</p>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 px-3 py-2 rounded-lg text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button variant="primary" fullWidth size="xl" onClick={handleCreate} disabled={loading} icon={Crown}>
              {loading ? (t('online.creating') || 'Initializing Room...') : (t('online.host_room') || 'Host Classified Room')}
            </Button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-zinc-850 flex-1" />
              <span className="text-zinc-600 text-xs uppercase tracking-widest font-mono">{t('online.or') || 'OR'}</span>
              <div className="h-px bg-zinc-850 flex-1" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={t('online.room_code_placeholder') || 'ROOM CODE'}
                maxLength={4}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-center font-mono font-bold text-lg text-white uppercase tracking-widest focus:outline-none focus:border-red-600 transition-colors"
              />
              <Button variant="secondary" onClick={handleJoin} disabled={loading || joinCode.length < 2}>
                {t('online.join') || 'Join'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. In a room
  return (
    <div className="h-[100dvh] flex flex-col max-w-4xl w-full mx-auto overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <header className="flex-none w-full bg-zinc-950 border-b border-zinc-900 px-4 py-2.5 flex items-center justify-between gap-2 z-20">
        {/* Left */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
            <span className="text-[10px] text-zinc-500 uppercase">{t('online.room_code_label') || 'Code:'}</span>
            <span className="font-bold text-xs text-white tracking-wider">
              {roomCode || '----'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowStore(true)}
            title={isArabic ? 'متجر الوكالة' : 'Armory & Store'}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg p-1 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <UserAvatar
              username={profile?.username || 'me'}
              avatarUrl={profile?.avatar_url}
              size="xs"
              showBadge={false}
            />
            <span className="text-xs font-semibold text-zinc-300 hidden sm:inline px-1">
              {t('header.shop') || (isArabic ? 'المتجر' : 'Armory')}
            </span>
          </button>

          <VoiceChat
            roomId={roomId}
            currentUser={{ id: user?.id || profile?.username, name: profile?.username }}
            players={players}
            onVoicePeersChange={setVoicePeers}
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle variant="chip" />
          <span className="text-xs font-mono font-semibold text-zinc-400">
            {t('online.players_count', { count: players.length }) || `${players.length} Players`}
          </span>
          <button
            type="button"
            onClick={handleLeave}
            className="bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{t('online.leave_room') || 'Leave'}</span>
          </button>
        </div>
      </header>

      {/* Store Modal */}
      {showStore && (
        <SouLStoreModal
          isOpen={showStore}
          initialTab="avatarStyles"
          onClose={() => setShowStore(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0 overflow-hidden">
          {/* Players Column */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-none mb-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                {t('online.players_count', { count: players.length }) || `Operative Roster (${players.length})`}
              </h2>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
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
                      className={`relative rounded-xl border flex flex-col items-center justify-center gap-1.5 p-2.5 transition-colors ${
                        p
                          ? isInVoice
                            ? 'bg-zinc-900 border-emerald-500/50'
                            : 'bg-zinc-900/80 border-zinc-800'
                          : 'bg-zinc-950/40 border-zinc-900 border-dashed opacity-40'
                      }`}
                      style={{ minHeight: '84px' }}
                    >
                      {p ? (
                        <>
                          {isInVoice && (
                            <div
                              className="absolute top-1.5 start-1.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 p-0.5 rounded text-[10px]"
                              title="Voice active"
                            >
                              <Mic size={10} />
                            </div>
                          )}

                          <UserAvatar
                            username={p.name || p.username || 'Operative'}
                            avatarUrl={p.avatar_url}
                            size="sm"
                            showBadge={false}
                          />
                          <span className="text-xs font-semibold text-white text-center truncate max-w-full px-1">
                            {p.name || p.username || 'Operative'}
                          </span>
                          {p.is_host && (
                            <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/30 border border-amber-800/40 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Crown size={9} />
                              {isArabic ? 'المضيف' : 'Host'}
                            </span>
                          )}
                          {p.userId === user?.id && (
                            <span className="text-[9px] text-zinc-400 font-mono">{isArabic ? 'أنت' : 'You'}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-zinc-900" />
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {isArabic ? `خانة ${index + 1}` : `Slot ${index + 1}`}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host actions */}
            <div className="flex-none pt-2">
              {isHost && (
                <div>
                  <Button variant="primary" fullWidth size="lg" disabled={players.length < 3} icon={Play}>
                    {t('online.start_game') || 'Commence Operation'}
                  </Button>
                  {players.length < 3 && (
                    <p className="text-zinc-500 text-xs text-center mt-1 font-mono">
                      {t('online.waiting_players') || 'Waiting for operatives (3 minimum)'}
                    </p>
                  )}
                </div>
              )}
              {!isHost && (
                <div className="text-center py-1">
                  <p className="text-zinc-400 font-mono text-xs">{t('online.waiting_host') || 'Awaiting host launch directive...'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Chat */}
          <div className="w-full md:w-80 flex-none md:flex-1 flex flex-col h-[260px] md:h-full min-h-0">
            <LiveChat />
          </div>
        </div>
      </div>
    </div>
  );
}
