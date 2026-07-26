// NWN:EE spells-per-day tables, from each class's level-progression table on
// the wiki.
//
// IMPORTANT FINDING: epic levels grant NO additional spell slots. Every
// caster's "Base spells per day" table ends at class level 20; the epic
// (21-40) tables contain only Level / Feats / HP range columns, with no spell
// columns at all. Verified individually on the Wizard, Sorcerer, Cleric,
// Druid, Bard, Paladin, and Ranger pages.
//
// So spellcasting freezes at class level 20 exactly like BAB and saves do.
// Epic casters grow via epic feats (Epic Spell Focus, the Automatic metamagic
// line, the six Epic Spell feats) rather than via more slots.
//
// Shape: SPELL_SLOTS[classKey][classLevel] = [slots for spell level 0..N]
//   Index 0 is cantrips/orisons for the classes that have them. Paladin and
//   Ranger have no cantrips, so their arrays start at spell level 1 — see
//   FIRST_SPELL_LEVEL.
//
// SPELLS_KNOWN is only for spontaneous casters (Sorcerer, Bard), who are
// limited in which spells they may learn as well as how often they cast.

// Lowest spell level each class's arrays begin at.
export const FIRST_SPELL_LEVEL = {
  wizard: 0, sorcerer: 0, cleric: 0, druid: 0, bard: 0,
  paladin: 1, ranger: 1,
}

const N = null // no slots of this level yet

export const SPELL_SLOTS = {
  wizard: {
    1:[3,1,N,N,N,N,N,N,N,N],       2:[4,2,N,N,N,N,N,N,N,N],
    3:[4,2,1,N,N,N,N,N,N,N],       4:[4,3,2,N,N,N,N,N,N,N],
    5:[4,3,2,1,N,N,N,N,N,N],       6:[4,3,3,2,N,N,N,N,N,N],
    7:[4,4,3,2,1,N,N,N,N,N],       8:[4,4,3,3,2,N,N,N,N,N],
    9:[4,4,4,3,2,1,N,N,N,N],      10:[4,4,4,3,3,2,N,N,N,N],
    11:[4,4,4,4,3,2,1,N,N,N],     12:[4,4,4,4,3,3,2,N,N,N],
    13:[4,4,4,4,4,3,2,1,N,N],     14:[4,4,4,4,4,3,3,2,N,N],
    15:[4,4,4,4,4,4,3,2,1,N],     16:[4,4,4,4,4,4,3,3,2,N],
    17:[4,4,4,4,4,4,4,3,2,1],     18:[4,4,4,4,4,4,4,3,3,2],
    19:[4,4,4,4,4,4,4,4,3,3],     20:[4,4,4,4,4,4,4,4,4,4],
  },
  sorcerer: {
    1:[5,3,N,N,N,N,N,N,N,N],       2:[6,4,N,N,N,N,N,N,N,N],
    3:[6,5,N,N,N,N,N,N,N,N],       4:[6,6,3,N,N,N,N,N,N,N],
    5:[6,6,4,N,N,N,N,N,N,N],       6:[6,6,5,3,N,N,N,N,N,N],
    7:[6,6,6,4,N,N,N,N,N,N],       8:[6,6,6,5,3,N,N,N,N,N],
    9:[6,6,6,6,4,N,N,N,N,N],      10:[6,6,6,6,5,3,N,N,N,N],
    11:[6,6,6,6,6,4,N,N,N,N],     12:[6,6,6,6,6,5,3,N,N,N],
    13:[6,6,6,6,6,6,4,N,N,N],     14:[6,6,6,6,6,6,5,3,N,N],
    15:[6,6,6,6,6,6,6,4,N,N],     16:[6,6,6,6,6,6,6,5,3,N],
    17:[6,6,6,6,6,6,6,6,4,N],     18:[6,6,6,6,6,6,6,6,5,3],
    19:[6,6,6,6,6,6,6,6,6,4],     20:[6,6,6,6,6,6,6,6,6,6],
  },
  cleric: {
    1:[3,2,N,N,N,N,N,N,N,N],       2:[4,3,N,N,N,N,N,N,N,N],
    3:[4,3,2,N,N,N,N,N,N,N],       4:[5,4,3,N,N,N,N,N,N,N],
    5:[5,4,3,2,N,N,N,N,N,N],       6:[5,4,4,3,N,N,N,N,N,N],
    7:[6,5,4,3,2,N,N,N,N,N],       8:[6,5,4,4,3,N,N,N,N,N],
    9:[6,5,5,4,3,2,N,N,N,N],      10:[6,5,5,4,4,3,N,N,N,N],
    11:[6,6,5,5,4,3,2,N,N,N],     12:[6,6,5,5,4,4,3,N,N,N],
    13:[6,6,6,5,5,4,3,2,N,N],     14:[6,6,6,5,5,4,4,3,N,N],
    15:[6,6,6,6,5,5,4,3,2,N],     16:[6,6,6,6,5,5,4,4,3,N],
    17:[6,6,6,6,6,5,5,4,3,2],     18:[6,6,6,6,6,5,5,4,4,3],
    19:[6,6,6,6,6,6,5,5,4,4],     20:[6,6,6,6,6,6,5,5,5,5],
  },
  druid: {
    1:[3,1,N,N,N,N,N,N,N,N],       2:[4,2,N,N,N,N,N,N,N,N],
    3:[4,2,1,N,N,N,N,N,N,N],       4:[5,3,2,N,N,N,N,N,N,N],
    5:[5,3,2,1,N,N,N,N,N,N],       6:[5,3,3,2,N,N,N,N,N,N],
    7:[6,4,3,2,1,N,N,N,N,N],       8:[6,4,3,3,2,N,N,N,N,N],
    9:[6,4,4,3,2,1,N,N,N,N],      10:[6,4,4,3,3,2,N,N,N,N],
    11:[6,5,4,4,3,2,1,N,N,N],     12:[6,5,4,4,3,3,2,N,N,N],
    13:[6,5,5,4,4,3,2,1,N,N],     14:[6,5,5,4,4,3,3,2,N,N],
    15:[6,5,5,5,4,4,3,2,1,N],     16:[6,5,5,5,4,4,3,3,2,N],
    17:[6,5,5,5,5,4,4,3,2,1],     18:[6,5,5,5,5,4,4,3,3,2],
    19:[6,5,5,5,5,5,4,4,3,3],     20:[6,5,5,5,5,5,4,4,4,4],
  },
  bard: {
    1:[2,N,N,N,N,N,N],             2:[3,0,N,N,N,N,N],
    3:[3,1,N,N,N,N,N],             4:[3,2,0,N,N,N,N],
    5:[3,3,1,N,N,N,N],             6:[3,3,2,N,N,N,N],
    7:[3,3,2,0,N,N,N],             8:[3,3,3,1,N,N,N],
    9:[3,3,3,2,N,N,N],            10:[3,3,3,2,0,N,N],
    11:[3,3,3,3,1,N,N],           12:[3,3,3,3,2,N,N],
    13:[3,3,3,3,2,0,N],           14:[4,3,3,3,3,1,N],
    15:[4,4,3,3,3,2,N],           16:[4,4,4,3,3,2,0],
    17:[4,4,4,4,3,3,1],           18:[4,4,4,4,4,3,2],
    19:[4,4,4,4,4,4,3],           20:[4,4,4,4,4,4,4],
  },
  // Paladin and Ranger arrays start at spell level 1 (no cantrips).
  paladin: {
    1:[N,N,N,N],   2:[N,N,N,N],   3:[N,N,N,N],   4:[0,N,N,N],
    5:[0,N,N,N],   6:[1,N,N,N],   7:[1,N,N,N],   8:[1,0,N,N],
    9:[1,0,N,N],  10:[1,1,N,N],  11:[1,1,0,N],  12:[1,1,1,N],
    13:[1,1,1,N], 14:[2,1,1,0],  15:[2,1,1,1],  16:[2,2,1,1],
    17:[2,2,2,1], 18:[3,2,2,1],  19:[3,3,3,2],  20:[3,3,3,3],
  },
  ranger: {
    1:[N,N,N,N],   2:[N,N,N,N],   3:[N,N,N,N],   4:[0,N,N,N],
    5:[0,N,N,N],   6:[1,N,N,N],   7:[1,N,N,N],   8:[1,0,N,N],
    9:[1,0,N,N],  10:[1,1,N,N],  11:[1,1,0,N],  12:[1,1,1,N],
    13:[1,1,1,N], 14:[1,1,1,0],  15:[2,1,1,1],  16:[2,2,1,1],
    17:[2,2,2,1], 18:[3,2,2,1],  19:[3,3,3,2],  20:[3,3,3,3],
  },
}

// Spontaneous casters are also limited in how many distinct spells they know.
export const SPELLS_KNOWN = {
  sorcerer: {
    1:[4,2,N,N,N,N,N,N,N,N],       2:[5,2,N,N,N,N,N,N,N,N],
    3:[5,3,N,N,N,N,N,N,N,N],       4:[6,3,1,N,N,N,N,N,N,N],
    5:[6,4,2,N,N,N,N,N,N,N],       6:[7,4,2,1,N,N,N,N,N,N],
    7:[7,5,3,2,N,N,N,N,N,N],       8:[7,5,3,2,1,N,N,N,N,N],
    9:[7,5,4,3,2,N,N,N,N,N],      10:[7,5,4,3,2,1,N,N,N,N],
    11:[7,5,5,4,3,2,N,N,N,N],     12:[7,5,5,4,3,2,1,N,N,N],
    13:[7,5,5,4,4,3,2,N,N,N],     14:[7,5,5,4,4,3,2,1,N,N],
    15:[7,5,5,4,4,4,3,2,N,N],     16:[7,5,5,4,4,4,3,2,1,N],
    17:[7,5,5,4,4,4,3,3,2,N],     18:[7,5,5,4,4,4,3,3,2,1],
    19:[7,5,5,4,4,4,3,3,3,2],     20:[7,5,5,4,4,4,3,3,3,3],
  },
  bard: {
    1:[4,N,N,N,N,N,N],             2:[5,2,N,N,N,N,N],
    3:[5,3,N,N,N,N,N],             4:[5,3,2,N,N,N,N],
    5:[5,4,3,N,N,N,N],             6:[5,4,3,N,N,N,N],
    7:[5,4,4,2,N,N,N],             8:[5,4,4,3,N,N,N],
    9:[5,4,4,3,N,N,N],            10:[5,4,4,4,2,N,N],
    11:[5,4,4,4,3,N,N],           12:[5,4,4,4,3,N,N],
    13:[5,4,4,4,4,2,N],           14:[5,4,4,4,4,3,N],
    15:[5,4,4,4,4,3,N],           16:[5,5,4,4,4,4,2],
    17:[5,5,5,4,4,4,3],           18:[5,5,5,5,4,4,3],
    19:[5,5,5,5,5,4,4],           20:[5,5,5,5,5,5,4],
  },
}

// Which ability governs each caster's spellcasting (drives bonus spells).
export const CASTING_ABILITY = {
  wizard: 'int', sorcerer: 'cha', bard: 'cha',
  cleric: 'wis', druid: 'wis', paladin: 'wis', ranger: 'wis',
}

// Spell slots freeze at class level 20 — epic levels grant none.
export const MAX_CASTER_LEVEL = 20

// Base slots for a class at a given class level, before ability bonuses.
// Returns null for non-casters.
export function baseSpellSlots(classKey, classLevel) {
  const table = SPELL_SLOTS[classKey]
  if (!table) return null
  return table[Math.min(classLevel, MAX_CASTER_LEVEL)] ?? null
}

export function baseSpellsKnown(classKey, classLevel) {
  const table = SPELLS_KNOWN[classKey]
  if (!table) return null
  return table[Math.min(classLevel, MAX_CASTER_LEVEL)] ?? null
}

// Bonus spells from a high casting ability. Standard D&D rule: for spell
// level L (1+), you gain floor((mod - L) / 4) + 1 extra slots when mod >= L.
// Cantrips never gain bonus slots.
export function bonusSpellsForLevel(abilityMod, spellLevel) {
  if (spellLevel < 1 || abilityMod < spellLevel) return 0
  return Math.floor((abilityMod - spellLevel) / 4) + 1
}

// Full slots for a class, including ability bonuses. `abilityMod` is the
// modifier of that class's casting ability. Entries stay null where the
// caster has no access to that spell level yet — a bonus spell requires at
// least one base slot of that level.
export function totalSpellSlots(classKey, classLevel, abilityMod) {
  const base = baseSpellSlots(classKey, classLevel)
  if (!base) return null
  const first = FIRST_SPELL_LEVEL[classKey] ?? 0
  return base.map((slots, idx) => {
    if (slots === null) return null
    const spellLevel = idx + first
    return slots + bonusSpellsForLevel(abilityMod, spellLevel)
  })
}
