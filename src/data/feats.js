import { EPIC_FEATS } from './epicFeats.js'

// NWN:EE feat definitions
// prereqs: { bab, str, dex, int, wis, con, cha, feats[], skills{}, spellcasting,
//            fighterLevel, classLevels{}, minLevel, cast9th, epicCaster }
// type: 'general' | 'fighter' | 'spellcasting' | 'metamagic' | 'skillbonus' | 'classfeat'
// weaponFocus: if true, requires a weapon selection when taken
// firstLevelOnly: represents a character background trait — only offered when
// picking feats at character level 1, hidden from the feat list afterward
// epic: only offered to epic characters (level 21+); see epicFeats.js
// stackable: N — feat may be taken up to N times
// needsChoice: 'favoredEnemyType' — taking this feat requires picking a value
// from a list (see FAVORED_ENEMY_TYPES below); the choice is baked into the
// stored feat key as `${baseKey}__${choiceKey}` (see baseFeatKey/featChoiceValue/
// makeChoiceFeatKey/featDisplayName) so every other part of the app — prereqs,
// stackable counts, display — keeps working on plain string feat keys.

// Favored Enemy creature types, per the wiki's Favored Enemy page: "There are
// 24 favored enemy races available; of the 25 standard races, only ooze
// cannot be selected." (7 playable + 18 non-playable races, minus ooze.)
export const FAVORED_ENEMY_TYPES = [
  { key: 'aberration', label: 'Aberration' },
  { key: 'animal', label: 'Animal' },
  { key: 'beast', label: 'Beast' },
  { key: 'construct', label: 'Construct' },
  { key: 'dragon', label: 'Dragon' },
  { key: 'dwarf', label: 'Dwarf' },
  { key: 'elemental', label: 'Elemental' },
  { key: 'elf', label: 'Elf' },
  { key: 'fey', label: 'Fey' },
  { key: 'giant', label: 'Giant' },
  { key: 'gnome', label: 'Gnome' },
  { key: 'goblinoid', label: 'Goblinoid' },
  { key: 'halfelf', label: 'Half-Elf' },
  { key: 'halforc', label: 'Half-Orc' },
  { key: 'halfling', label: 'Halfling' },
  { key: 'human', label: 'Human' },
  { key: 'magicalbeast', label: 'Magical Beast' },
  { key: 'monstroushumanoid', label: 'Monstrous Humanoid' },
  { key: 'orc', label: 'Orc' },
  { key: 'outsider', label: 'Outsider' },
  { key: 'reptilian', label: 'Reptilian' },
  { key: 'shapechanger', label: 'Shapechanger' },
  { key: 'undead', label: 'Undead' },
  { key: 'vermin', label: 'Vermin' },
]

const CHOICE_KEY_SEP = '__'

export function baseFeatKey(key) {
  const idx = key.indexOf(CHOICE_KEY_SEP)
  return idx === -1 ? key : key.slice(0, idx)
}

export function featChoiceValue(key) {
  const idx = key.indexOf(CHOICE_KEY_SEP)
  return idx === -1 ? null : key.slice(idx + CHOICE_KEY_SEP.length)
}

export function makeChoiceFeatKey(baseKey, choiceKey) {
  return `${baseKey}${CHOICE_KEY_SEP}${choiceKey}`
}

const BASE_FEATS = {
  // ── 1st-Level-Only Feats ───────────────────────────────────────────────────
  luckofheroes: {
    name: 'Luck of Heroes',
    type: 'general',
    description: '+1 bonus to all saving throws.',
    prereqs: {},
    firstLevelOnly: true,
  },
  snakeblood: {
    name: 'Snake Blood',
    type: 'general',
    description: '+1 bonus to Reflex saves; +2 additional bonus to Fortitude saves against poison.',
    prereqs: {},
    firstLevelOnly: true,
  },
  silverpalm: {
    name: 'Silver Palm',
    type: 'general',
    description: '+2 bonus on Appraise and Persuade checks.',
    prereqs: {},
    firstLevelOnly: true,
  },
  strongsoul: {
    name: 'Strong Soul',
    type: 'general',
    description: '+1 bonus to Fortitude and Will saves; +1 additional bonus vs. death magic.',
    prereqs: {},
    firstLevelOnly: true,
  },
  courteousmagocracy: {
    name: 'Courteous Magocracy',
    type: 'general',
    description: '+2 bonus on Lore and Spellcraft checks.',
    prereqs: {},
    firstLevelOnly: true,
  },
  artist: {
    name: 'Artist',
    type: 'general',
    description: '+2 bonus on Perform, Spot, and Persuade checks.',
    prereqs: { classLevels: { bard: 1 } },
    firstLevelOnly: true,
  },
  blooded: {
    name: 'Blooded',
    type: 'general',
    description: '+2 bonus on initiative and Spot checks.',
    prereqs: {},
    firstLevelOnly: true,
  },
  bullheaded: {
    name: 'Bullheaded',
    type: 'general',
    description: '+2 bonus resisting Taunt; +1 bonus to Will saves.',
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
  exoticwpnprof: {
    name: 'Exotic Weapon Proficiency',
    type: 'general',
    description: 'Proficiency with exotic weapons: bastard sword, dire mace, dwarven waraxe, double axe, kama, katana, kukri, scythe, shuriken, whip, and two-bladed sword.',
    prereqs: { bab: 1 },
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
  favoredenemy: {
    name: 'Favored Enemy',
    type: 'classfeat',
    stackable: 5,
    needsChoice: 'favoredEnemyType',
    description: 'Choose a creature type as a favored enemy: bonus damage plus Spot, Listen, and Taunt checks against it, increasing every 5 ranger levels. May be taken once per ranger bonus-feat level (1st, 5th, 10th, 15th, 20th) for a different creature type each time.',
    prereqs: { classLevels: { ranger: 1 } },
  },
  // ── Rogue special bonus feats (10th, 13th, 16th, 19th) ──────────────────────
  cripplingstrike: {
    name: 'Crippling Strike',
    type: 'classfeat',
    description: 'Sneak attacks also deal 2 points of Strength damage.',
    prereqs: { classLevels: { rogue: 10 } },
  },
  defensiveroll: {
    name: 'Defensive Roll',
    type: 'classfeat',
    description: 'Once per day, halve damage from a hit that would otherwise drop you to 0 HP or below.',
    prereqs: { classLevels: { rogue: 10 } },
  },
  improvedevasion: {
    name: 'Improved Evasion',
    type: 'classfeat',
    description: 'Take no damage on a successful Reflex save against area effects, and only half on a failed one.',
    prereqs: { classLevels: { rogue: 10 } },
  },
  opportunist: {
    name: 'Opportunist',
    type: 'classfeat',
    description: 'Once per round, make an attack of opportunity against an enemy just struck by an ally.',
    prereqs: { classLevels: { rogue: 10 } },
  },
  skillmastery: {
    name: 'Skill Mastery',
    type: 'classfeat',
    description: 'Take 10 on chosen skills even under pressure or distraction.',
    prereqs: { classLevels: { rogue: 10 } },
  },
  slipperymind: {
    name: 'Slippery Mind',
    type: 'classfeat',
    description: 'A second saving throw against enchantment spells that penetrated the first.',
    prereqs: { classLevels: { rogue: 10 } },
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

  // ── Greater Spell Focus Feats ──────────────────────────────────────────────
  // Each requires Spell Focus in that exact school; the +4 DC replaces (does
  // not stack with) Spell Focus's +2 for that school.
  greaterspellfocusabj:   { name: 'Greater Spell Focus (Abjuration)',    type: 'spellcasting', description: '+4 DC to Abjuration spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocusabj'] } },
  greaterspellfocuscon:   { name: 'Greater Spell Focus (Conjuration)',   type: 'spellcasting', description: '+4 DC to Conjuration spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocuscon'] } },
  greaterspellfocusdiv:   { name: 'Greater Spell Focus (Divination)',    type: 'spellcasting', description: '+4 DC to Divination spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocusdiv'] } },
  greaterspellfocusenc:   { name: 'Greater Spell Focus (Enchantment)',   type: 'spellcasting', description: '+4 DC to Enchantment spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocusenc'] } },
  greaterspellfocusevo:   { name: 'Greater Spell Focus (Evocation)',     type: 'spellcasting', description: '+4 DC to Evocation spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocusevo'] } },
  greaterspellfocusnec:   { name: 'Greater Spell Focus (Necromancy)',    type: 'spellcasting', description: '+4 DC to Necromancy spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocusnec'] } },
  greaterspellfocustrans: { name: 'Greater Spell Focus (Transmutation)', type: 'spellcasting', description: '+4 DC to Transmutation spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocustrans'] } },
  greaterspellfocusill:   { name: 'Greater Spell Focus (Illusion)',      type: 'spellcasting', description: '+4 DC to Illusion spells (replaces Spell Focus).', prereqs: { spellcasting: true, feats: ['spellfocusill'] } },

  spellpenetration:{ name: 'Spell Penetration',         type: 'spellcasting', description: '+2 bonus on spell penetration checks.', prereqs: { spellcasting: true } },
  greaterspellpen: { name: 'Greater Spell Penetration', type: 'spellcasting', description: '+2 additional bonus on spell penetration (total +4).', prereqs: { spellcasting: true, feats: ['spellpenetration'] } },
}

// Epic feats are merged in so every existing system (icons, prereq checks,
// summary, print sheet) works on them unchanged. They carry `epic: true`, and
// the feat picker filters them out below character level 21.
export const FEATS = { ...BASE_FEATS, ...EPIC_FEATS }

// Looks up a feat's definition even for a choice-encoded key like
// 'favoredenemy__goblinoid' (resolves to the base 'favoredenemy' entry).
export function featDef(key) {
  return FEATS[baseFeatKey(key)]
}

// Display name for a feat key, including the choice if the key encodes one:
// 'favoredenemy__goblinoid' -> 'Favored Enemy (Goblinoid)'.
export function featDisplayName(key) {
  const def = featDef(key)
  if (!def) return key
  const choiceVal = featChoiceValue(key)
  if (!choiceVal) return def.name
  const type = FAVORED_ENEMY_TYPES.find(t => t.key === choiceVal)
  return `${def.name} (${type?.label ?? choiceVal})`
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
