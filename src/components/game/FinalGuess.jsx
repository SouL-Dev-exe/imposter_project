/**
 * FinalGuess.jsx — The impostor's last shot: pick the civilians' word to steal the win.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Corners, ClassifiedTag, PulseRing } from '../ui/HudFrame';
import { evaluateFinalGuess, generateFinalGuessChoices } from '../../utils/gameLogic';
import { useAudio } from '../../hooks/useAudio';
import { useLanguageStore } from '../../store/languageStore';

export function FinalGuess({ eliminatedPlayer, secretWord, wordPair, onResult }) {
  const { t } = useLanguageStore();
  const [selectedWord, setSelectedWord] = useState('');
  const [customWord, setCustomWord] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [finalChoice, setFinalChoice] = useState('');
  const { playWin, playLose, playClick } = useAudio();
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const choices = useMemo(() => generateFinalGuessChoices(secretWord, wordPair, 4), [secretWord, wordPair]);

  const handleSelectChoice = (word) => {
    playClick();
    setSelectedWord(word);
    setCustomWord('');
  };

  const handleSubmit = (chosenWord) => {
    if (submitted) return;
    const wordToSubmit = chosenWord || selectedWord || customWord;
    if (!wordToSubmit?.trim()) return;

    const correct = evaluateFinalGuess(wordToSubmit, secretWord);
    setFinalChoice(wordToSubmit);
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) playWin();
    else playLose();

    timer.current = setTimeout(() => onResult(correct), 2500);
  };

  return (
    <motion.div
      className="relative space-y-6 text-center font-mono border border-red-900/60 bg-zinc-950 p-5 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
    >
      <Corners />
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="pick" className="space-y-6" exit={{ opacity: 0, scale: 0.96 }}>
            <div className="space-y-2">
              <ClassifiedTag>Last chance</ClassifiedTag>
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <PulseRing />
                <span className="text-5xl">🕵️</span>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-widest break-words">{t('finalGuess.title')}</h3>
              <p className="text-zinc-500 text-xs sm:text-sm break-words">
                <span className="text-red-500 font-bold">
                  {t('finalGuess.caughtDesc', { name: eliminatedPlayer?.name || 'Impostor' })}
                </span>
                <br />
                {t('finalGuess.selectInstruction')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3" role="radiogroup">
              {choices.map((word, index) => {
                const isSelected = selectedWord === word;
                return (
                  <motion.button
                    key={word}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22, delay: index * 0.06 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectChoice(word)}
                    className={`relative p-3 border font-black text-base sm:text-lg flex flex-col items-center justify-center min-h-[84px] min-w-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                      isSelected
                        ? 'bg-red-600 border-red-300 text-white shadow-[0_0_30px_rgba(220,38,38,0.55)]'
                        : 'bg-black border-zinc-800 text-zinc-100 hover:border-red-700 hover:bg-zinc-900'
                    }`}
                  >
                    {isSelected && <Corners size="w-2 h-2" thick="border" color="border-white" />}
                    <span className="text-[10px] opacity-60 font-medium uppercase tracking-[0.25em] mb-1">
                      {t('finalGuess.option', { n: index + 1 })}
                    </span>
                    <span className="break-words max-w-full">{word}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="space-y-3">
              <Button
                variant="warning"
                fullWidth
                onClick={() => handleSubmit(selectedWord)}
                disabled={!selectedWord && !customWord.trim()}
                size="xl"
                icon="🎯"
              >
                {t('finalGuess.confirmChoice')}
              </Button>

              <input
                type="text"
                value={customWord}
                onChange={(e) => {
                  setCustomWord(e.target.value);
                  setSelectedWord('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(customWord)}
                placeholder={t('finalGuess.customWordPlaceholder')}
                maxLength={40}
                className="w-full bg-black border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 text-center font-mono uppercase tracking-wider focus:outline-none focus:border-red-600 focus:shadow-[0_0_14px_rgba(220,38,38,0.3)] transition-all"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="space-y-4 py-4"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 260 }}
          >
            <ClassifiedTag tone={isCorrect ? 'white' : 'red'}>{isCorrect ? 'Mission success' : 'Mission failed'}</ClassifiedTag>
            <motion.div
              className="text-7xl drop-shadow-[0_0_25px_rgba(220,38,38,0.7)]"
              animate={isCorrect ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : { x: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.7 }}
            >
              {isCorrect ? '🏆' : '💀'}
            </motion.div>
            <h3 className={`text-3xl font-black uppercase tracking-widest break-words ${isCorrect ? 'text-white' : 'text-red-500'}`}>
              {isCorrect ? t('finalGuess.impostorWins') : t('finalGuess.wrongChoice')}
            </h3>
            <p className="text-zinc-300 text-sm break-words">
              {isCorrect ? (
                <>
                  {t('finalGuess.correctNotice', { choice: finalChoice })}
                  <span className="text-xs text-zinc-500 mt-1 block">{t('finalGuess.stealsVictory')}</span>
                </>
              ) : (
                <>
                  {t('finalGuess.wrongNotice', { choice: finalChoice })}
                  <br />
                  {t('finalGuess.secretWordWas', { word: secretWord })}
                </>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
