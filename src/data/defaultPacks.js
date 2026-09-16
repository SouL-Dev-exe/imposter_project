/**
 * defaultPacks.js
 * Built-in word pairs for the Undercover / Pretender game.
 * Each pair has: wordA (civilian), wordB (impostor), category, and an id.
 */

export const DEFAULT_PACKS = [
  {
    id: 'builtin-food',
    name: 'Food & Drinks',
    icon: '🍕',
    builtin: true,
    pairs: [
      { id: 'p1', wordA: 'Pizza', wordB: 'Burger', category: 'Fast Food' },
      { id: 'p2', wordA: 'Coffee', wordB: 'Tea', category: 'Hot Drinks' },
      { id: 'p3', wordA: 'Sushi', wordB: 'Tacos', category: 'Street Food' },
      { id: 'p4', wordA: 'Ice Cream', wordB: 'Gelato', category: 'Frozen Treats' },
      { id: 'p5', wordA: 'Pancakes', wordB: 'Waffles', category: 'Breakfast' },
    ],
  },
  {
    id: 'builtin-entertainment',
    name: 'Pop Culture',
    icon: '🎬',
    builtin: true,
    pairs: [
      { id: 'p6', wordA: 'Batman', wordB: 'Spider-Man', category: 'Superheroes' },
      { id: 'p7', wordA: 'Netflix', wordB: 'Disney+', category: 'Streaming' },
      { id: 'p8', wordA: 'Guitar', wordB: 'Piano', category: 'Instruments' },
      { id: 'p9', wordA: 'Instagram', wordB: 'TikTok', category: 'Social Media' },
      { id: 'p10', wordA: 'Christmas', wordB: 'Halloween', category: 'Holidays' },
    ],
  },
  {
    id: 'builtin-places',
    name: 'Places & Nature',
    icon: '🌍',
    builtin: true,
    pairs: [
      { id: 'p11', wordA: 'Beach', wordB: 'Swimming Pool', category: 'Places to Swim' },
      { id: 'p12', wordA: 'Castle', wordB: 'Palace', category: 'Royalty' },
      { id: 'p13', wordA: 'Mars', wordB: 'Moon', category: 'Space Destinations' },
      { id: 'p14', wordA: 'Rainforest', wordB: 'Desert', category: 'Biomes' },
      { id: 'p15', wordA: 'Mountain', wordB: 'Volcano', category: 'Landforms' },
    ],
  },
  {
    id: 'builtin-tech',
    name: 'Technology',
    icon: '💻',
    builtin: true,
    pairs: [
      { id: 'p16', wordA: 'Laptop', wordB: 'Tablet', category: 'Tech Devices' },
      { id: 'p17', wordA: 'Robot', wordB: 'Cyborg', category: 'Sci-Fi' },
      { id: 'p18', wordA: 'Rocket', wordB: 'Airplane', category: 'Transport' },
    ],
  },
  {
    id: 'builtin-sports',
    name: 'Sports & Animals',
    icon: '⚽',
    builtin: true,
    pairs: [
      { id: 'p19', wordA: 'Soccer', wordB: 'Basketball', category: 'Team Sports' },
      { id: 'p20', wordA: 'Tennis', wordB: 'Badminton', category: 'Racket Sports' },
      { id: 'p21', wordA: 'Lion', wordB: 'Tiger', category: 'Big Cats' },
      { id: 'p22', wordA: 'Shark', wordB: 'Whale', category: 'Ocean Animals' },
      { id: 'p23', wordA: 'Eagle', wordB: 'Falcon', category: 'Birds of Prey' },
    ],
  },
  {
    id: 'builtin-professions',
    name: 'Professions',
    icon: '👔',
    builtin: true,
    pairs: [
      { id: 'p24', wordA: 'Doctor', wordB: 'Nurse', category: 'Medical Roles' },
      { id: 'p25', wordA: 'Astronaut', wordB: 'Pilot', category: 'Sky & Space' },
      { id: 'p26', wordA: 'Chef', wordB: 'Baker', category: 'Food Professionals' },
    ],
  },
];

/** Flatten all pairs from all built-in packs into a single array */
export const ALL_BUILTIN_PAIRS = DEFAULT_PACKS.flatMap((pack) =>
  pack.pairs.map((pair) => ({ ...pair, packId: pack.id, packName: pack.name }))
);
