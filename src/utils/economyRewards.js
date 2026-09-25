/**
 * economyRewards.js
 * Isolated economic calculation engine for match outcomes.
 * Pure logic — does not alter game state directly.
 */

/**
 * Calculates match reward breakdown based on match outcome.
 *
 * @param {Object} params
 * @param {boolean} params.isVictory - Whether the player won the match
 * @param {boolean} [params.isCorrectVote=false] - Whether the player voted correctly against impostor / achieved MVP
 * @param {number} [params.currentWinStreak=0] - Current win streak before match
 * @param {number} [params.currentXP=0] - Current season XP before match
 * @param {number} [params.currentLevel=1] - Current season level before match
 * @returns {Object} Full breakdown of coins, bonuses, streaks, and XP gained
 */
export function calculateMatchRewards({
  isVictory = false,
  isCorrectVote = false,
  currentWinStreak = 0,
  currentXP = 0,
  currentLevel = 1,
}) {
  // 1. Base Participation & Outcome Earn Rates: Loss = +20 SC, Win = +100 SC
  const baseSC = 20;
  const victorySC = isVictory ? 80 : 0; // 20 + 80 = 100 SC for Win, 20 SC for Loss

  // 2. MVP / Correct Vote Bonus (+20 SC)
  const mvpSC = isCorrectVote ? 20 : 0;

  // 3. Win Streak & Streak Multiplier
  const newWinStreak = isVictory ? currentWinStreak + 1 : 0;
  const multiplierPercent = Math.min(newWinStreak * 10, 50);
  const subtotalSC = baseSC + victorySC + mvpSC;
  const streakBonusSC = Math.round((subtotalSC * multiplierPercent) / 100);

  // Total SC
  const totalSC = subtotalSC + streakBonusSC;

  // 4. Season XP Gain
  const xpGained = 100 + (isVictory ? 50 : 0);
  let totalXP = currentXP + xpGained;
  let newLevel = currentLevel;
  let leveledUp = false;

  while (true) {
    const requiredForNext = newLevel * 200;
    if (totalXP >= requiredForNext && newLevel < 50) {
      totalXP -= requiredForNext;
      newLevel += 1;
      leveledUp = true;
    } else {
      break;
    }
  }

  return {
    baseSC,
    victorySC,
    mvpSC,
    isVictory,
    isCorrectVote,
    oldWinStreak: currentWinStreak,
    newWinStreak,
    multiplierPercent,
    streakBonusSC,
    totalSC,
    xpGained,
    oldXP: currentXP,
    newXP: totalXP,
    oldLevel: currentLevel,
    newLevel,
    leveledUp,
  };
}
