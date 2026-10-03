import React, { useState, useEffect, useMemo, useRef } from 'react';
import soundsData from './sounds.json';

export default function Soundboard() {
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
      console.error("Failed to load favorites", e);
    }
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

  // Play audio logic
  const playSound = (sound) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(sound.url);
    audioRef.current = audio;
    setActiveSoundKey(sound.key);
    
    audio.play().catch((err) => console.error("Playback error:", err));
    audio.onended = () => setActiveSoundKey(null);

    // OPTIONAL: Send network event to emit sound to other lobby players:
    // socket.emit('play_lobby_sound', { soundKey: sound.key, url: sound.url });
  };

  // Filter list by search query and active tab
  const filteredSounds = useMemo(() => {
    const query = search.toLowerCase().trim();
    return soundsData.filter((sound) => {
      const matchesSearch = sound.name.toLowerCase().includes(query) || sound.key.includes(query);
      const matchesTab = activeTab === 'all' || favorites.includes(sound.key);
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab, favorites]);

  return (
    <div className="w-full max-w-xl bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 p-4 flex flex-col h-[550px]">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
          🔊 Lobby Soundboard
          <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {soundsData.length}
          </span>
        </h2>
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('favs')}
            className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
              activeTab === 'favs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ★ Favorites ({favorites.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="my-3 relative">
        <input
          type="text"
          placeholder="Search sounds (e.g. 'FAH', 'طفي', 'anime')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 text-sm text-slate-100 placeholder-slate-500 rounded-lg pl-3 pr-8 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable Sounds Grid */}
      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 align-content-start scrollbar-thin scrollbar-thumb-slate-700">
        {filteredSounds.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 text-sm">
            {activeTab === 'favs' ? 'No favorite sounds added yet!' : 'No sounds match your search.'}
          </div>
        ) : (
          filteredSounds.map((sound) => {
            const isFav = favorites.includes(sound.key);
            const isPlaying = activeSoundKey === sound.key;

            return (
              <div
                key={sound.key}
                onClick={() => playSound(sound)}
                className={`group relative flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                  isPlaying
                    ? 'bg-indigo-900/60 border-indigo-500 text-indigo-200 animate-pulse'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="truncate pr-4">{sound.name}</span>

                {/* Favorite Button Star */}
                <button
                  onClick={(e) => toggleFavorite(sound.key, e)}
                  className={`text-sm transition ${
                    isFav ? 'text-amber-400' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-300'
                  }`}
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  ★
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
