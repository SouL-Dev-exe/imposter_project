/**
 * SpectatorAndSus.jsx — Realtime Sus Meter & Spectator Surveillance
 * Rebuilt with tactical noir styling, Lucide icons, and zero emojis.
 */
import React, { useState, useEffect } from 'react';
import { Eye, Flame, AlertCircle, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useLanguageStore } from '../../store/languageStore';

export const SpectatorAndSus = ({ roomId, isEliminated, players = [], currentUserId }) => {
  const { isRTL, t } = useLanguageStore();
  const [susScores, setSusScores] = useState({});

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`sus_${roomId}`)
      .on('broadcast', { event: 'sus_vote' }, ({ payload }) => {
        if (payload?.targetId) {
          setSusScores((prev) => ({
            ...prev,
            [payload.targetId]: (prev[payload.targetId] || 0) + 1,
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
    setSusScores((prev) => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
    const channel = supabase.channel(`sus_${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'sus_vote',
      payload: { targetId, voterId: currentUserId },
    });
  };

  return (
    <div className="space-y-3 select-none">
      {/* Banner for Spectator Mode */}
      {isEliminated && (
        <div className="bg-zinc-950 border border-red-900/60 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-mono uppercase tracking-wider mb-1">
            <Eye className="w-3.5 h-3.5 text-red-500" />
            <span>{t('spectator.mode') || (isRTL ? 'وضع مراقبة المشاهدين' : 'Spectator Surveillance Mode')}</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {t('spectator.desc') || (isRTL ? 'عميل تم إقصاؤه. لديك تصريح مراقبة حية للتلميحات ومؤشرات الشك.' : 'Eliminated operative. You have live observation clearance over clues and sus indicators.')}
          </p>
        </div>
      )}

      {/* Players List with Sus Meters */}
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => {
          const playerId = player.id || player.name;
          const susCount = susScores[playerId] || 0;
          return (
            <div
              key={playerId}
              className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-2 gap-1.5">
                <span className="font-medium text-xs text-zinc-100 truncate">
                  {player.name || player.username}
                </span>
                {susCount > 0 && (
                  <span className="bg-red-950/60 text-red-400 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-red-900/60 shrink-0 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-500" />
                    <span>{susCount} {isRTL ? 'شك' : 'SUS'}</span>
                  </span>
                )}
              </div>

              {/* Reveal secret words for Spectators */}
              {isEliminated && (
                <div className="text-[10px] text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-2 mb-2 font-mono space-y-0.5">
                  <div>{t('spectator.role') || 'ROLE:'} <span className="text-red-400 font-semibold">{player.role || '—'}</span></div>
                  <div>{t('spectator.word') || 'WORD:'} <span className="text-zinc-100 font-semibold">{player.word || (isRTL ? 'سري' : 'CLASSIFIED')}</span></div>
                </div>
              )}

              {/* Sus Vote Action Button */}
              {!isEliminated && playerId !== currentUserId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => castSusVote(playerId)}
                  className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-red-900/60 text-zinc-300 hover:text-red-400 text-xs font-mono rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-3.5 h-3.5 text-red-500" />
                  <span>{t('spectator.flagSus') || (isRTL ? 'إشارة شك' : 'Flag Sus')}</span>
                </motion.button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpectatorAndSus;
