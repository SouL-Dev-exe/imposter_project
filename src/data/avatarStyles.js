/**
 * avatarStyles.js
 * 20 DiceBear Avatar Styles with level requirements and economy pricing.
 */

export const AVATAR_STYLES = [
  { value: 'bottts',         label: '🤖 Bottts',         minLevel: 1,  price: 0,     desc: 'Classic robot vibes. Default avatar style.' },
  { value: 'identicon',      label: '🔷 Identicon',      minLevel: 2,  price: 300,   desc: 'Geometric pixel art identity.' },
  { value: 'adventurer',     label: '🧝 Adventurer',     minLevel: 3,  price: 500,   desc: 'Fantasy hero portrait.' },
  { value: 'avataaars',      label: '🧑 Avataaars',      minLevel: 4,  price: 750,   desc: 'Personalized cartoon avatar.' },
  { value: 'thumbs',         label: '👍 Thumbs',         minLevel: 5,  price: 1000,  desc: 'Cute thumbs-up character.' },
  { value: 'pixel-art',      label: '🕹️ Pixel Art',     minLevel: 6,  price: 1500,  desc: 'Retro 16-bit pixel character.' },
  { value: 'lorelei',        label: '🧜 Lorelei',        minLevel: 7,  price: 2000,  desc: 'Ethereal illustrated portrait.' },
  { value: 'notionists',     label: '🎨 Notionists',     minLevel: 8,  price: 2500,  desc: 'Minimalist hand-drawn style.' },
  { value: 'micah',          label: '👤 Micah',          minLevel: 9,  price: 3500,  desc: 'Modern sleek vector design.' },
  { value: 'open-peeps',     label: '🧍 Open Peeps',     minLevel: 10, price: 5000,  desc: 'Hand-drawn doodle persona.' },
  { value: 'persona',        label: '🎭 Persona',        minLevel: 12, price: 7000,  desc: 'Mysterious masquerade avatar.' },
  { value: 'bottts-neutral', label: '🤖 Bottts Neutral', minLevel: 15, price: 10000, desc: 'Streamlined futuristic synth bot.' },
  { value: 'big-smile',      label: '😀 Big Smile',      minLevel: 18, price: 12500, desc: 'Joyful radiant expression.' },
  { value: 'croodles',       label: '🎨 Croodles',       minLevel: 20, price: 15000, desc: 'Whimsical abstract artwork.' },
  { value: 'dylan',          label: '👨 Dylan',          minLevel: 22, price: 18000, desc: 'Casual stylish portrait.' },
  { value: 'fun-emoji',      label: '🥳 Fun Emoji',      minLevel: 25, price: 22000, desc: 'Vibrant party emoji face.' },
  { value: 'icons',          label: '🔮 Icons',          minLevel: 28, price: 25000, desc: 'Mystic glyph & emblem insignia.' },
  { value: 'initials',       label: '🔤 Initials',       minLevel: 30, price: 30000, desc: 'Monogram typography badge.' },
  { value: 'miniavs',        label: '👶 Miniavs',        minLevel: 35, price: 40000, desc: 'Chibi miniature avatar.' },
  { value: 'shapes',         label: '🔷 Shapes',         minLevel: 40, price: 50000, desc: 'Apex geometric abstract luxury.' },
];

export const ALL_AVATAR_STYLES = AVATAR_STYLES;

export function getUnlockedAvatarStyles(playerLevel = 1) {
  return AVATAR_STYLES.filter((s) => playerLevel >= s.minLevel).map((s) => s.value);
}
