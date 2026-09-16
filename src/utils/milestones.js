/**
 * milestones.js — Player rank titles and perks based on level.
 * Used in ProfileCustomizer and any lobby display.
 */

export const LEVEL_MILESTONES = [
  { minLevel: 100, title: '[Centurion]',    perk: 'Custom Lobby Entrance Banner',  color: 'text-red-400',    bg: 'bg-red-900/30',    border: 'border-red-500/40' },
  { minLevel: 95,  title: '[Immortal]',     perk: 'Flashing Badge Effect',         color: 'text-fuchsia-400', bg: 'bg-fuchsia-900/30', border: 'border-fuchsia-500/40' },
  { minLevel: 90,  title: '[Phantom]',      perk: 'Translucent Glitch Effect',     color: 'text-slate-300',  bg: 'bg-slate-800/60',  border: 'border-slate-500/40' },
  { minLevel: 85,  title: '[Grandmaster]',  perk: 'Platinum Card Background',      color: 'text-cyan-300',   bg: 'bg-cyan-900/30',   border: 'border-cyan-500/40' },
  { minLevel: 80,  title: '[Syndicate Boss]', perk: 'Elite Badge Shimmer',         color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-500/40' },
  { minLevel: 75,  title: '[Apex Predator]', perk: 'Neon Blue Aura',              color: 'text-sky-400',    bg: 'bg-sky-900/30',    border: 'border-sky-500/40' },
  { minLevel: 70,  title: '[Overlord]',     perk: 'Elite Badge Animation',         color: 'text-violet-400', bg: 'bg-violet-900/30', border: 'border-violet-500/40' },
  { minLevel: 65,  title: '[Commander]',    perk: 'Premium Lobby Badge',           color: 'text-blue-400',   bg: 'bg-blue-900/30',   border: 'border-blue-500/40' },
  { minLevel: 60,  title: '[Shadow Boss]',  perk: 'Deep Crimson Styling',          color: 'text-rose-400',   bg: 'bg-rose-900/30',   border: 'border-rose-500/40' },
  { minLevel: 55,  title: '[Ghost]',        perk: 'Stealth Shadow Effect',         color: 'text-gray-400',   bg: 'bg-gray-800/60',   border: 'border-gray-500/40' },
  { minLevel: 50,  title: '[Impostor King]', perk: 'Gold Text Glow',              color: 'text-amber-400',  bg: 'bg-amber-900/30',  border: 'border-amber-500/40' },
  { minLevel: 45,  title: '[Mastermind]',   perk: 'Animated Border Option',        color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-500/40' },
  { minLevel: 40,  title: '[Insider]',      perk: 'Purple Cyber Glow Effect',      color: 'text-indigo-400', bg: 'bg-indigo-900/30', border: 'border-indigo-500/40' },
  { minLevel: 35,  title: '[Sleuth]',       perk: 'Custom Chat Color Unlock',      color: 'text-teal-400',   bg: 'bg-teal-900/30',   border: 'border-teal-500/40' },
  { minLevel: 30,  title: '[Veteran]',      perk: 'Blue Accent Lobby Glow',        color: 'text-blue-300',   bg: 'bg-blue-900/20',   border: 'border-blue-400/30' },
  { minLevel: 25,  title: '[Detective]',    perk: 'Clean Silver Border',           color: 'text-zinc-300',   bg: 'bg-zinc-800/40',   border: 'border-zinc-500/30' },
  { minLevel: 20,  title: '[Recruit]',      perk: 'Basic Reactions',               color: 'text-lime-400',   bg: 'bg-lime-900/20',   border: 'border-lime-500/30' },
  { minLevel: 15,  title: '[Novice Elite]', perk: 'Clean Card Tag',                color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-500/30' },
  { minLevel: 10,  title: '[Novice]',       perk: 'Standard Profile Card',         color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-500/30' },
  { minLevel: 5,   title: '[Rookie V]',     perk: 'Level 5 Milestone',             color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30' },
  { minLevel: 2,   title: '[Rookie II]',    perk: 'Level 2 Milestone',             color: 'text-orange-300', bg: 'bg-orange-900/10', border: 'border-orange-400/20' },
  { minLevel: 1,   title: '[Rookie I]',     perk: 'Starting Rank',                 color: 'text-white/60',   bg: 'bg-white/5',       border: 'border-white/10' },
];

/**
 * Returns the highest milestone the player has reached.
 * @param {number} level - The player's current level
 */
export function getPlayerMilestone(level) {
  const currentLevel = level || 1;
  return (
    LEVEL_MILESTONES.find((m) => currentLevel >= m.minLevel) ||
    LEVEL_MILESTONES[LEVEL_MILESTONES.length - 1]
  );
}

// ─── Level-Gated Avatar Styles ───────────────────────────────────────────────
export const ALL_AVATAR_STYLES = [
  { value: 'bottts',     label: '🤖 Bottts',     minLevel: 1 },
  { value: 'identicon',  label: '🔷 Identicon',  minLevel: 1 },
  { value: 'adventurer', label: '🧝 Adventurer', minLevel: 5 },
  { value: 'avataaars',  label: '🧑 Avataaars',  minLevel: 10 },
  { value: 'thumbs',     label: '👍 Thumbs',     minLevel: 15 },
  { value: 'pixel-art',  label: '🕹️ Pixel Art', minLevel: 25 },
];

/**
 * Returns an array of unlocked style value strings based on player level.
 * @param {number} playerLevel
 */
export function getUnlockedAvatarStyles(playerLevel) {
  const level = playerLevel || 1;
  return ALL_AVATAR_STYLES.filter((s) => level >= s.minLevel).map((s) => s.value);
}

