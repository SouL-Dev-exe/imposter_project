/**
 * Lobby.jsx — Game setup: players, mode, options, word pack.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { usePackStore } from '../store/packStore';
import { useLanguageStore } from '../store/languageStore';
import { DEFAULT_PACKS } from '../data/defaultPacks';
import { CATEGORY_POOLS } from '../data/categoryPools';
import { assignRoles, pickRandomPair, GAME_MODES } from '../utils/gameLogic';
import { PlayerCard } from '../components/game/PlayerCard';
import { useAuthStore } from '../store/authStore';
import Footer from '../components/Footer';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex items-center gap-3 w-full text-start p-3 rounded-xl transition-colors
        ${checked ? 'bg-violet-600/20 border border-violet-500/40' : 'bg-white/5 border border-white/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
      `}
    >
      <div className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0
        ${checked ? 'bg-violet-600' : 'bg-white/20'}
      `}>
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
          animate={{ [document.documentElement.dir === 'rtl' ? 'right' : 'left']: checked ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-medium text-sm">{label}</p>
        {description && <p className="text-white/40 text-xs">{description}</p>}
      </div>
    </button>
  );
}

export default function Lobby() {
  const navigate = useNavigate();
  const {
    playerNames, gameMode, options, selectedCategories = ['all'],
    setPlayerNames, setGameMode, setOptions, setSelectedCategories, setDiscussionTime, startGame,
    discussionTime,
  } = useGameStore();

  const { customPacks, cloudPacks } = usePackStore();
  const { t, language } = useLanguageStore();
  const strings = t();
  const isArabic = language === 'ar';

  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  // Disable fake impostor automatically if player count drops below 6
  useEffect(() => {
    if (playerNames.length < 6 && options.fakeImpostor) {
      setOptions({ fakeImpostor: false });
    }
  }, [playerNames.length, options.fakeImpostor, setOptions]);

  const addPlayer = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError(strings.lobby.emptyNameError);
      return;
    }
    if (playerNames.includes(trimmed)) {
      setError(strings.lobby.duplicateError);
      return;
    }
    if (playerNames.length >= MAX_PLAYERS) {
      setError(strings.lobby.maxPlayersError);
      return;
    }
    setPlayerNames([...playerNames, trimmed]);
    setNameInput('');
    setError('');
  };

  const removePlayer = (name) => {
    setPlayerNames(playerNames.filter((n) => n !== name));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addPlayer();
  };

  const isAllSelected = selectedCategories.includes('all');

  const allAvailableCategoryIds = [
    ...CATEGORY_POOLS.map((p) => p.id),
    ...customPacks.map((p) => p.id),
    ...cloudPacks.map((p) => p.id),
  ];

  const handleToggleCategory = (id) => {
    if (id === 'all') {
      setSelectedCategories(['all']);
      return;
    }

    let next;
    if (isAllSelected) {
      // Toggling a pack ON when 'all' is active adds it and deselects 'All Packs'
      next = [id];
    } else if (selectedCategories.includes(id)) {
      // Toggling a pack OFF removes it
      next = selectedCategories.filter((catId) => catId !== id);
      // If all individual packs are deselected, fall back to "All Packs"
      if (next.length === 0) {
        next = ['all'];
      }
    } else {
      // Toggling a pack ON adds it
      next = [...selectedCategories, id];
      // If all available category IDs are manually selected, automatically highlight "All Packs"
      if (
        allAvailableCategoryIds.length > 0 &&
        allAvailableCategoryIds.every((availableId) => next.includes(availableId))
      ) {
        next = ['all'];
      }
    }

    setSelectedCategories(next);
  };

  const handleStart = () => {
    if (playerNames.length < MIN_PLAYERS) {
      setError(strings.lobby.minPlayersError);
      return;
    }
    const pair = pickRandomPair(selectedCategories, customPacks, cloudPacks);
    const players = assignRoles(playerNames, gameMode, options, pair);
    startGame(players, pair);
    navigate('/reveal');
  };

  const canStart = playerNames.length >= MIN_PLAYERS;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-white/40 hover:text-white transition-colors text-2xl p-1"
            title={strings.nav.back}
          >
            <span className="inline-block rtl:rotate-180">←</span>
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">{strings.lobby.title}</h1>
            <p className="text-white/40 text-xs">{strings.lobby.subtitle}</p>
          </div>
        </div>

        {/* Language Toggle in lobby */}
        <LanguageToggle variant="chip" />
      </div>

      {/* ── Players ──────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            👥 {strings.lobby.players}
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold
            ${canStart ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
          `}>
            {playerNames.length}/{MAX_PLAYERS}
          </span>
        </div>

        {/* Name input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => { setNameInput(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder={strings.lobby.enterName}
            maxLength={20}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                       placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 text-start"
          />
          <Button variant="primary" onClick={addPlayer} disabled={!nameInput.trim()}>
            {strings.lobby.add}
          </Button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Player Cards Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {playerNames.map((name, i) => (
              <PlayerCard
                key={name}
                player={{ username: name, level: 1 }}
                index={i}
                onRemove={removePlayer}
              />
            ))}
          </div>
        </AnimatePresence>

        {playerNames.length < MIN_PLAYERS && (
          <p className="text-white/30 text-xs text-center">
            {strings.lobby.needMorePlayers.replace('{n}', MIN_PLAYERS - playerNames.length)}
          </p>
        )}
      </Card>

      {/* ── Game Mode ────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <h2 className="text-white font-bold text-lg">🎭 {strings.lobby.gameMode}</h2>
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: GAME_MODES.CONSCIOUS,
              label: strings.lobby.modes.conscious,
              emoji: '🕵️',
              desc: strings.lobby.modes.consciousDesc,
            },
            {
              id: GAME_MODES.BLIND,
              label: strings.lobby.modes.blind,
              emoji: '🙈',
              desc: strings.lobby.modes.blindDesc,
            },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setGameMode(mode.id)}
              className={`p-4 rounded-xl border text-start transition-all
                ${gameMode === mode.id
                  ? 'bg-violet-600/30 border-violet-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{mode.emoji}</span>
                <span className="font-bold">{mode.label}</span>
                {gameMode === mode.id && (
                  <span className="ms-auto text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full">
                    {strings.lobby.selected}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Options ──────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <h2 className="text-white font-bold text-lg">⚙️ {strings.lobby.options}</h2>
        <div className="space-y-2">
          {/* Language Row in Options Card */}
          <LanguageToggle variant="settings-row" className="mb-3" />

          <Toggle
            checked={options.mrWhite}
            onChange={(v) => setOptions({ mrWhite: v })}
            label={strings.lobby.mrWhiteLabel}
            description={strings.lobby.mrWhiteDesc}
            disabled={playerNames.length < 4}
          />
          <Toggle
            checked={options.undercoverCouple}
            onChange={(v) => setOptions({ undercoverCouple: v })}
            label={strings.lobby.coupleLabel}
            description={strings.lobby.coupleDesc}
            disabled={playerNames.length < 6}
          />
          <Toggle
            checked={Boolean(options.fakeImpostor && playerNames.length >= 6)}
            onChange={(v) => setOptions({ fakeImpostor: v })}
            label={`🎭 ${t('lobby.rules.fakeImpostor') || strings.lobby.fakeImpostorLabel || 'Fake Impostor'}`}
            description={t('lobby.rules.fakeImpostorDesc') || strings.lobby.fakeImpostorDesc || 'Tries to get voted out to win (Requires 6+ players)'}
            disabled={playerNames.length < 6}
          />
          <Toggle
            checked={options.speedTimer}
            onChange={(v) => setOptions({ speedTimer: v })}
            label={strings.lobby.speedTimerLabel}
            description={strings.lobby.speedTimerDesc.replace('{s}', options.timerSeconds)}
          />
          {options.speedTimer && (
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
              <span className="text-white/60 text-sm">{strings.lobby.timerPrefix}</span>
              {[15, 20, 30, 45, 60].map((s) => (
                <button
                  key={s}
                  onClick={() => setOptions({ timerSeconds: s })}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors
                    ${options.timerSeconds === s
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }
                  `}
                >
                  {s}s
                </button>
              ))}
            </div>
          )}

          {/* ── Discussion Timer ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-xl">⏱️</span>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  {isArabic ? 'مؤقت النقاش' : 'Discussion Timer'}
                </p>
                <p className="text-white/40 text-xs">
                  {isArabic ? 'وقت المناقشة الجماعية' : 'Shared group discussion countdown'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 px-1">
              {[
                { label: isArabic ? 'بلا حد' : 'Unlimited', value: 0 },
                { label: '1m',  value: 60 },
                { label: '2m',  value: 120 },
                { label: '3m',  value: 180 },
                { label: '4m',  value: 240 },
                { label: '5m',  value: 300 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setDiscussionTime(value)}
                  className={`flex-1 min-w-[52px] py-2 rounded-xl text-sm font-bold transition-all border
                    ${ (discussionTime ?? 120) === value
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/10'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Word Pack ────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-lg">📦 {strings.lobby.wordPack}</h2>
            {!isAllSelected && (
              <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-medium">
                {selectedCategories.length} {isArabic ? 'محدد' : 'selected'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/packs')}
            className="text-violet-400 text-xs hover:text-violet-300 transition-colors"
          >
            {strings.lobby.managePacks}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {/* All Packs Card */}
          <button
            type="button"
            onClick={() => handleToggleCategory('all')}
            className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer select-none
              ${isAllSelected
                ? 'bg-violet-600/30 border-violet-500 text-white shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/50'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }
            `}
          >
            {isAllSelected && (
              <span className="absolute top-2 end-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            )}
            <div className="text-2xl mb-1">🎲</div>
            <p className="text-xs font-bold">{strings.lobby.allPacks}</p>
            <p className="text-xs text-white/30">
              {CATEGORY_POOLS.length} {isArabic ? 'تصنيفات' : 'categories'}
            </p>
          </button>

          {/* Dynamic Category Pools Cards */}
          {CATEGORY_POOLS.map((pool) => {
            const isSelected = !isAllSelected && selectedCategories.includes(pool.id);
            return (
              <button
                key={pool.id}
                type="button"
                onClick={() => handleToggleCategory(pool.id)}
                className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer select-none
                  ${isSelected
                    ? 'bg-violet-600/30 border-violet-500 text-white shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/50'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 end-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                )}
                <div className="text-2xl mb-1">{pool.icon}</div>
                <p className="text-xs font-bold truncate">{pool.category}</p>
                <p className="text-xs text-white/30">
                  {pool.words.length} {isArabic ? 'كلمة' : 'words'}
                </p>
              </button>
            );
          })}

          {/* Custom and Cloud Packs Cards */}
          {[...customPacks, ...cloudPacks].map((pack) => {
            const isSelected = !isAllSelected && selectedCategories.includes(pack.id);
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => handleToggleCategory(pack.id)}
                className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer select-none
                  ${isSelected
                    ? 'bg-violet-600/30 border-violet-500 text-white shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/50'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 end-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                )}
                <div className="text-2xl mb-1">{pack.icon || '📦'}</div>
                <p className="text-xs font-bold truncate">{pack.name}</p>
                <p className="text-xs text-white/30">
                  {pack.words
                    ? `${pack.words.length} ${isArabic ? 'كلمة' : 'words'}`
                    : `${(pack.pairs?.length || 0) * 2} ${isArabic ? 'كلمة' : 'words'}`}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Start Button */}
      <Button
        variant="primary"
        fullWidth
        size="xl"
        onClick={handleStart}
        disabled={!canStart}
        icon="🚀"
        className="mt-2"
      >
        {canStart
          ? strings.lobby.startGame
          : strings.lobby.needMorePlayers.replace('{n}', MIN_PLAYERS - playerNames.length)
        }
      </Button>

      <Footer className="mt-4" />
    </div>
  );
}
