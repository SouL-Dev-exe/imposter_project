/**
 * useAudio.js
 * Web Audio API hook for procedurally generated sound effects.
 * Zero external dependencies — pure browser audio.
 */

import { useCallback, useRef } from 'react';

export function useAudio() {
  const ctxRef = useRef(null);

  /** Lazily create/resume the AudioContext on first use. */
  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  /**
   * Play a simple tone.
   * @param {number} frequency - Hz
   * @param {number} duration - seconds
   * @param {string} type - oscillator type
   * @param {number} gain - volume 0..1
   * @param {number} startTime - ctx.currentTime offset
   */
  const playTone = useCallback(
    (frequency, duration, type = 'sine', gain = 0.3, startTime = 0) => {
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

        gainNode.gain.setValueAtTime(gain, ctx.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + startTime + duration
        );

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      } catch (e) {
        // Silently fail if audio not supported
      }
    },
    [getCtx]
  );

  /** Single timer tick — a short high beep */
  const playTick = useCallback(() => {
    playTone(880, 0.05, 'square', 0.15);
  }, [playTone]);

  /** Final timer alarm — descending tones */
  const playAlarm = useCallback(() => {
    playTone(880, 0.15, 'sawtooth', 0.25, 0);
    playTone(660, 0.15, 'sawtooth', 0.25, 0.18);
    playTone(440, 0.3, 'sawtooth', 0.25, 0.36);
  }, [playTone]);

  /** Role reveal — upward swoosh */
  const playReveal = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.25);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }, [getCtx]);

  /** Vote reveal — drum roll then hit */
  const playVoteReveal = useCallback(() => {
    try {
      const ctx = getCtx();
      // Quick rolls
      for (let i = 0; i < 8; i++) {
        const t = i * 0.06;
        const freq = 120 + i * 10;
        playTone(freq, 0.05, 'square', 0.1, t);
      }
      // Final hit
      playTone(200, 0.4, 'sawtooth', 0.4, 0.55);
    } catch (e) {}
  }, [getCtx, playTone]);

  /** Civilians win — uplifting fanfare */
  const playWin = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone(freq, 0.25, 'triangle', 0.35, i * 0.18);
    });
  }, [playTone]);

  /** Impostors win — ominous descending */
  const playLose = useCallback(() => {
    const notes = [330, 277, 220, 185];
    notes.forEach((freq, i) => {
      playTone(freq, 0.3, 'sawtooth', 0.3, i * 0.2);
    });
  }, [playTone]);

  /** Button click feedback */
  const playClick = useCallback(() => {
    playTone(440, 0.04, 'sine', 0.1);
  }, [playTone]);

  return { playTick, playAlarm, playReveal, playVoteReveal, playWin, playLose, playClick };
}
