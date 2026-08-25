// NWN:EE epic feats (Hordes of the Underdark), sourced from the NWN wiki's
// Category:Epic feats. These are only selectable by epic characters
// (character level 21+), which is why every entry carries `epic: true`.
//
// Reachable now that SERVER_SETTINGS.maxLevel is 40 (see classes.js).
//
// Extra schema fields beyond the normal FEATS shape:
//   epic: true          — only offered at character level 21+
//   stackable: N        — may be taken up to N times (omit = once only)
//   prereqs.minLevel    — minimum total character level
//   prereqs.skills      — { skillKey: minRanks }
//   prereqs.cast9th     — requires the ability to cast 9th-level spells
//   prereqs.epicCaster  — requires epic Cleric/Druid/Sorcerer/Wizard, or
//                         Pale Master 15+ (the real in-game epic spell gate)
//   autoGranted: true   — granted by class progression, never player-picked
//   weaponFocus: true   — requires choosing a weapon (same as base feats)
//
// Note on "21st level" prereqs: the wiki words several of these as "epic
// character" / "epic <class>" rather than a hard level number, but they
// resolve to the same gate (character level 21+), so minLevel: 21 is used
// consistently.

export const EPIC_FEATS = {
  // ── Defensive / survivability ─────────────────────────────────────────────
  armorskin: {
    name: 'Armor Skin', type: 'general', epic: true,
    description: '+2 natural bonus to Armor Class.',
    prereqs: { minLevel: 21 },
  },
  epicdamagereduction: {
    name: 'Epic Damage Reduction', type: 'general', epic: true, stackable: 3,
    description: 'Damage reduction 3/-. May be taken up to 3 times (to 9/-).',
    prereqs: { minLevel: 21, con: 21 },
  },
  epicdodge: {
    name: 'Epic Dodge', type: 'general', epic: true,
    description: 'Automatically avoid the first attack against you each round.',
    prereqs: {
      minLevel: 21, dex: 25, feats: ['dodge'], skills: { tumble: 30 },
      classFeatures: { improvedevasion: 'Improved Evasion', defensiveroll: 'Defensive Roll' },
    },
  },
  epicenergyresistance: {
    name: 'Epic Energy Resistance', type: 'general', epic: true, stackable: 10,
    description: 'Resistance 10 to a chosen damage type. May be taken multiple times.',
    prereqs: { minLevel: 21 },
  },
  epicfortitude: {
    name: 'Epic Fortitude', type: 'general', epic: true,
    description: '+4 bonus to all Fortitude saves.',
    prereqs: { minLevel: 21 },
  },
  epicreflexes: {
    name: 'Epic Reflexes', type: 'general', epic: true,
    description: '+4 bonus to all Reflex saves.',
    prereqs: { minLevel: 21 },
  },
  epicwill: {
    name: 'Epic Will', type: 'general', epic: true,
    description: '+4 bonus to all Will saves.',
    prereqs: { minLevel: 21 },
  },
  epictoughness: {
    name: 'Epic Toughness', type: 'general', epic: true, stackable: 10,
    description: '+20 hit points. May be taken up to 10 times (to +200 HP).',
    prereqs: { minLevel: 21 },
  },
  perfecthealth: {
    name: 'Perfect Health', type: 'general', epic: true,
    description: 'Immunity to all diseases and poisons.',
    prereqs: { minLevel: 21, con: 25, feats: ['greatfortitude'] },
  },
  selfconcealment: {
    name: 'Self Concealment', type: 'general', epic: true, stackable: 5,
    description: '+10% concealment. May be taken up to 5 times (to 50%).',
    prereqs: {
      minLevel: 21, dex: 30, skills: { hide: 30, tumble: 30 },
      classFeatures: { improvedevasion: 'Improved Evasion' },
    },
  },
  improvedspellresistance: {
    name: 'Improved Spell Resistance', type: 'general', epic: true, stackable: 10,
    description: '+2 spell resistance. May be taken up to 10 times (to +20).',
    prereqs: { minLevel: 21, classFeatures: { diamondsoul: 'Diamond Soul (Monk 12)' } },
  },

  // ── Ability scores ────────────────────────────────────────────────────────
  greatstrength: {
    name: 'Great Strength', type: 'general', epic: true, stackable: 10,
    description: '+1 Strength. May be taken up to 10 times.',
    prereqs: { minLevel: 21 },
  },
  greatdexterity: {
    name: 'Great Dexterity', type: 'general', epic: true, stackable: 10,
    description: '+1 Dexterity. May be taken up to 10 times.',
    prereqs: { minLevel: 21 },
  },
  greatconstitution: {
    name: 'Great Constitution', type: 'general', epic: true, stackable: 10,
    description: '+1 Constitution. May be taken up to 10 times.',
    prereqs: { minLevel: 21 },
  },
  greatintelligence: {
    name: 'Great Intelligence', type: 'general', epic: true, stackable: 10,
    description: '+1 Intelligence. May be taken up to 10 times.',
    prereqs: { minLevel: 21 },
  },
  greatwisdom: {
    name: 'Great Wisdom', type: 'general', epic: true, stackable: 10,
    description: '+1 Wisdom. May be taken up to 10 times.',
    prereqs: { minLevel: 21 },
  },
  greatcharisma: {
    name: 'Great Charisma', type: 'general', epic: true, stackable: 10,
    description: '+1 Charisma. May be taken up to 10 times.',
    prereqs: { minLevel: 21 },
  },

  // ── Combat ────────────────────────────────────────────────────────────────
  epicprowess: {
    name: 'Epic Prowess', type: 'general', epic: true,
    description: '+1 bonus to all attack rolls.',
    prereqs: { minLevel: 21 },
  },
  epicweaponfocus: {
    name: 'Epic Weapon Focus', type: 'general', epic: true, weaponFocus: true,
    description: '+2 attack bonus with the chosen weapon (stacks with Weapon Focus).',
    prereqs: { minLevel: 21, feats: ['weaponfocus'] },
  },
  epicweaponspecialization: {
    name: 'Epic Weapon Specialization', type: 'fighter', epic: true, weaponFocus: true,
    description: '+4 damage with the chosen weapon (stacks with Weapon Specialization).',
    prereqs: { minLevel: 21, feats: ['weaponfocus', 'epicweaponfocus', 'weaponspec'] },
    prereqNote: 'Fighter-only (also available to Weapon Master).',
  },
  overwhelmingcritical: {
    name: 'Overwhelming Critical', type: 'general', epic: true, weaponFocus: true,
    description: '+1d6 damage on a critical hit with the chosen weapon (more for higher multipliers).',
    prereqs: { minLevel: 21, str: 23, feats: ['cleave', 'greatcleave', 'improvedcritical', 'powerattack'] },
  },
  devastatingcritical: {
    name: 'Devastating Critical', type: 'general', epic: true, weaponFocus: true,
    description: 'Critical hits with the chosen weapon force a Fortitude save or die.',
    prereqs: {
      minLevel: 21, str: 25,
      feats: ['cleave', 'greatcleave', 'improvedcritical', 'overwhelmingcritical', 'powerattack', 'weaponfocus'],
    },
  },
  improvedwhirlwindattack: {
    name: 'Improved Whirlwind Attack', type: 'general', epic: true,
    description: 'Full attack against every opponent you threaten.',
    prereqs: {
      minLevel: 21, int: 13, dex: 23,
      feats: ['dodge', 'expertise', 'mobility', 'springattack', 'whirlwindattack'],
    },
  },
  superiorinitiative: {
    name: 'Superior Initiative', type: 'general', epic: true,
    description: '+8 bonus on initiative checks (replaces Improved Initiative).',
    prereqs: { minLevel: 21, feats: ['improvedinitiative'] },
  },
  blindingspeed: {
    name: 'Blinding Speed', type: 'general', epic: true,
    description: 'Cast Haste on yourself once per day for 10 rounds.',
    prereqs: { minLevel: 21, dex: 25 },
  },
  improvedsneakattack: {
    name: 'Improved Sneak Attack', type: 'general', epic: true, stackable: 10,
    description: '+1d6 sneak attack damage. May be taken up to 10 times.',
    prereqs: { minLevel: 21 },
    prereqNote: 'Requires Sneak Attack, Death Attack, or Blackguard sneak attack at +8d6.',
  },
  improvedstunningfist: {
    name: 'Improved Stunning Fist', type: 'general', epic: true, stackable: 10,
    description: '+2 to the DC of your Stunning Fist. May be taken up to 10 times.',
    prereqs: { minLevel: 21, dex: 19, wis: 19, feats: ['improvedunarmedstrike', 'stunningfist'] },
  },
  greatsmiting: {
    name: 'Great Smiting', type: 'general', epic: true, stackable: 10,
    description: 'Smite attacks add twice your level to damage. May be taken up to 10 times.',
    prereqs: { minLevel: 21, cha: 25, classFeatures: { smite: 'Smite Good or Smite Evil' } },
  },
  epicreputation: {
    name: 'Epic Reputation', type: 'general', epic: true,
    description: '+4 bonus to Bluff, Intimidate, Persuade, and Taunt checks.',
    prereqs: { minLevel: 21 },
  },
  epicskillfocus: {
    name: 'Epic Skill Focus', type: 'skillbonus', epic: true,
    description: '+10 bonus on all checks with the chosen skill (stacks with Skill Focus).',
    prereqs: { minLevel: 21 },
    prereqNote: 'Requires 20 ranks in the chosen skill.',
  },

  // ── Spellcasting ──────────────────────────────────────────────────────────
  epicspellfocus: {
    name: 'Epic Spell Focus', type: 'spellcasting', epic: true,
    description: '+6 to the save DC of spells from the chosen school.',
    prereqs: { minLevel: 21, cast9th: true },
    prereqNote: 'Requires Spell Focus and Greater Spell Focus in the chosen school.',
  },
  epicspellpenetration: {
    name: 'Epic Spell Penetration', type: 'spellcasting', epic: true,
    description: '+6 bonus on caster level checks to beat spell resistance.',
    prereqs: { minLevel: 21, feats: ['spellpenetration', 'greaterspellpen'] },
  },
  improvedcombatcasting: {
    name: 'Improved Combat Casting', type: 'spellcasting', epic: true,
    description: 'Casting while threatened never provokes attacks of opportunity.',
    prereqs: { minLevel: 21, feats: ['combatcasting'], skills: { concentration: 25 } },
  },
  automaticquickenspell: {
    name: 'Automatic Quicken Spell', type: 'metamagic', epic: true, stackable: 3,
    description: 'Automatically quicken spells: I (levels 0-3), II (4-6), III (7-9).',
    prereqs: { minLevel: 21, feats: ['quickenspell'], skills: { spellcraft: 30 }, cast9th: true },
  },
  automaticsilentspell: {
    name: 'Automatic Silent Spell', type: 'metamagic', epic: true, stackable: 3,
    description: 'Automatically silence spells: I (levels 0-3), II (4-6), III (7-9).',
    prereqs: { minLevel: 21, feats: ['silentspell'], skills: { spellcraft: 24 }, cast9th: true },
  },
  automaticstillspell: {
    name: 'Automatic Still Spell', type: 'metamagic', epic: true, stackable: 3,
    description: 'Automatically still spells: I (levels 0-3), II (4-6), III (7-9).',
    prereqs: { minLevel: 21, feats: ['stillspell'], skills: { spellcraft: 27 }, cast9th: true },
  },

  // ── Epic spells (each is a feat that grants a castable epic spell) ────────
  epicspellmummydust: {
    name: 'Epic Spell: Mummy Dust', type: 'spellcasting', epic: true,
    description: 'Summons a powerful mummy warrior to fight for you.',
    prereqs: { minLevel: 21, epicCaster: true, skills: { spellcraft: 15 } },
  },
  epicspelldragonknight: {
    name: 'Epic Spell: Dragon Knight', type: 'spellcasting', epic: true,
    description: 'Summons an adult red dragon to fight at your side.',
    prereqs: { minLevel: 21, epicCaster: true, skills: { spellcraft: 22 } },
  },
  epicspellgreaterruin: {
    name: 'Epic Spell: Greater Ruin', type: 'spellcasting', epic: true,
    description: '35d6 damage to a single target (Fortitude save for half).',
    prereqs: { minLevel: 21, epicCaster: true, skills: { spellcraft: 25 } },
  },
  epicspellmagearmor: {
    name: 'Epic Spell: Epic Mage Armor', type: 'spellcasting', epic: true,
    description: 'Grants the caster a +20 Armor Class bonus.',
    prereqs: { minLevel: 21, epicCaster: true, skills: { spellcraft: 26 } },
    prereqNote: 'Sorcerer/Wizard (or Pale Master 15+) only.',
  },
  epicspellhellball: {
    name: 'Epic Spell: Hellball', type: 'spellcasting', epic: true,
    description: '10d6 acid, fire, electrical, and sonic damage in a blast radius.',
    prereqs: { minLevel: 21, epicCaster: true, skills: { spellcraft: 32 } },
  },
  epicspellepicwarding: {
    name: 'Epic Spell: Epic Warding', type: 'spellcasting', epic: true,
    description: 'Damage reduction 50/+20 for 1 round per level.',
    prereqs: { minLevel: 21, epicCaster: true, skills: { spellcraft: 34 } },
  },

  // ── Class-restricted epic feats ───────────────────────────────────────────
  baneofenemies: {
    name: 'Bane of Enemies', type: 'general', epic: true,
    description: 'Weapons count as bane weapons against your favored enemies (+2 hit, +2d6 damage).',
    prereqs: { minLevel: 21, classLevels: { ranger: 21 } },
  },
  mightyrage: {
    name: 'Mighty Rage', type: 'general', epic: true,
    description: 'Rage grants +8 Strength and Constitution, and +4 morale bonus to Will saves.',
    prereqs: {
      minLevel: 21, str: 21, con: 21,
      classFeatures: { greaterrage6: 'Greater Rage 6x/day (Barbarian 20)' },
    },
  },
  terrifyingrage: {
    name: 'Terrifying Rage', type: 'general', epic: true,
    description: 'Enemies near you while raging must save or become panicked.',
    prereqs: {
      minLevel: 21, skills: { intimidate: 25 },
      classFeatures: { greaterrage: 'Greater Rage (Barbarian 15)' },
    },
  },
  thunderingrage: {
    name: 'Thundering Rage', type: 'general', epic: true,
    description: 'Weapons deal +2d6 on a critical while raging, and may deafen the target.',
    prereqs: {
      minLevel: 21, str: 25,
      classFeatures: { greaterrage: 'Greater Rage (Barbarian 15)' },
    },
  },
  lastinginspiration: {
    name: 'Lasting Inspiration', type: 'general', epic: true,
    description: 'Bardic music effects last ten times longer.',
    prereqs: {
      minLevel: 21, skills: { perform: 25 },
      classFeatures: { bardsong: 'Bard Song' },
    },
  },
  planarturning: {
    name: 'Planar Turning', type: 'general', epic: true,
    description: 'Allows outsiders to be turned as though they were undead.',
    prereqs: { minLevel: 21, wis: 25, cha: 25, classFeatures: { turnundead: 'Turn Undead' } },
  },
  improvedkistrike4: {
    name: 'Improved Ki Strike 4', type: 'general', epic: true,
    description: 'Unarmed attacks count as a +4 magic weapon against damage reduction.',
    prereqs: { minLevel: 21, wis: 21, classFeatures: { kistrike3: 'Ki Strike +3 (Monk 16)' } },
  },
  improvedkistrike5: {
    name: 'Improved Ki Strike 5', type: 'general', epic: true,
    description: 'Unarmed attacks count as a +5 magic weapon against damage reduction.',
    prereqs: { minLevel: 21, feats: ['improvedkistrike4'], classLevels: { monk: 16 } },
  },

  // ── Shifter epic shapes ───────────────────────────────────────────────────
  undeadshape: {
    name: 'Undead Shape', type: 'general', epic: true,
    description: 'Shift into a risen lord, vampire, or spectre three times per day.',
    prereqs: { minLevel: 21, classLevels: { shifter: 10 } },
  },
  outsidershape: {
    name: 'Outsider Shape', type: 'general', epic: true,
    description: 'Shift into an azer chieftain, rakshasa, or death slaad three times per day.',
    prereqs: { minLevel: 21, wis: 25, classLevels: { shifter: 10 } },
  },
  constructshape: {
    name: 'Construct Shape', type: 'general', epic: true,
    description: 'Shift into an iron, stone, or demonflesh golem three times per day.',
    prereqs: { minLevel: 21, wis: 27, classLevels: { shifter: 10 } },
  },
  dragonshape: {
    name: 'Dragon Shape', type: 'general', epic: true,
    description: 'Use wild shape to become a dragon for 1 hour per class level.',
    prereqs: { minLevel: 21, wis: 30, anyClassFeature: ['wildshape6', 'greaterwildshape4'] },
    prereqNote: 'Requires Wild Shape 6x/day (Druid 18) or Greater Wild Shape IV (Shifter 10).',
  },

  // ── Auto-granted (never player-selected; listed for completeness) ─────────
  epicfiendishservant: {
    name: 'Epic Fiendish Servant', type: 'classfeat', epic: true, autoGranted: true,
    description: 'Your fiendish servant becomes an epic vrock that grows with your level.',
    prereqs: { classLevels: { blackguard: 15 } },
  },
  epicshadowlord: {
    name: 'Epic Shadowlord', type: 'classfeat', epic: true, autoGranted: true,
    description: 'Your Summon Shadow ability calls an epic shadowlord instead — a potent fighter that grows stronger with your level.',
    prereqs: { classLevels: { shadowdancer: 13 } },
  },
}
