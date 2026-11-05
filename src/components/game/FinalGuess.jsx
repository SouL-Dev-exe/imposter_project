/**
 * FinalGuess.jsx — The impostor's last shot: pick the civilians' word to steal the win.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Target, Trophy, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { evaluateFinalGuess, generateFinalGuessChoices } from '../../utils/gameLogic';
import { useAudio } from '../../hooks/useAudio';
import { useLanguageStore } from '../../store/languageStore';

const spring = { type: 'spring', stiffness: 450, damping: 28 };

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
      className="relative space-y-6 text-center font-sans border border-zinc-800 bg-zinc-950 p-6 rounded-2xl"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="pick" className="space-y-5" exit={{ opacity: 0, scale: 0.96 }}>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-900/60 rounded-full text-xs text-red-400 font-mono uppercase">
                <AlertTriangle size={13} />
                {t('finalGuess.title')}
              </span>

              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-red-500 mt-2">
                <Eye size={32} />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('finalGuess.title') || 'Final Impostor Deduction'}
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                <span className="text-red-400 font-semibold">
                  {t('finalGuess.caughtDesc', { name: eliminatedPlayer?.name || 'Impostor' })}
                </span>
                <br />
                {t('finalGuess.selectInstruction') || 'Guess the civilians secret cipher to steal victory.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5" role="radiogroup">
              {choices.map((word, index) => {
                const isSelected = selectedWord === word;
                return (
                  <motion.button
                    key={word}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={spring}
                    onClick={() => handleSelectChoice(word)}
                    className={`relative p-3.5 border rounded-xl font-bold text-sm sm:text-base flex flex-col items-center justify-center min-h-[76px] cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-red-950/30 border-red-600 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-0.5">
                      {t('finalGuess.option', { n: index + 1 }) || `Option ${index + 1}`}
                    </span>
                    <span className="truncate max-w-full">{word}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="space-y-3 pt-1">
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleSubmit(selectedWord)}
                disabled={!selectedWord && !customWord.trim()}
                size="xl"
                icon={Target}
              >
                {t('finalGuess.confirmChoice') || 'Confirm Secret Cipher'}
              </Button>

              <input
                type="text"
                value={customWord}
                onChange={(e) => {
                  setCustomWord(e.target.value);
                  setSelectedWord('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(customWord)}
                placeholder={t('finalGuess.customWordPlaceholder') || 'Or type custom guess...'}
                maxLength={40}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 text-center font-mono focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="space-y-4 py-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring}
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
              {isCorrect ? (
                <Trophy size={36} className="text-amber-400" />
              ) : (
                <XCircle size={36} className="text-red-500" />
              )}
            </div>

            <h3 className={`text-2xl font-black tracking-tight ${isCorrect ? 'text-white' : 'text-red-400'}`}>
              {isCorrect ? (t('finalGuess.impostorWins') || 'Cipher Cracked! Impostor Wins!') : (t('finalGuess.wrongChoice') || 'Incorrect Deduction!')}
            </h3>

            <p className="text-zinc-300 text-xs max-w-sm mx-auto leading-relaxed">
              {isCorrect ? (
                <>
                  {t('finalGuess.correctNotice', { choice: finalChoice }) || `Correctly guessed "${finalChoice}"!`}
                  <span className="text-zinc-500 block mt-1">{t('finalGuess.stealsVictory') || 'The impostor stole victory from the jaws of defeat!'}</span>
                </>
              ) : (
                <>
                  {t('finalGuess.wrongNotice', { choice: finalChoice }) || `Guessed "${finalChoice}".`}
                  <br />
                  <span className="text-zinc-400 mt-1 block">
                    {t('finalGuess.secretWordWas', { word: secretWord }) || `The civilian word was "${secretWord}".`}
                  </span>
                </>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FinalGuess;
