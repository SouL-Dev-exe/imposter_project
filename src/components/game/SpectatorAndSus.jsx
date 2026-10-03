import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const SpectatorAndSus = ({ roomId, isEliminated, players = [], currentUserId }) => {
  const [susScores, setSusScores] = useState({});

  useEffect(() => {
    if (!roomId) return;
    // Realtime broadcast for dynamic Sus Meter clicks
    const channel = supabase.channel(`sus_${roomId}`)
      .on('broadcast', { event: 'sus_vote' }, ({ payload }) => {
        if (payload?.targetId) {
          setSusScores((prev) => ({
            ...prev,
            [payload.targetId]: (prev[payload.targetId] || 0) + 1
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const castSusVote = async (targetId) => {
    if (!roomId) return;
    // Send realtime Sus vote
    setSusScores((prev) => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
    const channel = supabase.channel(`sus_${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'sus_vote',
      payload: { targetId, voterId: currentUserId }
    });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Banner for Spectator Mode */}
      {isEliminated && (
        <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-3 text-center shadow-lg animate-pulse">
          <span className="text-xs text-red-300 font-bold block mb-0.5">👁️ وضع المشاهد (Spectator Mode)</span>
          <p className="text-[11px] text-gray-300">راك مقصي! تقدر تتبع الجولة والـ Sus Meter بلا ما تقدر تصوت.</p>
        </div>
      )}

      {/* Players List with Sus Meters */}
      <div className="grid grid-cols-2 gap-2.5">
        {players.map((player) => {
          const playerId = player.id || player.name;
          const susCount = susScores[playerId] || 0;
          return (
            <div 
              key={playerId} 
              className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-2 gap-1">
                <span className="font-bold text-xs sm:text-sm text-white truncate">{player.name || player.username}</span>
                {susCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/30 shrink-0">
                    🔥 {susCount} Sus
                  </span>
                )}
              </div>

              {/* Reveal secret words for Spectators */}
              {isEliminated && (
                <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-1.5 mb-2">
                  <div>Role: <span className="font-mono font-bold text-amber-200">{player.role || '—'}</span></div>
                  <div>Word: <span className="font-mono font-bold text-white">{player.word || 'بدون كلمة'}</span></div>
                </div>
              )}

              {/* Sus Vote Action Button */}
              {!isEliminated && playerId !== currentUserId && (
                <button
                  type="button"
                  onClick={() => castSusVote(playerId)}
                  className="w-full py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/30 text-red-200 text-xs font-bold rounded-xl active:scale-95 transition cursor-pointer"
                >
                  🧐 مشبوه (Sus)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpectatorAndSus;
