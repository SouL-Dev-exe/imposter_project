/**
 * useTimer.js
 * Countdown timer hook with tick callbacks.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param {number} initialSeconds
 * @param {function} onTick - called every second
 * @param {function} onEnd - called when timer reaches 0
 * @param {boolean} autoStart
 */
export function useTimer(initialSeconds, onTick, onEnd, autoStart = false) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef(null);
  const onTickRef = useRef(onTick);
  const onEndRef = useRef(onEnd);

  // Keep callbacks in refs to avoid stale closures
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((seconds) => {
    setIsRunning(false);
    setTimeLeft(seconds ?? initialSeconds);
  }, [initialSeconds]);

  const restart = useCallback((seconds) => {
    setTimeLeft(seconds ?? initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          onEndRef.current?.();
          return 0;
        }
        onTickRef.current?.(prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const progress = timeLeft / initialSeconds; // 1 → 0

  return { timeLeft, isRunning, progress, start, pause, reset, restart };
}
