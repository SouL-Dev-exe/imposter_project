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
  // 1. Base Participation Reward
  const baseSC = 50;

  // 2. Victory Bonus
  const victorySC = isVictory ? 100 : 0;

  // 3. MVP / Correct Vote Bonus
  const mvpSC = isCorrectVote ? 30 : 0;

  // 4. Win Streak & Streak Multiplier
  const newWinStreak = isVictory ? currentWinStreak + 1 : 0;
  // +10% per consecutive win, capped at +50%
  const multiplierPercent = Math.min(newWinStreak * 10, 50);
  const subtotalSC = baseSC + victorySC + mvpSC;
  const streakBonusSC = Math.round((subtotalSC * multiplierPercent) / 100);

  // Total SC
  const totalSC = subtotalSC + streakBonusSC;

  // 5. Season XP Gain
  // Base 100 XP per match + 50 bonus XP on victory
  const xpGained = 100 + (isVictory ? 50 : 0);
  let totalXP = currentXP + xpGained;
  let newLevel = currentLevel;
  let leveledUp = false;

  // Level Progression: Level requires `level * 200 XP`
  // We can calculate how many levels are gained
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
