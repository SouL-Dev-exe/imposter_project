/**
 * Lobby.jsx — Game setup: players, mode, options, word pack.
 * Premium AAA game aesthetics: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  EyeOff, 
  Settings2, 
  Timer, 
  Dices, 
  Package, 
  Play, 
  ArrowLeft, 
  Check, 
  ShieldAlert, 
  Plus,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { usePackStore } from '../store/packStore';
import { useLanguageStore } from '../store/languageStore';
import { CATEGORY_POOLS } from '../data/categoryPools';
import { assignRoles, pickRandomPair, GAME_MODES } from '../utils/gameLogic';
import { PlayerCard } from '../components/game/PlayerCard';
import Footer from '../components/Footer';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;
const spring = { type: 'spring', stiffness: 500, damping: 30 };

// ─── Tactical Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description, disabled = false }) {
  const isRTL = useLanguageStore((s) => s.isRTL);
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex items-center gap-3 w-full text-start p-3 rounded-xl transition-colors cursor-pointer
        ${checked ? 'bg-red-950/20 border border-red-600/40' : 'bg-zinc-900/60 border border-zinc-800'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-zinc-700'}
      `}
    >
      <div className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0
        ${checked ? 'bg-red-600' : 'bg-zinc-800'}
      `}>
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ [isRTL ? 'right' : 'left']: checked ? '22px' : '2px' }}
          transition={spring}
        />
      </div>
      <div className="min-w-0 flex-1 text-start">
        <p className="text-zinc-100 font-semibold text-sm">{label}</p>
        {description && <p className="text-zinc-500 text-xs mt-0.5">{description}</p>}
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
      setError(strings.lobby?.emptyNameError || 'Please enter a name');
      return;
    }
    if (playerNames.includes(trimmed)) {
      setError(strings.lobby?.duplicateError || 'Name already taken');
      return;
    }
    if (playerNames.length >= MAX_PLAYERS) {
      setError(strings.lobby?.maxPlayersError || 'Maximum players reached');
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
      next = [id];
    } else if (selectedCategories.includes(id)) {
      next = selectedCategories.filter((catId) => catId !== id);
      if (next.length === 0) {
        next = ['all'];
      }
    } else {
      next = [...selectedCategories, id];
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
      setError(strings.lobby?.minPlayersError || `Need at least ${MIN_PLAYERS} players`);
      return;
    }
    const pair = pickRandomPair(selectedCategories, customPacks, cloudPacks);
    const players = assignRoles(playerNames, gameMode, options, pair);
    startGame(players, pair);
    navigate('/reveal');
  };

  const canStart = playerNames.length >= MIN_PLAYERS;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-5 font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer"
            title={strings.nav?.back || 'Back'}
          >
            <ArrowLeft size={18} className="rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{strings.lobby?.title || 'Game Lobby'}</h1>
            <p className="text-zinc-500 text-xs font-mono">{strings.lobby?.subtitle || 'Setup match operatives & rules'}</p>
          </div>
        </div>

        <LanguageToggle variant="chip" />
      </div>

      {/* ── Players ──────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3.5 bg-zinc-950 border border-zinc-900 rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Users size={16} className="text-red-500" />
            <span>{strings.lobby?.players || 'Operatives'}</span>
          </h2>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold
            ${canStart ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
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
            placeholder={strings.lobby?.enterName || 'Enter operative name...'}
            maxLength={20}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-sm
                       placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-colors"
          />
          <Button variant="primary" onClick={addPlayer} disabled={!nameInput.trim()} icon={Plus} size="sm">
            {strings.lobby?.add || 'Add'}
          </Button>
        </div>

        {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

        {/* Player Cards Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
          <p className="text-zinc-500 text-xs text-center font-mono py-1">
            {strings.lobby?.needMorePlayers?.replace('{n}', MIN_PLAYERS - playerNames.length) || `Need ${MIN_PLAYERS - playerNames.length} more players`}
          </p>
        )}
      </Card>

      {/* ── Game Mode ────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3 bg-zinc-950 border border-zinc-900 rounded-xl">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-500" />
          <span>{strings.lobby?.gameMode || 'Mission Mode'}</span>
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: GAME_MODES.CONSCIOUS,
              label: strings.lobby?.modes?.conscious || 'Standard Deception',
              icon: Eye,
              desc: strings.lobby?.modes?.consciousDesc || 'Impostor knows they are the impostor and must bluff their way through.',
            },
            {
              id: GAME_MODES.BLIND,
              label: strings.lobby?.modes?.blind || 'Blind Ops',
              icon: EyeOff,
              desc: strings.lobby?.modes?.blindDesc || 'Impostor receives a similar decoy word and does not know they are rogue.',
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = gameMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setGameMode(mode.id)}
                className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer
                  ${isSelected
                    ? 'bg-red-950/20 border-red-600/70 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Icon size={16} className={isSelected ? 'text-red-500' : 'text-zinc-500'} />
                  <span className="font-semibold text-sm text-white">{mode.label}</span>
                  {isSelected && (
                    <span className="ms-auto text-[10px] font-mono uppercase bg-red-600/20 border border-red-500/40 text-red-300 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed ps-6.5">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Options ──────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3.5 bg-zinc-950 border border-zinc-900 rounded-xl">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <Settings2 size={16} className="text-red-500" />
          <span>{strings.lobby?.options || 'Match Parameters'}</span>
        </h2>
        <div className="space-y-2">
          <LanguageToggle variant="settings-row" className="mb-2" />

          <Toggle
            checked={options.mrWhite}
            onChange={(v) => setOptions({ mrWhite: v })}
            label={strings.lobby?.mrWhiteLabel || 'Mr. White (Cipher)'}
            description={strings.lobby?.mrWhiteDesc || 'Receives no word. Tries to deduce the secret word.'}
            disabled={playerNames.length < 4}
          />
          <Toggle
            checked={options.undercoverCouple}
            onChange={(v) => setOptions({ undercoverCouple: v })}
            label={strings.lobby?.coupleLabel || 'Undercover Couple'}
            description={strings.lobby?.coupleDesc || 'Two impostors who know each other.'}
            disabled={playerNames.length < 6}
          />
          <Toggle
            checked={Boolean(options.fakeImpostor && playerNames.length >= 6)}
            onChange={(v) => setOptions({ fakeImpostor: v })}
            label={t('lobby.rules.fakeImpostor') || strings.lobby?.fakeImpostorLabel || 'Decoy Operative'}
            description={t('lobby.rules.fakeImpostorDesc') || strings.lobby?.fakeImpostorDesc || 'Wins immediately if voted out. (6+ players)'}
            disabled={playerNames.length < 6}
          />
          <Toggle
            checked={options.speedTimer}
            onChange={(v) => setOptions({ speedTimer: v })}
            label={strings.lobby?.speedTimerLabel || 'Clue Countdown'}
            description={strings.lobby?.speedTimerDesc?.replace('{s}', options.timerSeconds) || `Limit clue turn to ${options.timerSeconds}s`}
          />
          {options.speedTimer && (
            <div className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
              <span className="text-zinc-400 text-xs font-mono ps-1">{strings.lobby?.timerPrefix || 'Seconds:'}</span>
              {[15, 20, 30, 45, 60].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOptions({ timerSeconds: s })}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer
                    ${options.timerSeconds === s
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }
                  `}
                >
                  {s}s
                </button>
              ))}
            </div>
          )}

          {/* Discussion Timer */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <Timer size={16} className="text-red-500" />
              <div className="flex-1 text-start">
                <p className="text-zinc-200 font-semibold text-xs">
                  {t('lobby.discussionTimerLabel')}
                </p>
                <p className="text-zinc-500 text-[11px]">
                  {t('lobby.discussionTimerDesc')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: t('clues.unlimited'), value: 0 },
                { label: '1m',  value: 60 },
                { label: '2m',  value: 120 },
                { label: '3m',  value: 180 },
                { label: '4m',  value: 240 },
                { label: '5m',  value: 300 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDiscussionTime(value)}
                  className={`flex-1 min-w-[48px] py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer
                    ${ (discussionTime ?? 120) === value
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
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

      {/* ── Word Packs ──────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3 bg-zinc-950 border border-zinc-900 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <FolderOpen size={16} className="text-red-500" />
              <span>{strings.lobby?.packsTitle || 'Word Cipher Packs'}</span>
            </h2>
            <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
              {isAllSelected ? strings.lobby?.allPacks || 'All Packs' : `${selectedCategories.length} Active`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/packs')}
            className="text-red-400 text-xs hover:text-red-300 transition-colors font-medium cursor-pointer"
          >
            {strings.lobby?.managePacks || 'Edit Packs'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {/* All Packs Card */}
          <button
            type="button"
            onClick={() => handleToggleCategory('all')}
            className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer select-none
              ${isAllSelected
                ? 'bg-red-950/25 border-red-600/80 text-white'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }
            `}
          >
            {isAllSelected && (
              <span className="absolute top-2 end-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white">
                <Check size={10} strokeWidth={3} />
              </span>
            )}
            <Dices size={22} className="mx-auto mb-1 text-red-500" />
            <p className="text-xs font-bold text-white truncate">{strings.lobby?.allPacks || 'All Categories'}</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {CATEGORY_POOLS.length} {isArabic ? 'تصنيفات' : 'pools'}
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
                    ? 'bg-red-950/25 border-red-600/80 text-white'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 end-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <Package size={20} className="mx-auto mb-1 text-zinc-400" />
                <p className="text-xs font-bold text-white truncate">{pool.category}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
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
                    ? 'bg-red-950/25 border-red-600/80 text-white'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 end-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <Package size={20} className="mx-auto mb-1 text-zinc-400" />
                <p className="text-xs font-bold text-white truncate">{pack.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
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
        icon={Play}
        className="mt-1"
      >
        {canStart
          ? (strings.lobby?.startGame || 'Commence Operation')
          : (strings.lobby?.needMorePlayers?.replace('{n}', MIN_PLAYERS - playerNames.length) || `Need ${MIN_PLAYERS - playerNames.length} More Players`)
        }
      </Button>

      <Footer className="mt-2" />
    </div>
  );
}
