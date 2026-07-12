// NWN:EE feat definitions
// prereqs: { bab, str, dex, int, wis, con, cha, feats[], skills{}, spellcasting, fighterLevel, classLevels{} }
// type: 'general' | 'fighter' | 'spellcasting' | 'metamagic' | 'skillbonus'
// weaponFocus: if true, requires a weapon selection when taken
// firstLevelOnly: represents a character background trait — only offered when
// picking feats at character level 1, hidden from the feat list afterward

export const FEATS = {
  // ── 1st-Level-Only Feats ───────────────────────────────────────────────────
  luckofheroes: {
    name: 'Luck of Heroes',
    type: 'general',
    description: '+1 luck bonus to all saving throws.',
    prereqs: {},
    firstLevelOnly: true,
  },
  tavernbrawler: {
    name: 'Tavern Brawler',
    type: 'general',
    description: '+1 bonus to unarmed damage and Discipline checks.',
    prereqs: {},
    firstLevelOnly: true,
  },
  silverpalm: {
    name: 'Silver Palm',
    type: 'general',
    description: 'Merchants offer better prices when you sell to them.',
    prereqs: {},
    firstLevelOnly: true,
  },
  snakeblood: {
    name: 'Snake Blood',
    type: 'general',
    description: '+1 bonus to saving throws against poison.',
    prereqs: {},
    firstLevelOnly: true,
  },
  militia: {
    name: 'Militia',
    type: 'general',
    description: 'Proficient with simple weapons and light armor.',
    prereqs: {},
    firstLevelOnly: true,
  },
  forester: {
    name: 'Forester',
    type: 'general',
    description: '+2 bonus to Discipline, Hide, and Move Silently checks in natural surroundings.',
    prereqs: {},
    firstLevelOnly: true,
  },

  // ── General Feats ──────────────────────────────────────────────────────────
  alertness: {
    name: 'Alertness',
    type: 'general',
    description: '+2 bonus to Listen and Spot checks.',
    prereqs: {},
  },
  ambidexterity: {
    name: 'Ambidexterity',
    type: 'general',
    description: 'Reduces the penalty for fighting with two weapons.',
    prereqs: { dex: 15 },
  },
  armorproflight: {
    name: 'Armor Proficiency (Light)',
    type: 'general',
    description: 'You are proficient with light armor.',
    prereqs: {},
  },
  armorprofmedium: {
    name: 'Armor Proficiency (Medium)',
    type: 'general',
    description: 'You are proficient with medium armor.',
    prereqs: { feats: ['armorproflight'] },
  },
  armorprofheavy: {
    name: 'Armor Proficiency (Heavy)',
    type: 'general',
    description: 'You are proficient with heavy armor.',
    prereqs: { feats: ['armorprofmedium'] },
  },
  blindfight: {
    name: 'Blind-Fight',
    type: 'general',
    description: 'Reduces penalties for fighting in darkness or against invisible opponents.',
    prereqs: {},
  },
  cleave: {
    name: 'Cleave',
    type: 'general',
    description: 'After dropping a foe, gain an immediate extra attack against an adjacent enemy.',
    prereqs: { feats: ['powerattack'] },
  },
  combatcasting: {
    name: 'Combat Casting',
    type: 'spellcasting',
    description: '+4 Concentration when casting defensively.',
    prereqs: { spellcasting: true },
  },
  deflectarrows: {
    name: 'Deflect Arrows',
    type: 'general',
    description: 'Once per round, deflect a ranged attack.',
    prereqs: { dex: 13, feats: ['improvedunarmedstrike'] },
  },
  dodge: {
    name: 'Dodge',
    type: 'general',
    description: '+1 dodge bonus to AC.',
    prereqs: { dex: 13 },
  },
  expertise: {
    name: 'Expertise',
    type: 'general',
    description: 'Trade attack bonus for AC bonus, up to +5.',
    prereqs: { int: 13 },
  },
  extrastunningattacks: {
    name: 'Extra Stunning Attacks',
    type: 'general',
    description: '+3 stunning attacks per day.',
    prereqs: { feats: ['stunningfist'] },
  },
  extraturning: {
    name: 'Extra Turning',
    type: 'general',
    description: '+4 turning attempts per day.',
    prereqs: { classLevels: { cleric: 1 } },
  },
  greatcleave: {
    name: 'Great Cleave',
    type: 'general',
    description: 'No limit on extra attacks from Cleave per round.',
    prereqs: { bab: 4, feats: ['cleave'] },
  },
  greatfortitude: {
    name: 'Great Fortitude',
    type: 'general',
    description: '+2 bonus to Fortitude saves.',
    prereqs: {},
  },
  improvedcritical: {
    name: 'Improved Critical',
    type: 'general',
    description: 'Double the threat range of a chosen weapon.',
    prereqs: { bab: 8 },
    weaponFocus: true,
  },
  improvedinitiative: {
    name: 'Improved Initiative',
    type: 'general',
    description: '+4 bonus to initiative.',
    prereqs: {},
  },
  improvedknockdown: {
    name: 'Improved Knockdown',
    type: 'general',
    description: 'Knockdown attack uses Strength vs. Strength (no size penalty).',
    prereqs: { int: 13, feats: ['expertise','knockdown'] },
  },
  improvedtwowfighting: {
    name: 'Improved Two-Weapon Fighting',
    type: 'general',
    description: 'Gain an additional off-hand attack at -5 penalty.',
    prereqs: { dex: 15, bab: 9, feats: ['twowfighting','ambidexterity'] },
  },
  improvedunarmedstrike: {
    name: 'Improved Unarmed Strike',
    type: 'general',
    description: 'Your unarmed attacks deal lethal damage and do not provoke attacks of opportunity.',
    prereqs: {},
  },
  ironwill: {
    name: 'Iron Will',
    type: 'general',
    description: '+2 bonus to Will saves.',
    prereqs: {},
  },
  knockdown: {
    name: 'Knockdown',
    type: 'general',
    description: 'Trade -4 attack penalty to knock an opponent prone.',
    prereqs: { bab: 2, feats: ['powerattack'] },
  },
  lightningflexes: {
    name: 'Lightning Reflexes',
    type: 'general',
    description: '+2 bonus to Reflex saves.',
    prereqs: {},
  },
  martialweaponprof: {
    name: 'Martial Weapon Proficiency',
    type: 'general',
    description: 'You are proficient with all martial weapons.',
    prereqs: {},
  },
  mobility: {
    name: 'Mobility',
    type: 'general',
    description: '+4 AC against attacks of opportunity.',
    prereqs: { dex: 13, feats: ['dodge'] },
  },
  pointblankshot: {
    name: 'Point Blank Shot',
    type: 'general',
    description: '+1 attack and damage with ranged weapons within 15 ft.',
    prereqs: {},
  },
  powerattack: {
    name: 'Power Attack',
    type: 'general',
    description: 'Trade attack bonus for damage bonus.',
    prereqs: { str: 13 },
  },
  preciseshot: {
    name: 'Precise Shot',
    type: 'general',
    description: 'No -4 penalty when firing into melee.',
    prereqs: { feats: ['pointblankshot'] },
  },
  rapidreload: {
    name: 'Rapid Reload',
    type: 'general',
    description: 'Reload a crossbow as a free action.',
    prereqs: {},
  },
  scribescroll: {
    name: 'Scribe Scroll',
    type: 'classfeat',
    description: 'Inscribe arcane spells onto scrolls.',
    prereqs: { spellcasting: true },
  },
  rapidshot: {
    name: 'Rapid Shot',
    type: 'general',
    description: 'One extra ranged attack per round at -2 to all attacks.',
    prereqs: { dex: 13, feats: ['pointblankshot'] },
  },
  shieldprof: {
    name: 'Shield Proficiency',
    type: 'general',
    description: 'You are proficient with shields.',
    prereqs: {},
  },
  simplewpnprof: {
    name: 'Simple Weapon Proficiency',
    type: 'general',
    description: 'You are proficient with all simple weapons.',
    prereqs: {},
  },
  springattack: {
    name: 'Spring Attack',
    type: 'general',
    description: 'Move before and after an attack without provoking attacks of opportunity.',
    prereqs: { dex: 13, bab: 4, feats: ['dodge','mobility'] },
  },
  stunningfist: {
    name: 'Stunning Fist',
    type: 'general',
    description: 'Attempt to stun a struck opponent (Fort save or stunned for 1 round).',
    prereqs: { dex: 13, wis: 13, bab: 8, feats: ['improvedunarmedstrike'] },
  },
  toughness: {
    name: 'Toughness',
    type: 'general',
    description: '+3 hit points.',
    prereqs: {},
  },
  twowfighting: {
    name: 'Two-Weapon Fighting',
    type: 'general',
    description: 'Reduce the penalty when fighting with two weapons.',
    prereqs: { dex: 15, feats: ['ambidexterity'] },
  },
  weaponfinesse: {
    name: 'Weapon Finesse',
    type: 'general',
    description: 'Use DEX instead of STR for attack rolls with light weapons.',
    prereqs: { bab: 1 },
  },
  weaponfocus: {
    name: 'Weapon Focus',
    type: 'general',
    description: '+1 attack bonus with a chosen weapon.',
    prereqs: { bab: 1 },
    weaponFocus: true,
  },
  weaponfocuslongbow: {
    name: 'Weapon Focus (Longbow)',
    type: 'general',
    description: '+1 attack bonus with longbows.',
    prereqs: { bab: 1 },
  },
  weaponspec: {
    name: 'Weapon Specialization',
    type: 'fighter',
    description: '+2 damage with a chosen weapon. Requires Fighter 4.',
    prereqs: { fighterLevel: 4, feats: ['weaponfocus'] },
    weaponFocus: true,
  },
  whirlwindattack: {
    name: 'Whirlwind Attack',
    type: 'general',
    description: 'Attack all adjacent enemies in one round.',
    prereqs: { int: 13, dex: 13, bab: 4, feats: ['dodge','mobility','springattack','expertise'] },
  },

  // ── Skill Focus Feats ──────────────────────────────────────────────────────
  skillfocusdiscipline: { name: 'Skill Focus (Discipline)',    type: 'skillbonus', description: '+3 to Discipline.', prereqs: {} },
  skillfocushide:       { name: 'Skill Focus (Hide)',          type: 'skillbonus', description: '+3 to Hide.', prereqs: {} },
  skillfocuslisten:     { name: 'Skill Focus (Listen)',        type: 'skillbonus', description: '+3 to Listen.', prereqs: {} },
  skillfocusspellcraft: { name: 'Skill Focus (Spellcraft)',    type: 'skillbonus', description: '+3 to Spellcraft.', prereqs: {} },
  skillfocusspot:       { name: 'Skill Focus (Spot)',          type: 'skillbonus', description: '+3 to Spot.', prereqs: {} },
  skillfocustumble:     { name: 'Skill Focus (Tumble)',        type: 'skillbonus', description: '+3 to Tumble.', prereqs: {} },
  skillfocuslore:       { name: 'Skill Focus (Lore)',          type: 'skillbonus', description: '+3 to Lore.', prereqs: {} },
  skillfocuspersuade:   { name: 'Skill Focus (Persuade)',      type: 'skillbonus', description: '+3 to Persuade.', prereqs: {} },

  // ── Metamagic Feats ────────────────────────────────────────────────────────
  empowerspell:   { name: 'Empower Spell',   type: 'metamagic', description: '+50% to all variable effects. Spell uses 2 higher slot.', prereqs: { spellcasting: true } },
  extendspell:    { name: 'Extend Spell',    type: 'metamagic', description: 'Double spell duration. Uses 1 higher slot.', prereqs: { spellcasting: true } },
  maximizespell:  { name: 'Maximize Spell',  type: 'metamagic', description: 'Maximize all variable effects. Uses 3 higher slot.', prereqs: { spellcasting: true } },
  quickenspell:   { name: 'Quicken Spell',   type: 'metamagic', description: 'Cast as free action. Uses 4 higher slot.', prereqs: { spellcasting: true } },
  silentspell:    { name: 'Silent Spell',    type: 'metamagic', description: 'Cast without verbal components. Uses 1 higher slot.', prereqs: { spellcasting: true } },
  stillspell:     { name: 'Still Spell',     type: 'metamagic', description: 'Cast without somatic components. Uses 1 higher slot.', prereqs: { spellcasting: true } },

  // ── Spell Focus Feats ──────────────────────────────────────────────────────
  spellfocusabj:  { name: 'Spell Focus (Abjuration)',   type: 'spellcasting', description: '+2 DC to Abjuration spells.', prereqs: { spellcasting: true } },
  spellfocuscon:  { name: 'Spell Focus (Conjuration)',  type: 'spellcasting', description: '+2 DC to Conjuration spells.', prereqs: { spellcasting: true } },
  spellfocusdiv:  { name: 'Spell Focus (Divination)',   type: 'spellcasting', description: '+2 DC to Divination spells.', prereqs: { spellcasting: true } },
  spellfocusenc:  { name: 'Spell Focus (Enchantment)',  type: 'spellcasting', description: '+2 DC to Enchantment spells.', prereqs: { spellcasting: true } },
  spellfocusevo:  { name: 'Spell Focus (Evocation)',    type: 'spellcasting', description: '+2 DC to Evocation spells.', prereqs: { spellcasting: true } },
  spellfocusnec:  { name: 'Spell Focus (Necromancy)',   type: 'spellcasting', description: '+2 DC to Necromancy spells.', prereqs: { spellcasting: true } },
  spellfocustrans:{ name: 'Spell Focus (Transmutation)',type: 'spellcasting', description: '+2 DC to Transmutation spells.', prereqs: { spellcasting: true } },
  spellfocusill:  { name: 'Spell Focus (Illusion)',     type: 'spellcasting', description: '+2 DC to Illusion spells.', prereqs: { spellcasting: true } },
  spellpenetration:{ name: 'Spell Penetration',         type: 'spellcasting', description: '+2 bonus on spell penetration checks.', prereqs: { spellcasting: true } },
  greaterspellpen: { name: 'Greater Spell Penetration', type: 'spellcasting', description: '+2 additional bonus on spell penetration (total +4).', prereqs: { spellcasting: true, feats: ['spellpenetration'] } },
}

// How many general feats a character gets at each level
export function getFeatCountAtLevel(level, isHuman) {
  let count = 0
  // Everyone gets feats at levels 1, 3, 6, 9, 12, 15, 18
  const generalFeatLevels = [1, 3, 6, 9, 12, 15, 18]
  if (generalFeatLevels.includes(level)) count += 1
  if (level === 1 && isHuman) count += 1
  return count
}

// Fighter bonus feats at levels 1,2,4,6,8,10,12,14,16,18,20
export function getFighterBonusFeatCount(fighterLevel) {
  const bonusFeatLevels = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
  return bonusFeatLevels.filter(l => l <= fighterLevel).length
}

// Wizard bonus feats at levels 5, 10, 15, 20
export function getWizardBonusFeatCount(wizardLevel) {
  const bonusFeatLevels = [5, 10, 15, 20]
  return bonusFeatLevels.filter(l => l <= wizardLevel).length
}
