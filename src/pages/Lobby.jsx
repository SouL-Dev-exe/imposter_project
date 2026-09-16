/**
 * Lobby.jsx — Game setup: players, mode, options, word pack.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useGameStore } from '../store/gameStore';
import { usePackStore } from '../store/packStore';
import { DEFAULT_PACKS } from '../data/defaultPacks';
import { assignRoles, pickRandomPair, GAME_MODES } from '../utils/gameLogic';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors
        ${checked ? 'bg-violet-600/20 border border-violet-500/40' : 'bg-white/5 border border-white/10'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
      `}
    >
      <div className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0
        ${checked ? 'bg-violet-600' : 'bg-white/20'}
      `}>
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
          animate={{ left: checked ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <div className="min-w-0">
        <p className="text-white font-medium text-sm">{label}</p>
        {description && <p className="text-white/40 text-xs truncate">{description}</p>}
      </div>
    </button>
  );
}

export default function Lobby() {
  const navigate = useNavigate();
  const {
    playerNames, gameMode, options, selectedPackId,
    setPlayerNames, setGameMode, setOptions, setSelectedPackId, startGame,
  } = useGameStore();

  const { customPacks, cloudPacks } = usePackStore();

  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const allPacks = [...DEFAULT_PACKS, ...customPacks, ...cloudPacks];

  const addPlayer = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (playerNames.includes(trimmed)) {
      setError('Name already added.');
      return;
    }
    if (playerNames.length >= MAX_PLAYERS) {
      setError(`Maximum ${MAX_PLAYERS} players.`);
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

  const handleStart = () => {
    if (playerNames.length < MIN_PLAYERS) {
      setError(`Need at least ${MIN_PLAYERS} players.`);
      return;
    }
    const pair = pickRandomPair(selectedPackId, customPacks, cloudPacks);
    const players = assignRoles(playerNames, gameMode, options, pair);
    startGame(players, pair);
    navigate('/reveal');
  };

  const canStart = playerNames.length >= MIN_PLAYERS;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors text-2xl">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Game Setup</h1>
          <p className="text-white/40 text-xs">Configure your party</p>
        </div>
      </div>

      {/* ── Players ──────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            👥 Players
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
            placeholder="Enter player name..."
            maxLength={20}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white
                       placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          />
          <Button variant="primary" onClick={addPlayer} disabled={!nameInput.trim()}>
            Add
          </Button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Player chips */}
        <AnimatePresence>
          <div className="flex flex-wrap gap-2">
            {playerNames.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30
                           rounded-full px-3 py-1 text-sm text-violet-300"
              >
                <span className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center
                                 text-white text-xs font-bold">
                  {i + 1}
                </span>
                {name}
                <button
                  onClick={() => removePlayer(name)}
                  className="text-violet-400/60 hover:text-red-400 ml-1 transition-colors"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {playerNames.length < MIN_PLAYERS && (
          <p className="text-white/30 text-xs text-center">
            Add {MIN_PLAYERS - playerNames.length} more player{playerNames.length === MIN_PLAYERS - 1 ? '' : 's'} to start
          </p>
        )}
      </Card>

      {/* ── Game Mode ────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <h2 className="text-white font-bold text-lg">🎭 Game Mode</h2>
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: GAME_MODES.CONSCIOUS,
              label: 'Conscious Impostor',
              emoji: '🕵️',
              desc: 'Impostor knows their role, shown only the category. Must bluff.',
            },
            {
              id: GAME_MODES.BLIND,
              label: 'Blind Infiltrator',
              emoji: '🙈',
              desc: 'Impostor sees a DIFFERENT word. Doesn\'t know they\'re the impostor!',
            },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setGameMode(mode.id)}
              className={`p-4 rounded-xl border text-left transition-all
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
                  <span className="ml-auto text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full">Selected</span>
                )}
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Options ──────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <h2 className="text-white font-bold text-lg">⚙️ Options</h2>
        <div className="space-y-2">
          <Toggle
            checked={options.mrWhite}
            onChange={(v) => setOptions({ mrWhite: v })}
            label="Mr. White / The Fool"
            description="One player gets no word — only the category"
            disabled={playerNames.length < 4}
          />
          <Toggle
            checked={options.undercoverCouple}
            onChange={(v) => setOptions({ undercoverCouple: v })}
            label="Undercover Couple"
            description="Two impostors — requires 6+ players"
            disabled={playerNames.length < 6}
          />
          <Toggle
            checked={options.speedTimer}
            onChange={(v) => setOptions({ speedTimer: v })}
            label="Speed Timer"
            description={`${options.timerSeconds}s countdown per clue`}
          />
          {options.speedTimer && (
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
              <span className="text-white/60 text-sm">Timer:</span>
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
        </div>
      </Card>

      {/* ── Word Pack ────────────────────────────────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">📦 Word Pack</h2>
          <button
            onClick={() => navigate('/packs')}
            className="text-violet-400 text-xs hover:text-violet-300 transition-colors"
          >
            Manage Packs →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedPackId('all')}
            className={`p-3 rounded-xl border text-center transition-all
              ${selectedPackId === 'all'
                ? 'bg-violet-600/30 border-violet-500 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }
            `}
          >
            <div className="text-2xl mb-1">🎲</div>
            <p className="text-xs font-bold">All Packs</p>
          </button>
          {allPacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelectedPackId(pack.id)}
              className={`p-3 rounded-xl border text-center transition-all
                ${selectedPackId === pack.id
                  ? 'bg-violet-600/30 border-violet-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }
              `}
            >
              <div className="text-2xl mb-1">{pack.icon}</div>
              <p className="text-xs font-bold truncate">{pack.name}</p>
              <p className="text-xs text-white/30">{pack.pairs.length} pairs</p>
            </button>
          ))}
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
        {canStart ? 'Start Game!' : `Need ${MIN_PLAYERS - playerNames.length} more players`}
      </Button>
    </div>
  );
}
