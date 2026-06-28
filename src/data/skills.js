// NWN:EE skill definitions
// key: internal identifier
// ability: governing ability score
// armorCheckPenalty: applies armor check penalty when true

export const SKILLS = {
  animalempathy:  { name: 'Animal Empathy',  ability: 'cha', armorCheckPenalty: false },
  appraise:       { name: 'Appraise',        ability: 'int', armorCheckPenalty: false },
  bluff:          { name: 'Bluff',           ability: 'cha', armorCheckPenalty: false },
  concentration:  { name: 'Concentration',   ability: 'con', armorCheckPenalty: false },
  craft:          { name: 'Craft (Armor/Trap/Weapon)', ability: 'int', armorCheckPenalty: false },
  crafttrap:      { name: 'Craft Trap',      ability: 'int', armorCheckPenalty: false },
  diplomacy:      { name: 'Diplomacy',       ability: 'cha', armorCheckPenalty: false },
  disable:        { name: 'Disable Trap',    ability: 'int', armorCheckPenalty: false },
  discipline:     { name: 'Discipline',      ability: 'str', armorCheckPenalty: false },
  heal:           { name: 'Heal',            ability: 'wis', armorCheckPenalty: false },
  hide:           { name: 'Hide',            ability: 'dex', armorCheckPenalty: true  },
  intimidate:     { name: 'Intimidate',      ability: 'cha', armorCheckPenalty: false },
  listen:         { name: 'Listen',          ability: 'wis', armorCheckPenalty: false },
  lore:           { name: 'Lore',            ability: 'int', armorCheckPenalty: false },
  movesilently:   { name: 'Move Silently',   ability: 'dex', armorCheckPenalty: true  },
  openlocks:      { name: 'Open Lock',       ability: 'dex', armorCheckPenalty: false },
  parry:          { name: 'Parry',           ability: 'dex', armorCheckPenalty: false },
  perform:        { name: 'Perform',         ability: 'cha', armorCheckPenalty: false },
  persuade:       { name: 'Persuade',        ability: 'cha', armorCheckPenalty: false },
  pickpocket:     { name: 'Pick Pocket',     ability: 'dex', armorCheckPenalty: true  },
  search:         { name: 'Search',          ability: 'int', armorCheckPenalty: false },
  settrap:        { name: 'Set Trap',        ability: 'dex', armorCheckPenalty: false },
  spellcraft:     { name: 'Spellcraft',      ability: 'int', armorCheckPenalty: false },
  spot:           { name: 'Spot',            ability: 'wis', armorCheckPenalty: false },
  taunt:          { name: 'Taunt',           ability: 'cha', armorCheckPenalty: false },
  tumble:         { name: 'Tumble',          ability: 'dex', armorCheckPenalty: true  },
  usemagicdevice: { name: 'Use Magic Device',ability: 'cha', armorCheckPenalty: false },
}

// Returns whether a skill is a class skill for a given class
export function isClassSkill(skillKey, classKey, classesData) {
  if (!classesData[classKey]) return false
  return classesData[classKey].classSkills.includes(skillKey)
}

// Max ranks for a class skill at a given character level
export function maxClassRanks(characterLevel) {
  return characterLevel + 3
}

// Max ranks for a cross-class skill at a given character level
export function maxCrossClassRanks(characterLevel) {
  return Math.floor((characterLevel + 3) / 2)
}
