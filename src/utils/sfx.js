/**
 * sfx.js — Zero-dependency Web Audio API Sound Effects Utility
 *
 * All sounds are synthesised entirely with the Web Audio API (no files).
 * AudioContext is created lazily on first interaction (required by browsers).
 *
 * Global mute state is persisted in localStorage under 'sfx_muted'.
 */

// ─── Mute State (persisted to localStorage) ────────────────────────────────────
const STORAGE_KEY = 'sfx_muted';

function readMuted() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}
function writeMuted(val) {
  try { localStorage.setItem(STORAGE_KEY, String(val)); } catch { /* noop */ }
}

let _muted = readMuted();
const _listeners = new Set();

export const sfxState = {
  get muted() { return _muted; },
  toggle() {
    _muted = !_muted;
    writeMuted(_muted);
    _listeners.forEach((fn) => fn(_muted));
  },
  subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};

// ─── AudioContext (lazy, singleton) ────────────────────────────────────────────
let _ctx = null;
function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────
function createGain(ctx, gainValue, startTime, duration) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(gainValue, startTime);
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  g.connect(ctx.destination);
  return g;
}

function osc(ctx, type, freq, startTime, duration, gainValue = 0.3) {
  const o = ctx.createOscillator();
  const g = createGain(ctx, gainValue, startTime, duration);
  o.type = type;
  o.frequency.setValueAtTime(freq, startTime);
  o.connect(g);
  o.start(startTime);
  o.stop(startTime + duration + 0.05);
}

// ─── 1. Coin Sound ─────────────────────────────────────────────────────────────
export function playCoinSound() {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime;
  osc(ctx, 'sine', 880, t, 0.12, 0.25);
  osc(ctx, 'sine', 1320, t + 0.08, 0.18, 0.22);
  osc(ctx, 'triangle', 2640, t + 0.12, 0.12, 0.08);

  vibrate(30);
}

// ─── 2. Crate Open Sound ───────────────────────────────────────────────────────
export function playCrateOpenSound() {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime;

  const sweep = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(80, t);
  sweep.frequency.exponentialRampToValueAtTime(600, t + 0.6);
  sweepGain.gain.setValueAtTime(0.18, t);
  sweepGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  sweep.connect(sweepGain);
  sweepGain.connect(ctx.destination);
  sweep.start(t);
  sweep.stop(t + 0.75);

  const bufSize = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 200;
  noiseFilter.Q.value = 0.8;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.6, t + 0.55);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t + 0.55);

  osc(ctx, 'sine', 120, t + 0.55, 0.2, 0.4);
  osc(ctx, 'sine', 1047, t + 0.65, 0.25, 0.18);
  osc(ctx, 'sine', 1319, t + 0.72, 0.2, 0.15);

  vibrate([80, 40, 80]);
}

// ─── 3. Timer End Sound ────────────────────────────────────────────────────────
export function playTimerEndSound() {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime;
  const beepFreq = 880;
  const beepDur = 0.12;
  const gap = 0.18;

  for (let i = 0; i < 3; i++) {
    osc(ctx, 'square', beepFreq, t + i * gap, beepDur, 0.22);
  }

  vibrate([60, 40, 60, 40, 60]);
}

// ─── 4. Click Sound ───────────────────────────────────────────────────────────
export function playClickSound() {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime;
  osc(ctx, 'sine', 440, t, 0.06, 0.12);

  vibrate(20);
}

// ─── 5. Victory Sound ──────────────────────────────────────────────────────────
export function playVictorySound() {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime;
  osc(ctx, 'sine', 523.25, t,        0.5, 0.22);
  osc(ctx, 'sine', 659.25, t + 0.08, 0.5, 0.22);
  osc(ctx, 'sine', 783.99, t + 0.16, 0.5, 0.22);
  osc(ctx, 'triangle', 1046.5, t + 0.22, 0.35, 0.14);

  vibrate([100, 50, 100]);
}

// ─── 6. Emote Sound Effect ─────────────────────────────────────────────────────
export function playEmoteSound(emoteId = '') {
  if (_muted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime;
  const key = String(emoteId).toLowerCase();

  if (key.includes('hush') || key.includes('quiet')) {
    // Soft high-to-low whistle pop
    osc(ctx, 'sine', 950, t, 0.1, 0.15);
    osc(ctx, 'sine', 500, t + 0.08, 0.12, 0.1);
  } else if (key.includes('laugh') || key.includes('smile')) {
    // Staccato chuckle sound
    osc(ctx, 'triangle', 600, t, 0.06, 0.2);
    osc(ctx, 'triangle', 750, t + 0.08, 0.06, 0.2);
    osc(ctx, 'triangle', 650, t + 0.16, 0.08, 0.2);
  } else if (key.includes('fire') || key.includes('flame') || key.includes('burst')) {
    // Sizzling burst
    osc(ctx, 'sawtooth', 300, t, 0.15, 0.25);
    osc(ctx, 'sine', 700, t + 0.05, 0.2, 0.2);
  } else if (key.includes('crown') || key.includes('king') || key.includes('gold')) {
    // Royal chime
    osc(ctx, 'sine', 784, t, 0.15, 0.25);
    osc(ctx, 'sine', 1046, t + 0.1, 0.25, 0.25);
  } else {
    // Default cheerful double pop
    osc(ctx, 'sine', 587.33, t, 0.08, 0.2);
    osc(ctx, 'sine', 880, t + 0.07, 0.12, 0.2);
  }

  vibrate(30);
}

// ─── 7. Mobile Haptics ────────────────────────────────────────────────────────
export function vibrate(pattern) {
  try {
    if (navigator?.vibrate) navigator.vibrate(pattern);
  } catch { /* noop */ }
}
