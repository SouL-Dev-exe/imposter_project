import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { LiveChat } from '../components/game/LiveChat';
import { ReactionPanel } from '../components/game/ReactionPanel';
import { getPlayerMilestone } from '../utils/milestones';

export default function OnlineLobby() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { 
    roomCode, isHost, players, 
    createRoom, joinRoom, leaveRoom 
  } = useMultiplayerStore();

  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user somehow gets here without a profile, kick them back
  useEffect(() => {
    if (!profile) navigate('/');
  }, [profile, navigate]);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    const res = await createRoom();
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
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
        <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-4 left-4" icon="⬅️">
          Back
        </Button>

        <motion.div 
          className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Online Lobby
            </h1>
            <p className="text-white/40 text-sm">Host a private room or join friends</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button variant="primary" fullWidth size="xl" onClick={handleCreate} disabled={loading} icon="👑">
              {loading ? 'Creating...' : 'Host New Room'}
            </Button>
            
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-white/30 text-xs uppercase tracking-widest font-bold">OR</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                maxLength={4}
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 text-center font-black text-xl text-white uppercase tracking-widest focus:outline-none focus:border-violet-500"
              />
              <Button variant="secondary" onClick={handleJoin} disabled={loading || joinCode.length < 2}>
                Join
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
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <Button variant="ghost" size="sm" onClick={handleLeave} icon="⬅️">
          Leave Room
        </Button>
        <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Room Code:</span>
          <span className="text-white font-black tracking-widest">{roomCode}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Left side: Players */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-black text-white text-center md:text-left">
            Players ({players.length}/10)
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {players.map((p) => {
                const milestone = getPlayerMilestone(p.level || 1);
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`border rounded-2xl p-3 flex flex-col items-center gap-1.5 relative overflow-hidden transition-all ${milestone.bg} ${milestone.border}`}
                  >
                    <div className="relative">
                      <img src={p.avatar_url} alt={p.username} className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 shadow-md" />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-indigo-600 text-white font-extrabold rounded-md text-[9px] shadow-md border border-white/20">
                        Lv.{p.level || 1}
                      </span>
                    </div>
                    <p className="text-white font-bold text-xs truncate w-full text-center">{p.username}</p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-black/40 border border-white/10 ${milestone.color}`}>
                      {milestone.title}
                    </span>
                  </motion.div>
                );
              })}
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
                Start Game
              </Button>
              {players.length < 3 && (
                <p className="text-white/40 text-xs text-center mt-2">Waiting for at least 3 players...</p>
              )}
            </div>
          )}
          {!isHost && (
            <div className="pt-4 text-center">
              <p className="text-violet-300 font-medium animate-pulse">Waiting for host to start...</p>
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
    </div>
  );
}
