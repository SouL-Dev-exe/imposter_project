/**
 * FinalGuess.jsx — Impostor's one last chance to steal the win by choosing from word options.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
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

  // Generate candidate word choices (shuffled)
  const choices = useMemo(() => {
    return generateFinalGuessChoices(secretWord, wordPair, 4);
  }, [secretWord, wordPair]);

  const handleSelectChoice = (word) => {
    playClick();
    setSelectedWord(word);
    setCustomWord('');
  };

  const handleSubmit = (chosenWord) => {
    const wordToSubmit = chosenWord || selectedWord || customWord;
    if (!wordToSubmit.trim()) return;

    const correct = evaluateFinalGuess(wordToSubmit, secretWord);
    setFinalChoice(wordToSubmit);
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) playWin();
    else playLose();

    setTimeout(() => onResult(correct), 2500);
  };

  return (
    <motion.div
      className="space-y-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {!submitted ? (
        <>
          {/* Dramatic header */}
          <div className="space-y-2">
            <div className="text-5xl">🕵️</div>
            <h3 className="text-2xl font-black text-white">{t('finalGuess.title')}</h3>
            <p className="text-white/60 text-sm">
              <span className="text-red-400 font-bold">
                {t('finalGuess.caughtDesc', { name: eliminatedPlayer?.name || 'Impostor' })}
              </span>
              <br />{t('finalGuess.selectInstruction')}
            </p>
          </div>

          {/* Multiple choice word grid */}
          <div className="grid grid-cols-2 gap-3 my-4">
            {choices.map((word, index) => {
              const isSelected = selectedWord === word;
              return (
                <motion.button
                  key={word}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelectChoice(word)}
                  className={`p-4 rounded-2xl border font-black text-lg transition-all shadow-lg flex flex-col items-center justify-center min-h-[80px]
                    ${
                      isSelected
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300 text-white ring-4 ring-amber-500/40 scale-105'
                        : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90'
                    }
                  `}
                >
                  <span className="text-xs opacity-50 font-normal uppercase tracking-wider mb-1">
                    {t('finalGuess.option', { n: index + 1 })}
                  </span>
                  <span>{word}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Submit button */}
          <div className="space-y-3 pt-2">
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

            {/* Custom word toggle / fallback */}
            <div className="pt-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => {
                  setCustomWord(e.target.value);
                  setSelectedWord('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(customWord)}
                placeholder={t('finalGuess.customWordPlaceholder')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/80
                           placeholder-white/30 text-center font-medium focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </>
      ) : (
        <motion.div
          className="space-y-4 py-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="text-7xl">{isCorrect ? '🏆' : '💀'}</div>
          <h3 className={`text-3xl font-black ${isCorrect ? 'text-amber-400' : 'text-red-400'}`}>
            {isCorrect ? t('finalGuess.impostorWins') : t('finalGuess.wrongChoice')}
          </h3>
          <p className="text-white/80 text-base font-medium">
            {isCorrect ? (
              <>
                {t('finalGuess.correctNotice', { choice: finalChoice })}
                <br /><span className="text-xs text-white/60 mt-1 block">{t('finalGuess.stealsVictory')}</span>
              </>
            ) : (
              <>
                {t('finalGuess.wrongNotice', { choice: finalChoice })}
                <br />{t('finalGuess.secretWordWas', { word: secretWord })}
              </>
            )}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
