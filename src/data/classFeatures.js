// NWN:EE class features, taken from each class's level-progression table on
// the wiki. Covers all levels 1-40 — pre-epic and epic together, because most
// epic features are continuations of pre-epic ones (Barbarian damage reduction
// I-IV then epic I-VI, Druid wild shape, Pale Master bone skin, and so on).
//
// Shape: CLASS_FEATURES[classKey] = [{ level, name, key? }]
//   level — CLASS level (not character level) at which it is gained
//   name  — display text
//   key   — optional stable identifier, present only for features that other
//           rules actually test for (epic feat prerequisites). Using a key
//           rather than matching display strings keeps those checks robust.
//
// Bonus feats are deliberately NOT listed here — they're feat *slots*, handled
// by CLASS_BONUS_FEAT_LEVELS in epicProgression.js. This file is only the
// automatic features a class grants.

export const CLASS_FEATURES = {
  // ── Base classes ──────────────────────────────────────────────────────────
  barbarian: [
    { level: 1,  name: 'Barbarian fast movement' },
    { level: 1,  name: 'Barbarian rage (1x/day)', key: 'rage' },
    { level: 2,  name: 'Uncanny dodge I' },
    { level: 4,  name: 'Barbarian rage (2x/day)' },
    { level: 5,  name: 'Uncanny dodge II' },
    { level: 8,  name: 'Barbarian rage (3x/day)' },
    { level: 10, name: 'Uncanny dodge III' },
    { level: 11, name: 'Damage reduction I' },
    { level: 12, name: 'Barbarian rage (4x/day)' },
    { level: 13, name: 'Uncanny dodge IV' },
    { level: 14, name: 'Damage reduction II' },
    { level: 15, name: 'Greater rage (4x/day)', key: 'greaterrage' },
    { level: 16, name: 'Greater rage (5x/day)' },
    { level: 16, name: 'Uncanny dodge V' },
    { level: 17, name: 'Damage reduction III' },
    { level: 19, name: 'Uncanny dodge VI' },
    { level: 20, name: 'Damage reduction IV' },
    { level: 20, name: 'Greater rage (6x/day)', key: 'greaterrage6' },
    { level: 23, name: 'Epic barbarian damage reduction I' },
    { level: 26, name: 'Epic barbarian damage reduction II' },
    { level: 29, name: 'Epic barbarian damage reduction III' },
    { level: 32, name: 'Epic barbarian damage reduction IV' },
    { level: 35, name: 'Epic barbarian damage reduction V' },
    { level: 38, name: 'Epic barbarian damage reduction VI' },
  ],
  bard: [
    { level: 1, name: 'Bardic knowledge' },
    { level: 1, name: 'Bard song', key: 'bardsong' },
  ],
  cleric: [
    { level: 1, name: 'Turn undead', key: 'turnundead' },
  ],
  druid: [
    { level: 1,  name: 'Animal companion' },
    { level: 1,  name: 'Nature sense' },
    { level: 2,  name: 'Woodland stride' },
    { level: 3,  name: 'Trackless step' },
    { level: 4,  name: "Resist nature's lure" },
    { level: 5,  name: 'Wild shape — animal (1x/day)', key: 'wildshape' },
    { level: 6,  name: 'Wild shape (2x/day)' },
    { level: 7,  name: 'Wild shape (3x/day)' },
    { level: 9,  name: 'Venom immunity' },
    { level: 10, name: 'Wild shape (4x/day)' },
    { level: 12, name: 'Wild shape — improved forms' },
    { level: 14, name: 'Wild shape (5x/day)' },
    { level: 16, name: 'Elemental shape — huge (1x/day)' },
    { level: 17, name: 'Elemental shape (2x/day)' },
    { level: 18, name: 'Wild shape (6x/day)', key: 'wildshape6' },
    { level: 19, name: 'Elemental shape (3x/day)' },
    { level: 20, name: 'Improved elemental shape — elder' },
    { level: 22, name: 'Infinite wild shape' },
    { level: 26, name: 'Infinite elemental shape' },
  ],
  fighter: [],
  monk: [
    { level: 1,  name: 'Monk AC bonus' },
    { level: 1,  name: 'Cleave' },
    { level: 1,  name: 'Stunning fist' },
    { level: 1,  name: 'Evasion' },
    { level: 2,  name: 'Deflect arrows' },
    { level: 3,  name: 'Monk speed' },
    { level: 3,  name: 'Still mind' },
    { level: 5,  name: 'Purity of body' },
    { level: 6,  name: 'Knockdown / Improved knockdown' },
    { level: 7,  name: 'Wholeness of body' },
    { level: 9,  name: 'Improved evasion', key: 'improvedevasion' },
    { level: 10, name: 'Ki strike +1' },
    { level: 11, name: 'Diamond body' },
    { level: 12, name: 'Diamond soul', key: 'diamondsoul' },
    { level: 13, name: 'Ki strike +2' },
    { level: 15, name: 'Quivering palm' },
    { level: 16, name: 'Ki strike +3', key: 'kistrike3' },
    { level: 18, name: 'Empty body' },
    { level: 20, name: 'Perfect self' },
  ],
  paladin: [
    { level: 1, name: 'Divine grace' },
    { level: 1, name: 'Divine health' },
    { level: 1, name: 'Lay on hands' },
    { level: 2, name: 'Aura of courage' },
    { level: 2, name: 'Smite evil', key: 'smite' },
    { level: 3, name: 'Remove disease' },
    { level: 3, name: 'Turn undead', key: 'turnundead' },
    { level: 5, name: 'Summon mount' },
  ],
  ranger: [
    { level: 1, name: 'Dual-wield (ranger)' },
    { level: 1, name: 'Trackless step' },
    { level: 6, name: 'Animal companion' },
    { level: 9, name: 'Improved two-weapon fighting (ranger)' },
  ],
  rogue: [
    { level: 1,  name: 'Sneak attack +1d6', key: 'sneakattack' },
    { level: 2,  name: 'Evasion' },
    { level: 3,  name: 'Uncanny dodge I' },
    { level: 6,  name: 'Uncanny dodge II' },
    { level: 11, name: 'Uncanny dodge III' },
    { level: 14, name: 'Uncanny dodge IV' },
    { level: 17, name: 'Uncanny dodge V' },
    { level: 20, name: 'Uncanny dodge VI' },
  ],
  sorcerer: [
    { level: 1, name: 'Summon familiar' },
  ],
  wizard: [
    { level: 1, name: 'Summon familiar' },
    { level: 1, name: 'Scribe scroll' },
  ],

  // ── Prestige classes ──────────────────────────────────────────────────────
  arcanearcher: [
    { level: 1,  name: 'Enchant arrow' },
    { level: 2,  name: 'Imbue arrow' },
    { level: 4,  name: 'Seeker arrow I' },
    { level: 6,  name: 'Seeker arrow II' },
    { level: 8,  name: 'Hail of arrows' },
    { level: 10, name: 'Arrow of death' },
  ],
  assassin: [
    { level: 1,  name: 'Use poison' },
    { level: 1,  name: 'Death attack', key: 'deathattack' },
    { level: 2,  name: 'Ghostly visage' },
    { level: 2,  name: 'Uncanny dodge I' },
    { level: 2,  name: '+1 save vs. poison' },
    { level: 5,  name: 'Darkness' },
    { level: 5,  name: 'Uncanny dodge II' },
    { level: 7,  name: 'Invisibility' },
    { level: 9,  name: 'Improved invisibility' },
    { level: 10, name: 'Uncanny dodge III' },
  ],
  blackguard: [
    { level: 1, name: 'Use poison' },
    { level: 2, name: "Bull's strength" },
    { level: 2, name: 'Dark blessing' },
    { level: 2, name: 'Smite good', key: 'smite' },
    { level: 3, name: 'Create undead' },
    { level: 3, name: 'Turn undead', key: 'turnundead' },
    { level: 4, name: 'Sneak attack (blackguard)', key: 'sneakattack' },
    { level: 5, name: 'Summon fiendish servant' },
    { level: 6, name: 'Inflict serious wounds' },
    { level: 7, name: 'Contagion' },
    { level: 8, name: 'Inflict critical wounds' },
    { level: 15, name: 'Epic fiendish servant' },
  ],
  championoftorm: [
    { level: 1,  name: 'Lay on hands' },
    { level: 2,  name: 'Sacred defense +1' },
    { level: 3,  name: 'Smite evil', key: 'smite' },
    { level: 4,  name: 'Sacred defense +1' },
    { level: 5,  name: 'Divine wrath' },
    { level: 6,  name: 'Sacred defense +1' },
    { level: 8,  name: 'Sacred defense +1' },
    { level: 10, name: 'Sacred defense +1' },
    { level: 10, name: 'Divine wrath +2' },
    { level: 12, name: 'Sacred defense +1' },
    { level: 14, name: 'Sacred defense +1' },
    { level: 15, name: 'Divine wrath +2' },
    { level: 16, name: 'Sacred defense +1' },
    { level: 18, name: 'Sacred defense +1' },
    { level: 20, name: 'Sacred defense +1' },
    { level: 20, name: 'Divine wrath +2' },
    { level: 22, name: 'Sacred defense +1' },
    { level: 24, name: 'Sacred defense +1' },
    { level: 25, name: 'Divine wrath +2' },
    { level: 26, name: 'Sacred defense +1' },
    { level: 28, name: 'Sacred defense +1' },
    { level: 30, name: 'Sacred defense +1' },
    { level: 30, name: 'Divine wrath +2' },
  ],
  dragondisciple: [
    { level: 1,  name: 'Draconic armor +1 AC' },
    { level: 2,  name: 'Dragon abilities' },
    { level: 3,  name: 'Dragon breath' },
    { level: 4,  name: 'Hit die increase' },
    { level: 9,  name: 'Gains wings' },
    { level: 10, name: 'Becomes a half-dragon' },
    { level: 14, name: 'Draconic ability increase (1st)' },
    { level: 18, name: 'Draconic ability increase (2nd)' },
    { level: 22, name: 'Draconic ability increase (3rd)' },
    { level: 26, name: 'Draconic ability increase (4th)' },
    { level: 30, name: 'Draconic ability increase (5th)' },
  ],
  dwarvendefender: [
    { level: 1,  name: 'Defensive stance' },
    { level: 2,  name: 'Defensive awareness I' },
    { level: 5,  name: 'Defensive awareness II' },
    { level: 6,  name: 'Dwarven defender damage reduction' },
    { level: 10, name: 'Defensive awareness III' },
  ],
  harperscout: [
    { level: 1, name: 'Bardic knowledge' },
    { level: 2, name: "Deneir's eye" },
    { level: 2, name: 'Sleep' },
    { level: 3, name: "Cat's grace" },
    { level: 3, name: "Tymora's smile" },
    { level: 4, name: "Eagle's splendor" },
    { level: 4, name: "Lliira's heart" },
    { level: 5, name: 'Craft harper item' },
    { level: 5, name: 'Invisibility' },
  ],
  palemaster: [
    { level: 1,  name: 'Bone skin +2 AC' },
    { level: 2,  name: 'Animate dead' },
    { level: 3,  name: 'Darkvision' },
    { level: 4,  name: 'Summon undead' },
    { level: 4,  name: 'Bone skin +2 AC' },
    { level: 5,  name: 'Deathless vigor +3 HP' },
    { level: 6,  name: 'Undead graft' },
    { level: 6,  name: 'Deathless vigor +3 HP' },
    { level: 7,  name: 'Tough as bone' },
    { level: 7,  name: 'Deathless vigor +3 HP' },
    { level: 8,  name: 'Undead graft II' },
    { level: 8,  name: 'Bone skin +2 AC' },
    { level: 8,  name: 'Deathless vigor +3 HP' },
    { level: 9,  name: 'Summon greater undead' },
    { level: 9,  name: 'Deathless vigor +3 HP' },
    { level: 10, name: 'Deathless master touch' },
    { level: 10, name: 'Deathless mastery' },
    { level: 10, name: 'Deathless vigor +3 HP' },
    { level: 12, name: 'Bone skin +2 AC' },
    { level: 15, name: 'Deathless vigor +5 HP' },
    { level: 16, name: 'Bone skin +2 AC' },
    { level: 20, name: 'Bone skin +2 AC' },
    { level: 20, name: 'Deathless vigor +5 HP' },
    { level: 24, name: 'Bone skin +2 AC' },
    { level: 25, name: 'Deathless vigor +5 HP' },
    { level: 28, name: 'Bone skin +2 AC' },
    { level: 30, name: 'Deathless vigor +5 HP' },
  ],
  shadowdancer: [
    { level: 1,  name: 'Hide in plain sight' },
    { level: 2,  name: 'Darkvision' },
    { level: 2,  name: 'Evasion' },
    { level: 2,  name: 'Uncanny dodge I' },
    { level: 3,  name: 'Shadow daze' },
    { level: 3,  name: 'Summon shadow' },
    { level: 4,  name: 'Shadow evade' },
    { level: 5,  name: 'Defensive roll', key: 'defensiveroll' },
    { level: 5,  name: 'Uncanny dodge II' },
    { level: 6,  name: 'Shadow fiend' },
    { level: 7,  name: 'Slippery mind' },
    { level: 9,  name: 'Shadow lord' },
    { level: 10, name: 'Improved evasion', key: 'improvedevasion' },
    { level: 10, name: 'Uncanny dodge III' },
  ],
  shifter: [
    { level: 1,  name: 'Greater wild shape I' },
    { level: 3,  name: 'Greater wild shape II' },
    { level: 4,  name: 'Infinite greater wild shape I' },
    { level: 5,  name: 'Greater wild shape III' },
    { level: 7,  name: 'Humanoid shape' },
    { level: 7,  name: 'Infinite greater wild shape II' },
    { level: 10, name: 'Greater wild shape IV', key: 'greaterwildshape4' },
    { level: 10, name: 'Infinite greater wild shape III' },
    { level: 11, name: 'Epic shifter forms (harpy, gargoyle, minotaur)' },
    { level: 13, name: 'Infinite humanoid shape' },
    { level: 15, name: 'Epic shifter forms (basilisk, drider, manticore)' },
    { level: 16, name: 'Infinite greater wild shape IV' },
    { level: 17, name: 'Epic shifter forms (drow, lizardfolk, kobold)' },
  ],
  weaponmaster: [
    { level: 1,  name: 'Weapon of choice' },
    { level: 1,  name: 'Ki damage' },
    { level: 5,  name: 'Increased multiplier' },
    { level: 5,  name: 'Superior weapon focus (+1 AB)' },
    { level: 7,  name: 'Ki critical' },
    { level: 13, name: 'Epic superior weapon focus (+1 AB)' },
    { level: 16, name: 'Epic superior weapon focus (+1 AB)' },
    { level: 19, name: 'Epic superior weapon focus (+1 AB)' },
    { level: 22, name: 'Epic superior weapon focus (+1 AB)' },
    { level: 25, name: 'Epic superior weapon focus (+1 AB)' },
    { level: 28, name: 'Epic superior weapon focus (+1 AB)' },
  ],
}

// Features granted at exactly this class level.
export function featuresAtClassLevel(classKey, classLevel) {
  return (CLASS_FEATURES[classKey] ?? []).filter(f => f.level === classLevel)
}

// All features a character has, given aggregated [{classKey, levels}].
export function allClassFeatures(classLevels) {
  const out = []
  for (const { classKey, levels } of classLevels) {
    for (const f of CLASS_FEATURES[classKey] ?? []) {
      if (f.level <= levels) out.push({ ...f, classKey })
    }
  }
  return out
}

// Whether the character has a keyed class feature (e.g. 'improvedevasion').
// Used by epic feat prerequisites that depend on class features rather than
// on class levels directly.
export function hasClassFeature(classLevels, featureKey) {
  return classLevels.some(({ classKey, levels }) =>
    (CLASS_FEATURES[classKey] ?? []).some(f => f.key === featureKey && f.level <= levels)
  )
}
