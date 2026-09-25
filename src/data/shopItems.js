/**
 * shopItems.js — Master Catalog of 100+ Store Items (20 per category).
 * Categorized by: outfits, accessories, emotes, screenFX, titles.
 * Prices and rarities balanced for realistic progression depth.
 */

export const STORE_ITEMS = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1. OUTFITS & CLOTHES (20 Items)
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'outfit_rebel_hoodie', category: 'outfits', name: 'Neon Rebel Hoodie', rarity: 'common', price: 350, icon: '🥼', desc: 'Comfy streetwear glowing with cybernetic flair.', accent: '#94a3b8' },
  { id: 'outfit_street_jacket', category: 'outfits', name: 'Streetwear Denim Jacket', rarity: 'common', price: 400, icon: '🧥', desc: 'Distressed denim for casual deduction.', accent: '#64748b' },
  { id: 'outfit_novice_vest', category: 'outfits', name: 'Recruit Tactical Vest', rarity: 'common', price: 500, icon: '🦺', desc: 'Light armor for entry-level investigators.', accent: '#475569' },
  { id: 'outfit_tracksuit', category: 'outfits', name: 'Cyberpunk Tracksuit', rarity: 'common', price: 600, icon: '🥋', desc: 'High-visibility retro track suit.', accent: '#38bdf8' },
  { id: 'outfit_casual_blazer', category: 'outfits', name: 'Observer Casual Blazer', rarity: 'common', price: 750, icon: '👔', desc: 'Sharp attire for keen observers.', accent: '#818cf8' },

  { id: 'outfit_detective', category: 'outfits', name: 'Detective Trenchcoat', rarity: 'rare', price: 1200, icon: '🕵️', desc: 'Classic noir style for the eagle-eyed civilian.', accent: '#3b82f6' },
  { id: 'outfit_cyber_visor', category: 'outfits', name: 'Cyberpunk Visor Suit', rarity: 'rare', price: 1800, icon: '🥽', desc: 'HUD analysis to spot lies across neon grids.', accent: '#a855f7' },
  { id: 'outfit_stealth_ninja', category: 'outfits', name: 'Shadow Shinobi Garb', rarity: 'rare', price: 2200, icon: '🥷', desc: 'Silent dark silk built for unseen maneuvers.', accent: '#6366f1' },
  { id: 'outfit_hazmat_suit', category: 'outfits', name: 'Bio-Hazard Containment', rarity: 'rare', price: 2800, icon: '☣️', desc: 'Sealed suit designed for volatile interrogations.', accent: '#84cc16' },
  { id: 'outfit_space_suit', category: 'outfits', name: 'Astro Infiltrator Suit', rarity: 'rare', price: 3500, icon: '🧑‍🚀', desc: 'Pressurized stealth suit built for space sabotage.', accent: '#06b6d4' },

  { id: 'outfit_royal_cloak', category: 'outfits', name: 'Sovereign Velvet Cape', rarity: 'epic', price: 6500, icon: '🦹', desc: 'Worn only by sovereigns of deduction.', accent: '#f59e0b' },
  { id: 'outfit_mech_armor', category: 'outfits', name: 'Titan Exo-Frame Armor', rarity: 'epic', price: 9000, icon: '🤖', desc: 'Heavy alloy powered exoskeleton.', accent: '#ec4899' },
  { id: 'outfit_vampire_tux', category: 'outfits', name: 'Crimson Vampire Tailcoat', rarity: 'epic', price: 11500, icon: '🧛', desc: 'Elegant aristocrat attire stained in blood red.', accent: '#dc2626' },
  { id: 'outfit_phantom_robes', category: 'outfits', name: 'Void Phantom Robes', rarity: 'epic', price: 13500, icon: '👻', desc: 'Floating dark robes woven from pure dark matter.', accent: '#9333ea' },
  { id: 'outfit_dragon_slayer', category: 'outfits', name: 'Dragon Scale Mail', rarity: 'epic', price: 15000, icon: '🐉', desc: 'Forged from impervious ancient dragon scales.', accent: '#10b981' },

  { id: 'outfit_impostor_mask', category: 'outfits', name: 'Impostor Phantom Mask', rarity: 'legendary', price: 28000, icon: '🎭', desc: 'Shifting obsidian mask that conceals all tells.', accent: '#f59e0b' },
  { id: 'outfit_cyber_god', category: 'outfits', name: 'Overclocked Deity Chassis', rarity: 'legendary', price: 38000, icon: '⚡', desc: 'Luminous gold energy matrix armor.', accent: '#eab308' },
  { id: 'outfit_cosmic_monarch', category: 'outfits', name: 'Cosmic Nebula Regalia', rarity: 'legendary', price: 50000, icon: '🌌', desc: 'Adorned with glowing stellar constellations.', accent: '#c084fc' },
  { id: 'outfit_blood_emperor', category: 'outfits', name: 'Blood Sovereign Armor', rarity: 'legendary', price: 62000, icon: '🩸', desc: 'Intimidating armor forged in infernal flames.', accent: '#b91c1c' },
  { id: 'outfit_apex_deceiver', category: 'outfits', name: 'Apex Deceiver War Plate', rarity: 'legendary', price: 75000, icon: '👑', desc: 'The supreme symbol of untouchable mastery.', accent: '#gold' },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. AVATAR ACCESSORIES & BORDERS (20 Items)
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'acc_detective_badge', category: 'accessories', name: 'Chief Inspector Badge', rarity: 'common', price: 300, icon: '🎖️', desc: 'Polished silver star proving civic duty.', accent: '#94a3b8' },
  { id: 'acc_glowing_border', category: 'accessories', name: 'Lobby Plasma Ring', rarity: 'common', price: 450, icon: '⭕', desc: 'A shimmering ring of cyan plasma.', accent: '#06b6d4' },
  { id: 'acc_neon_pulse', category: 'accessories', name: 'Cyber Neon Pulse', rarity: 'common', price: 600, icon: '⚡', desc: 'Electric blue pulsing border effect.', accent: '#38bdf8' },
  { id: 'acc_toxic_slime', category: 'accessories', name: 'Biohazard Slime Ring', rarity: 'common', price: 800, icon: '☣️', desc: 'Bubbling toxic green slime border.', accent: '#84cc16' },
  { id: 'acc_shadow_veil', category: 'accessories', name: 'Phantom Shadow Veil', rarity: 'common', price: 1000, icon: '👻', desc: 'Subtle misty dark shroud.', accent: '#64748b' },

  { id: 'acc_cyber_halo', category: 'accessories', name: 'Cybernetic Halo', rarity: 'rare', price: 1400, icon: '😇', desc: 'Floating holographic crest of pure deception.', accent: '#d946ef' },
  { id: 'acc_demon_horns', category: 'accessories', name: 'Infernal Neon Horns', rarity: 'rare', price: 1900, icon: '😈', desc: 'Violet flame horns glowing around head.', accent: '#ec4899' },
  { id: 'acc_frost_guard', category: 'accessories', name: 'Glacial Frost Guard', rarity: 'rare', price: 2400, icon: '❄️', desc: 'Chilled icy border emitting sub-zero particles.', accent: '#0284c7' },
  { id: 'acc_overclock_gear', category: 'accessories', name: 'Cyberpunk Gear Ring', rarity: 'rare', price: 2900, icon: '⚙️', desc: 'Rotating mechanical brass gear ring.', accent: '#14b8a6' },
  { id: 'acc_vip_shield', category: 'accessories', name: 'Royal VIP Shield', rarity: 'rare', price: 3500, icon: '🛡️', desc: 'Purple shield badge indicating elite status.', accent: '#a855f7' },

  { id: 'acc_golden_aura', category: 'accessories', name: 'Radiant Sunburst Aura', rarity: 'epic', price: 6000, icon: '✨', desc: 'Gold particles orbit your avatar in real-time.', accent: '#eab308' },
  { id: 'acc_gold_crown', category: 'accessories', name: 'Sovereign Gold Crown', rarity: 'epic', price: 8500, icon: '👑', desc: 'Floating solid gold crown with rubies.', accent: '#f59e0b' },
  { id: 'acc_phoenix_wings', category: 'accessories', name: 'Blazing Phoenix Wings', rarity: 'epic', price: 11000, icon: '🦅', desc: 'Fiery phoenix wings fanning behind avatar.', accent: '#f97316' },
  { id: 'acc_cosmic_ring', category: 'accessories', name: 'Stellar Cosmic Ring', rarity: 'epic', price: 13500, icon: '🌌', desc: 'Orbiting miniature galaxy & star ring.', accent: '#8b5cf6' },
  { id: 'acc_diamond_frame', category: 'accessories', name: 'Flawless Diamond Frame', rarity: 'epic', price: 15000, icon: '💎', desc: 'Sparkling diamond lattice border.', accent: '#38bdf8' },

  { id: 'acc_dragon_crest', category: 'accessories', name: 'Imperial Dragon Crest', rarity: 'legendary', price: 27000, icon: '🐉', desc: 'Coiling emerald dragon encircling player card.', accent: '#10b981' },
  { id: 'acc_solar_flare', category: 'accessories', name: 'Solar Flare Crest', rarity: 'legendary', price: 36000, icon: '☀️', desc: 'Radiant sun flare pulsing intense light.', accent: '#ef4444' },
  { id: 'acc_vampire_fangs', category: 'accessories', name: 'Crimson Fang Collar', rarity: 'legendary', price: 48000, icon: '🩸', desc: 'Dark gothic collar dripping crimson aura.', accent: '#b91c1c' },
  { id: 'acc_divine_light', category: 'accessories', name: 'Celestial Divine Light', rarity: 'legendary', price: 60000, icon: '🕊️', desc: 'Blinding holy angelic light ring.', accent: '#fef08a' },
  { id: 'acc_void_crown', category: 'accessories', name: 'Void Sovereign Crown', rarity: 'legendary', price: 75000, icon: '👑', desc: 'Eldritch void crown pulsing dark antimatter.', accent: '#d946ef' },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. EMOTES & EXPRESSIONS (20 Items)
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'emote_hush', category: 'emotes', name: '🤫 Hush', rarity: 'common', price: 200, icon: '🤫', desc: 'Keep quiet when suspicious questions fly.', accent: '#94a3b8' },
  { id: 'emote_inspect', category: 'emotes', name: '🔍 Inspect', rarity: 'common', price: 300, icon: '🔍', desc: 'Scan the room for false slip-ups.', accent: '#3b82f6' },
  { id: 'emote_laugh', category: 'emotes', name: '😂 Laugh', rarity: 'common', price: 350, icon: '😂', desc: 'Chuckling quietly in the voting box.', accent: '#eab308' },
  { id: 'emote_target', category: 'emotes', name: '🎯 Target', rarity: 'common', price: 400, icon: '🎯', desc: 'Pinpoint the suspect with laser focus.', accent: '#ef4444' },
  { id: 'emote_sweat', category: 'emotes', name: '😰 Sweating', rarity: 'common', price: 500, icon: '😰', desc: 'When you get asked an impossible word question.', accent: '#06b6d4' },

  { id: 'emote_mystery', category: 'emotes', name: '🎭 Mystery', rarity: 'rare', price: 1000, icon: '🎭', desc: 'Are you civilian, or Mr. White?', accent: '#8b5cf6' },
  { id: 'emote_mind_blown', category: 'emotes', name: '🤯 Mind Blown', rarity: 'rare', price: 1500, icon: '🤯', desc: 'When the impostor reveals the truth at the end.', accent: '#ec4899' },
  { id: 'emote_salute', category: 'emotes', name: '🫡 Respect Salute', rarity: 'rare', price: 2000, icon: '🫡', desc: 'Honoring a legendary play by an opponent.', accent: '#10b981' },
  { id: 'emote_devil_grin', category: 'emotes', name: '😈 Evil Grin', rarity: 'rare', price: 2500, icon: '😈', desc: 'Plotting your ultimate betrayal.', accent: '#a855f7' },
  { id: 'emote_popcorn', category: 'emotes', name: '🍿 Popcorn Time', rarity: 'rare', price: 3000, icon: '🍿', desc: 'Enjoying civilians accusing each other.', accent: '#f59e0b' },

  { id: 'emote_on_fire', category: 'emotes', name: '🔥 On Fire', rarity: 'epic', price: 5500, icon: '🔥', desc: 'Celebrate an unstoppable win streak.', accent: '#f97316' },
  { id: 'emote_crown', category: 'emotes', name: '👑 Crown Flex', rarity: 'epic', price: 7500, icon: '👑', desc: 'Flex your victory over the baffled lobby.', accent: '#eab308' },
  { id: 'emote_brain_flex', category: 'emotes', name: '🧠 Big Brain', rarity: 'epic', price: 9500, icon: '🧠', desc: 'Flexing 200 IQ deduction moves.', accent: '#c084fc' },
  { id: 'emote_ghost_boo', category: 'emotes', name: '👻 Ghost Boo', rarity: 'epic', price: 12000, icon: '👻', desc: 'Haunt the chat from beyond.', accent: '#a855f7' },
  { id: 'emote_money_rain', category: 'emotes', name: '💸 Make It Rain', rarity: 'epic', price: 15000, icon: '💸', desc: 'Shower SouL Coins all over the lobby.', accent: '#10b981' },

  { id: 'emote_god_mode', category: 'emotes', name: '⚡ God Mode', rarity: 'legendary', price: 25000, icon: '⚡', desc: 'Unleash lightning aura in chat.', accent: '#facc15' },
  { id: 'emote_diamond_hands', category: 'emotes', name: '💎 Diamond Hold', rarity: 'legendary', price: 32000, icon: '💎', desc: 'Never back down under pressure.', accent: '#38bdf8' },
  { id: 'emote_skull_king', category: 'emotes', name: '💀 Reaper Skull', rarity: 'legendary', price: 40000, icon: '💀', desc: 'The inevitable fate of accused suspects.', accent: '#94a3b8' },
  { id: 'emote_dragon_roar', category: 'emotes', name: '🐉 Dragon Roar', rarity: 'legendary', price: 48000, icon: '🐉', desc: 'Summon an animated dragon in chat.', accent: '#10b981' },
  { id: 'emote_soul_burst', category: 'emotes', name: '🔱 Soul Overload', rarity: 'legendary', price: 50000, icon: '🔱', desc: 'The supreme animated emote flex.', accent: '#a855f7' },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. SCREEN FX (20 Items)
  // ───────────────────────────────────────────────────────────────────────────
  { id: 'fx_cyber_grid', category: 'screenFX', name: 'Cyber Grid Pulse', rarity: 'common', price: 400, icon: '⚡', desc: 'Neon cyan grid overlay during matches.', accent: '#06b6d4' },
  { id: 'fx_snowstorm', category: 'screenFX', name: 'Blizzard Snowstorm', rarity: 'common', price: 500, icon: '❄️', desc: 'Falling snowflake particles over canvas.', accent: '#38bdf8' },
  { id: 'fx_slime_hazard', category: 'screenFX', name: 'Toxic Slime Hazard', rarity: 'common', price: 650, icon: '☣️', desc: 'Bubbling green biohazard vignette.', accent: '#84cc16' },
  { id: 'fx_ember_glow', category: 'screenFX', name: 'Volcanic Ember Glow', rarity: 'common', price: 800, icon: '🌋', desc: 'Warm orange embers floating upward.', accent: '#f97316' },
  { id: 'fx_neon_pulse', category: 'screenFX', name: 'Neon Magenta Pulse', rarity: 'common', price: 1000, icon: '💖', desc: 'Retro synthwave glowing border pulse.', accent: '#ec4899' },

  { id: 'fx_matrix_rain', category: 'screenFX', name: 'Matrix Digital Rain', rarity: 'rare', price: 1500, icon: '🟢', desc: 'Cascading green code streams across screen.', accent: '#22c55e' },
  { id: 'fx_gold_confetti', category: 'screenFX', name: 'Royal Gold Lux', rarity: 'rare', price: 2000, icon: '🎉', desc: 'Gold ribbons and sparkles shower canvas.', accent: '#eab308' },
  { id: 'fx_cyber_glitch', category: 'screenFX', name: 'Cyber Glitch Strobe', rarity: 'rare', price: 2500, icon: '📺', desc: 'Chromatic glitch pulse on voting rounds.', accent: '#a855f7' },
  { id: 'fx_vaporwave_grid', category: 'screenFX', name: 'Vaporwave Synth Grid', rarity: 'rare', price: 3000, icon: '🌆', desc: 'Purple/pink horizon grid with sun flare.', accent: '#d946ef' },
  { id: 'fx_electric_storm', category: 'screenFX', name: 'Electric Lightning Storm', rarity: 'rare', price: 3500, icon: '⚡', desc: 'Flashing plasma bolts along screen border.', accent: '#38bdf8' },

  { id: 'fx_fire_aura', category: 'screenFX', name: 'Infernal Fire Aura', rarity: 'epic', price: 6000, icon: '🔥', desc: 'Rising flame embers & burning border aura.', accent: '#f97316' },
  { id: 'fx_cosmic_void', category: 'screenFX', name: 'Cosmic Supernova Void', rarity: 'epic', price: 8500, icon: '🌌', desc: 'Purple cosmic nebula explosion FX.', accent: '#a855f7' },
  { id: 'fx_hypnotic_portal', category: 'screenFX', name: 'Hypnotic Void Portal', rarity: 'epic', price: 11000, icon: '🌀', desc: 'Swirling purple vortex around prompt.', accent: '#8b5cf6' },
  { id: 'fx_starlight_shimmer', category: 'screenFX', name: 'Starlight Galaxy Shimmer', rarity: 'epic', price: 13500, icon: '✨', desc: 'Sparkling diamond constellations.', accent: '#fef08a' },
  { id: 'fx_overclock_rain', category: 'screenFX', name: 'Overclock Data Stream', rarity: 'epic', price: 15000, icon: '💻', desc: 'Cyan data streams flowing downwards.', accent: '#14b8a6' },

  { id: 'fx_blood_moon', category: 'screenFX', name: 'Crimson Eclipse Moon', rarity: 'legendary', price: 26000, icon: '🩸', desc: 'Blood red flare when Impostors prevail.', accent: '#ef4444' },
  { id: 'fx_quantum_realm', category: 'screenFX', name: 'Quantum Subatomic Field', rarity: 'legendary', price: 38000, icon: '⚛️', desc: 'Electrifying subatomic particle field.', accent: '#06b6d4' },
  { id: 'fx_solar_flare', category: 'screenFX', name: 'Supernova Solar Flare', rarity: 'legendary', price: 50000, icon: '☀️', desc: 'Blinding gold solar flare explosion.', accent: '#eab308' },
  { id: 'fx_aurora_borealis', category: 'screenFX', name: 'Northern Aurora Lights', rarity: 'legendary', price: 62000, icon: '🌌', desc: 'Shimmering curtain of green/violet aurora.', accent: '#10b981' },
  { id: 'fx_sakura_bloom', category: 'screenFX', name: 'Mystic Sakura Petals', rarity: 'legendary', price: 75000, icon: '🌸', desc: 'Enchanted pink cherry blossom petal rain.', accent: '#f472b6' },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. BANNERS & TITLES (20 Interactive Badges)
  // ───────────────────────────────────────────────────────────────────────────
  // Common (200 - 500 SC)
  { id: 'title_novice', category: 'titles', name: 'Novice', rarity: 'common', price: 0, icon: '🌱', desc: 'Default title for fresh recruits.', accent: '#94a3b8' },
  { id: 'title_rookie', category: 'titles', name: 'Rookie', rarity: 'common', price: 200, icon: '🐣', desc: 'Taking your first steps into deduction.', accent: '#a1a1aa' },
  { id: 'title_detective', category: 'titles', name: 'Detective', rarity: 'common', price: 300, icon: '🕵️', desc: 'Active investigator seeking slip-ups.', accent: '#38bdf8' },
  { id: 'title_observer', category: 'titles', name: 'Observer', rarity: 'common', price: 400, icon: '👀', desc: 'Watches silently before giving clues.', accent: '#818cf8' },
  { id: 'title_quiet_one', category: 'titles', name: 'Quiet One', rarity: 'common', price: 500, icon: '🤫', desc: 'Speaks rarely, but strikes with precision.', accent: '#cbd5e1' },

  // Rare (1,000 - 3,500 SC)
  { id: 'title_bluff_king', category: 'titles', name: '🔥 Bluff King', rarity: 'rare', price: 1000, icon: '🃏', desc: 'Makes everyone vote out their best friend.', accent: '#f97316' },
  { id: 'title_galaxy_brain', category: 'titles', name: '🧠 Galaxy Brain', rarity: 'rare', price: 1500, icon: '🧠', desc: 'Solves the word puzzle in round 1.', accent: '#c084fc' },
  { id: 'title_sleuth', category: 'titles', name: '🕵️ Sleuth', rarity: 'rare', price: 2000, icon: '🔍', desc: 'Uncovers the truth behind every lie.', accent: '#3b82f6' },
  { id: 'title_imposter', category: 'titles', name: '🎭 Imposter', rarity: 'rare', price: 2500, icon: '🎭', desc: 'Blends seamlessly into the civilian crowd.', accent: '#ec4899' },
  { id: 'title_speedster', category: 'titles', name: '⚡ Speedster', rarity: 'rare', price: 3500, icon: '⚡', desc: 'Fastest clue giver in the lobby.', accent: '#eab308' },

  // Epic (5,000 - 15,000 SC)
  { id: 'title_shadow_ghost', category: 'titles', name: '👻 Shadow Ghost', rarity: 'epic', price: 5000, icon: '👻', desc: 'Unseen, unheard, untouchable.', accent: '#a855f7' },
  { id: 'title_mind_reader', category: 'titles', name: '👑 Mind Reader', rarity: 'epic', price: 7500, icon: '🔮', desc: 'Anticipates every player vote in advance.', accent: '#f43f5e' },
  { id: 'title_diamond_mind', category: 'titles', name: '💎 Diamond Mind', rarity: 'epic', price: 10000, icon: '💎', desc: 'Unshakeable composure under scrutiny.', accent: '#38bdf8' },
  { id: 'title_oracle', category: 'titles', name: '🔮 Oracle', rarity: 'epic', price: 12500, icon: '🔮', desc: 'Sees through every deception instantly.', accent: '#d946ef' },
  { id: 'title_tactician', category: 'titles', name: '⚔️ Tactician', rarity: 'epic', price: 15000, icon: '⚔️', desc: 'Master strategist of group voting dynamics.', accent: '#10b981' },

  // Legendary Flex (25,000 - 75,000 SC)
  { id: 'title_cosmic_entity', category: 'titles', name: '🌌 Cosmic Entity', rarity: 'legendary', price: 25000, icon: '🌌', desc: 'Transcended ordinary game logic.', accent: '#c084fc' },
  { id: 'title_bloodhound', category: 'titles', name: '🩸 Bloodhound', rarity: 'legendary', price: 35000, icon: '🩸', desc: 'Tracks down Impostors with ruthless precision.', accent: '#ef4444' },
  { id: 'title_god_of_deception', category: 'titles', name: '⚡ God of Deception', rarity: 'legendary', price: 45000, icon: '⚡', desc: 'Ruler of lies and deception.', accent: '#facc15' },
  { id: 'title_soul_master', category: 'titles', name: '🔱 Soul Master', rarity: 'legendary', price: 60000, icon: '🔱', desc: 'Supreme master of the SouL arena.', accent: '#a855f7' },
  { id: 'title_apex_imposter', category: 'titles', name: '🏆 Apex Imposter', rarity: 'legendary', price: 75000, icon: '🏆', desc: 'The undisputed grand champion of Undercover.', accent: '#eab308' },
];

export default STORE_ITEMS;
