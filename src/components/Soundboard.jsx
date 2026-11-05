/**
 * Soundboard.jsx — Tactical Audio Broadcast Module
 * Rebuilt with elite obsidian styling, Lucide icons, and zero emojis.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volume2, Star, X, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import soundsData from './sounds.json';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/languageStore';

export default function Soundboard({ roomId = null, onClose = null }) {
  const { isRTL, t } = useLanguageStore();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favs'
  const [activeSoundKey, setActiveSoundKey] = useState(null);
  const audioRef = useRef(null);

  // Load saved favorites on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lobby_fav_sounds') || '[]');
      setFavorites(saved);
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Toggle favorite sound key
  const toggleFavorite = (key, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      localStorage.setItem('lobby_fav_sounds', JSON.stringify(updated));
      return updated;
    });
  };

  // Play audio logic + broadcast to room
  const playSound = (sound) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(sound.url);
    audio.playsInline = true;
    audio.volume = 0.8;
    audioRef.current = audio;
    setActiveSoundKey(sound.key);

    audio.play().catch((err) => console.error('Playback error:', err));
    audio.onended = () => setActiveSoundKey(null);

    // Broadcast sound to all players in the online room
    if (roomId) {
      try {
        const channel = supabase.channel(`room_${roomId}`);
        channel
          .send({
            type: 'broadcast',
            event: 'sound_emote',
            payload: {
              soundKey: sound.key,
              soundUrl: sound.url,
              soundName: sound.name,
            },
          })
          .catch((err) => console.warn('Broadcast sound error:', err));
      } catch (err) {
        console.warn('Soundboard realtime send failed:', err);
      }
    }
  };

  // Filter list by search query and active tab
  const filteredSounds = useMemo(() => {
    const query = search.toLowerCase().trim();
    return soundsData.filter((sound) => {
      const matchesSearch =
        sound.name.toLowerCase().includes(query) || sound.key.includes(query);
      const matchesTab = activeTab === 'all' || favorites.includes(sound.key);
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab, favorites]);

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 rounded-2xl shadow-2xl border border-zinc-800 p-4 flex flex-col h-[420px] max-h-[70vh] relative select-none">
      {/* Red accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-2xl" />

      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 gap-2 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-zinc-100 font-mono">
              {t('soundboard.title') || (isRTL ? 'لوحة المؤثرات الصوتية' : 'Comms Soundboard')}
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
            {soundsData.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex gap-1 bg-zinc-900 p-0.5 rounded-lg text-xs font-mono border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded transition text-xs cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-red-600 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {t('soundboard.all') || (isRTL ? 'الكل' : 'All')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favs')}
              className={`px-2.5 py-1 rounded transition flex items-center gap-1 text-xs cursor-pointer ${
                activeTab === 'favs'
                  ? 'bg-red-600 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>({favorites.length})</span>
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition text-xs cursor-pointer"
              title={isRTL ? 'إغلاق' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="my-2.5 relative">
        <Search className="w-3.5 h-3.5 absolute start-2.5 top-2.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          dir="auto"
          placeholder={t('soundboard.search') || (isRTL ? 'تصفية المؤثرات الصوتية...' : 'Filter audio cues...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900/80 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg ps-8 pe-8 py-2 border border-zinc-800 focus:outline-none focus:border-red-600/80 transition"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute end-2.5 top-2.5 text-zinc-500 hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Scrollable Sounds Grid */}
      <div className="flex-1 overflow-y-auto pe-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5 align-content-start scrollbar-thin scrollbar-thumb-zinc-800 max-h-[60vh]">
        {filteredSounds.length === 0 ? (
          <div className="col-span-full text-center py-8 text-zinc-500 text-xs font-mono">
            {activeTab === 'favs'
              ? (t('soundboard.emptyFavs') || (isRTL ? 'لا توجد أصوات مفضلة محفوظة' : 'No favorite sounds saved'))
              : (t('soundboard.empty') || (isRTL ? 'لا توجد تطابقات صوتية' : 'No transmission matches'))}
          </div>
        ) : (
          filteredSounds.map((sound) => {
            const isFav = favorites.includes(sound.key);
            const isPlaying = activeSoundKey === sound.key;

            return (
              <div
                key={sound.key}
                onClick={() => playSound(sound)}
                className={`group relative flex items-center justify-between p-2 rounded-lg border text-xs font-mono cursor-pointer transition select-none ${
                  isPlaying
                    ? 'bg-red-950/60 border-red-600 text-red-200'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span className="truncate pe-1.5 text-[11px]">{sound.name}</span>

                {/* Favorite Star */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(sound.key, e)}
                  className={`transition flex-shrink-0 cursor-pointer ${
                    isFav
                      ? 'text-amber-400'
                      : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                  }`}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
