import React from 'react';

/**
 * RankBadge — Renders crisp vector SVG badge graphics matching the player's rank tier.
 * @param {object} milestone - Player milestone object from getPlayerMilestone
 * @param {string} className - Optional tailwind sizing/positioning classes
 */
export default function RankBadge({ milestone, className = "w-8 h-8" }) {
  if (!milestone) return null;

  const type = milestone.badgeType || 'base-dot';

  return (
    <div className={`relative flex items-center justify-center p-2 rounded-xl border ${milestone.bg} ${milestone.border} shadow-lg backdrop-blur-sm ${className}`}>
      <svg
        className={`w-full h-full ${milestone.color} drop-shadow-[0_0_8px_currentColor] transition-all`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {type === 'king-crown' || type === 'crown-shield' ? (
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
        ) : type === 'winged-crest' ? (
          <path d="M12 2L4 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5zm0 3.2L18 9v4c0 3.85-2.5 7.5-6 8.5-3.5-1-6-4.65-6-8.5V9l6-3.8z" />
        ) : type === 'ghost-shield' || type === 'shrouded-emblem' ? (
          <path d="M12 2a9 9 0 00-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 00-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        ) : type === 'diamond-star' ? (
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        ) : type === 'hex-core' || type === 'cyber-badge' ? (
          <path d="M12 2l9 5.19v10.38L12 22.77 3 17.57V7.19L12 2zm0 3.2L5 9.24v6.52l7 4.04 7-4.04V9.24L12 5.2z" />
        ) : (
          <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3zm0 2.18l6 2.25v4.57c0 4.45-3.08 8.61-6 9.77-2.92-1.16-6-5.32-6-9.77V6.43l6-2.25z" />
        )}
      </svg>
    </div>
  );
}
