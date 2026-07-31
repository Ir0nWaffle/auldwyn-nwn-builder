// NWN:EE epic progression rules (character levels 21-40), from the wiki's
// Level progression table and each class's own level-progression table.
//
// Reachable now that SERVER_SETTINGS.maxLevel is 40 (see classes.js).
//
// The key structural rule, quoting the wiki: "After character level 20, the
// base attack and base save advancements become based on character level,
// rather than class levels. For these, the 'epic bonus' is added to whatever
// was obtained (on the basis of class) at level 20."
//
// So BAB and saves FREEZE at whatever the first 20 character levels produced,
// and then a flat epic bonus is added based on total character level. Class
// levels taken at 21+ contribute hit dice, skill points, and class features,
// but NOT class-based BAB or save progression.

export const EPIC_START_LEVEL = 21
export const EPIC_MAX_LEVEL = 40

// Epic attack bonus: +1 at 21, then +1 every 2 levels, reaching +10 at 40.
// Table: 21→1, 22→1, 23→2, 24→2, ... 39→10, 40→10
export function epicAttackBonus(charLevel) {
  if (charLevel < EPIC_START_LEVEL) return 0
  return Math.ceil((charLevel - 20) / 2)
}

// Epic save bonus: +0 at 21, then +1 every 2 levels, reaching +10 at 40.
// Table: 21→0, 22→1, 23→1, 24→2, ... 39→9, 40→10
export function epicSaveBonus(charLevel) {
  if (charLevel < EPIC_START_LEVEL) return 0
  return Math.floor((charLevel - 20) / 2)
}

// Max skill ranks continue on the same formulas past 20 (level+3 for class
// skills, half that for cross-class), so no separate epic rule is needed —
// confirmed against the wiki table (L40: 43 class / 21 cross-class).

// General feats: every 3 levels pre-epic (1,3,6,...,18) and the cadence
// continues at 21,24,27,30,33,36,39.
export const GENERAL_FEAT_LEVELS = [
  1, 3, 6, 9, 12, 15, 18,
  21, 24, 27, 30, 33, 36, 39,
]

// Ability increases stay on the every-4-levels cadence all the way to 40
// (4, 8, ..., 36, 40 — ten total), so no epic-specific rule is needed.

// ─── Class bonus feats, by CLASS level ───────────────────────────────────────
// Pre-epic and epic entries are combined into one list per class, matching how
// the game actually works (each class has a single bonus-feat list; whether a
// grant is "epic" just depends on the character level at the time).
//
// Levels marked with a duplicate entry grant two feats at that class level
// (Ranger 35 is the only case).
export const CLASS_BONUS_FEAT_LEVELS = {
  // ── Base classes ──
  barbarian: [24, 28, 32, 36, 40],
  bard:      [23, 26, 29, 32, 35, 38],
  cleric:    [23, 26, 29, 32, 35, 38],
  druid:     [24, 28, 32, 36, 40],
  fighter:   [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
              22, 24, 26, 28, 30, 32, 34, 36, 38, 40],
  monk:      [25, 30, 35, 40],
  paladin:   [23, 26, 29, 32, 35, 38],
  // Ranger's pre-epic grants are the Favored Enemy picks, which come from the
  // same class bonus-feat list; level 35 grants two.
  ranger:    [1, 5, 10, 15, 20,
              23, 25, 26, 29, 30, 32, 35, 35, 38, 40],
  rogue:     [10, 13, 16, 19,
              24, 28, 32, 36, 40],
  sorcerer:  [23, 26, 29, 32, 35, 38],
  wizard:    [5, 10, 15, 20,
              23, 26, 29, 32, 35, 38],

  // ── Prestige classes ──
  arcanearcher:    [14, 18, 22, 26, 30],
  assassin:        [14, 18, 22, 26, 30],
  blackguard:      [13, 16, 19, 22, 25, 28],
  championoftorm:  [2, 4, 6, 8, 10, 14, 18, 22, 26, 30],
  dwarvendefender: [14, 18, 22, 26, 30],
  palemaster:      [13, 16, 19, 22, 25, 28],
  shadowdancer:    [13, 16, 19, 22, 25, 28],
  shifter:         [13, 16, 19, 22, 25, 28],
  weaponmaster:    [13, 16, 19, 22, 25, 28],
  // harperscout caps at 5 and gains no epic levels; dragondisciple reaches
  // class level 30 but grants no bonus feats at all.
}

// How many bonus feats a class grants at a given class level (0, 1, or 2).
export function classBonusFeatsAt(classKey, classLevel) {
  const levels = CLASS_BONUS_FEAT_LEVELS[classKey]
  if (!levels) return 0
  return levels.filter(l => l === classLevel).length
}

// ─── Bonus-feat POOLS ─────────────────────────────────────────────────────────
// Which classes restrict their bonus-feat slots to a specific list, rather
// than letting the player spend the slot on any eligible feat. Confirmed per
// class via the wiki's own class page:
//   - Fighter's bonus feat is explicitly "chosen from a subset of the entire
//     feat list" with no further restriction pre-epic — i.e. genuinely
//     unrestricted, so it has no entry here pre-epic.
//   - Ranger (favored enemy, greater spell focus), Rogue ("special bonus
//     feats": crippling strike, defensive roll, improved evasion,
//     opportunist, skill mastery, slippery mind), and Wizard (a named list of
//     metamagic/spell feats) all have an explicit inclusion list.
// Not yet verified for every other class (Barbarian, Cleric, Druid, Monk,
// Paladin, or any prestige class) — those bonus-feat slots remain
// unrestricted until checked against the wiki, same as before this fix.
//
// Missing from these pools: a few named wiki feats with no equivalent in
// feats.js yet (Wizard's Arcane Defense/Brew Potion/Craft Wand, Bard's Curse
// Song/Extra Music/Lingering Song) — omitted rather than guessed at.
export const CLASS_BONUS_FEAT_POOL = {
  ranger: [
    'favoredenemy',
    'greaterspellfocusabj', 'greaterspellfocuscon', 'greaterspellfocusdiv', 'greaterspellfocusenc',
    'greaterspellfocusevo', 'greaterspellfocusnec', 'greaterspellfocustrans', 'greaterspellfocusill',
  ],
  rogue: ['cripplingstrike', 'defensiveroll', 'improvedevasion', 'opportunist', 'skillmastery', 'slipperymind'],
  wizard: [
    'combatcasting', 'empowerspell', 'extendspell', 'maximizespell', 'quickenspell', 'silentspell', 'stillspell',
    'spellfocusabj', 'spellfocuscon', 'spellfocusdiv', 'spellfocusenc', 'spellfocusevo', 'spellfocusnec',
    'spellfocustrans', 'spellfocusill',
    'greaterspellfocusabj', 'greaterspellfocuscon', 'greaterspellfocusdiv', 'greaterspellfocusenc',
    'greaterspellfocusevo', 'greaterspellfocusnec', 'greaterspellfocustrans', 'greaterspellfocusill',
    'spellpenetration', 'greaterspellpen',
  ],
}

// Same idea, for the EPIC portion of each class's bonus-feat schedule
// (character level 21+) — the wiki's "Epic <class> bonus feats" lists.
// Only populated for classes actually checked against the wiki so far.
export const EPIC_CLASS_BONUS_FEAT_POOL = {
  fighter: [
    'armorskin', 'devastatingcritical', 'epicdamagereduction', 'epicprowess', 'epictoughness',
    'epicweaponfocus', 'epicweaponspecialization', 'improvedstunningfist', 'improvedwhirlwindattack',
    'overwhelmingcritical', 'superiorinitiative',
  ],
  rogue: [
    'blindingspeed', 'cripplingstrike', 'defensiveroll', 'epicdodge', 'epicreputation', 'epicskillfocus',
    'improvedevasion', 'improvedsneakattack', 'opportunist', 'selfconcealment', 'skillmastery',
    'slipperymind', 'superiorinitiative',
  ],
  ranger: [
    'baneofenemies', 'blindingspeed', 'epicprowess', 'epicspellfocus', 'epictoughness',
    'epicweaponfocus', 'improvedcombatcasting', 'perfecthealth',
  ],
  wizard: [
    'automaticquickenspell', 'automaticsilentspell', 'automaticstillspell', 'epicspellfocus',
    'epicspellpenetration', 'epicspelldragonknight', 'epicspellmagearmor', 'epicspellepicwarding',
    'epicspellgreaterruin', 'epicspellhellball', 'epicspellmummydust', 'greatintelligence',
    'improvedcombatcasting',
  ],
  sorcerer: [
    'automaticquickenspell', 'automaticsilentspell', 'automaticstillspell', 'epicenergyresistance',
    'epicspellfocus', 'epicspellpenetration', 'epicspelldragonknight', 'epicspellmagearmor',
    'epicspellepicwarding', 'epicspellgreaterruin', 'epicspellhellball', 'epicspellmummydust',
    'greatcharisma', 'improvedcombatcasting',
  ],
  bard: [
    'epicskillfocus', 'epicspellfocus', 'epicwill', 'greatcharisma', 'greatdexterity',
    'greaterspellfocusabj', 'greaterspellfocuscon', 'greaterspellfocusdiv', 'greaterspellfocusenc',
    'greaterspellfocusevo', 'greaterspellfocusnec', 'greaterspellfocustrans', 'greaterspellfocusill',
    'greaterspellpen', 'improvedcombatcasting', 'lastinginspiration',
  ],
}

// The pool restricting a class's bonus-feat slots at a given CLASS level, or
// null if that class's bonus feat is unrestricted (any eligible feat).
export function classBonusFeatPool(classKey, classLevel) {
  const pool = classLevel > 20 ? EPIC_CLASS_BONUS_FEAT_POOL[classKey] : CLASS_BONUS_FEAT_POOL[classKey]
  return pool ?? null
}

// ─── Epic class level caps ───────────────────────────────────────────────────
// Prestige classes that cap at 10 pre-epic extend to 30 once epic. Harper
// Scout is the exception and stays at 5. Base classes have no class-level cap
// beyond the character level cap itself.
export const EPIC_CLASS_MAX_LEVEL = {
  arcanearcher: 30,
  assassin: 30,
  blackguard: 30,
  championoftorm: 30,
  dragondisciple: 30,
  dwarvendefender: 30,
  harperscout: 5,
  palemaster: 30,
  shadowdancer: 30,
  shifter: 30,
  weaponmaster: 30,
}
