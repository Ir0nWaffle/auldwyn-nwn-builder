// Spell selection rules — which classes require the player to pick specific
// spells at level-up, and how many picks they get.
//
// GATED: this whole feature is inert until SERVER_SETTINGS.spellSelectionEnabled
// is flipped to true in classes.js. Nothing here is wired into the live level
// planner yet.
//
// Cleric, Druid, Paladin, and Ranger are prepared casters who know their
// entire class spell list automatically and choose what to prepare each day
// in actual play — there's nothing to pick at build time, so they're excluded.
//
// Sorcerer and Bard are spontaneous casters limited by SPELLS_KNOWN (see
// spellSlots.js): the table gives, per class level, exactly how many spells
// they know at each spell level. The number of NEW spells learnable at a
// level-up is the increase in that table's count at each spell level — so a
// new pick is tied to the specific spell level that opened up, not a free
// choice of any level.
//
// Wizard is a prepared caster but keeps her own spellbook, which she expands
// by choosing new spells rather than knowing the whole list. Confirmed via
// the wiki (nwn.fandom.com/wiki/Wizard, "Notes" section):
//   - All cantrips are known automatically from level 1 — never a pick.
//   - At wizard level 1, she additionally learns (3 + Int modifier) 1st-level
//     spells of the player's choice.
//   - At every wizard level after that, she learns 2 new spells of the
//     player's choice, of any spell level she can currently cast.
// (Scrolls found during play can add more, but that's outside a build planner.)

import { SPELL_LISTS } from './spells.js'
import {
  SPELLS_KNOWN, FIRST_SPELL_LEVEL, MAX_CASTER_LEVEL, baseSpellSlots, baseSpellsKnown,
} from './spellSlots.js'

const SPONTANEOUS_CASTERS = ['sorcerer', 'bard']

export function needsSpellSelection(classKey) {
  return classKey === 'wizard' || SPONTANEOUS_CASTERS.includes(classKey)
}

// Highest spell level a class can cast at a given class level (-1 if none).
export function maxSpellLevelAtClassLevel(classKey, classLevel) {
  const slots = baseSpellSlots(classKey, Math.min(classLevel, MAX_CASTER_LEVEL))
  if (!slots) return -1
  const first = FIRST_SPELL_LEVEL[classKey] ?? 0
  let max = -1
  slots.forEach((s, idx) => { if (s !== null) max = idx + first })
  return max
}

// New spells known per spell level gained at this class level, for
// spontaneous casters (Sorcerer/Bard). Index = spell level.
export function newSpellsKnownAtClassLevel(classKey, classLevel) {
  const table = SPELLS_KNOWN[classKey]
  if (!table) return null
  if (classLevel > MAX_CASTER_LEVEL) return (baseSpellsKnown(classKey, MAX_CASTER_LEVEL) ?? []).map(() => 0)
  const cur = baseSpellsKnown(classKey, classLevel) ?? []
  const prev = classLevel > 1 ? (baseSpellsKnown(classKey, classLevel - 1) ?? []) : []
  return cur.map((c, idx) => Math.max(0, (c ?? 0) - (prev[idx] ?? 0)))
}

// Wizard's free spellbook picks at a class level (see file header for the
// verified rule). `intMod` is the wizard's current effective Int modifier.
export function wizardFreePicksAtClassLevel(classLevel, intMod) {
  if (classLevel > MAX_CASTER_LEVEL) return 0
  if (classLevel === 1) return 3 + Math.max(0, intMod)
  return 2
}

// Budget of spell picks available at a given class level.
//   Wizard   -> { mode: 'any', total }        — any castable level, free choice
//   Sorc/Bard -> { mode: 'perLevel', perLevel, total } — tied to the spell
//                level that opened up
// Returns null for classes that don't need spell selection at all.
export function spellPickBudget(classKey, classLevel, intMod) {
  if (!needsSpellSelection(classKey)) return null
  if (classKey === 'wizard') {
    return { mode: 'any', total: wizardFreePicksAtClassLevel(classLevel, intMod) }
  }
  const perLevel = newSpellsKnownAtClassLevel(classKey, classLevel) ?? []
  return { mode: 'perLevel', perLevel, total: perLevel.reduce((a, b) => a + b, 0) }
}

// Which spell level a spell belongs to for a given class (null if not on
// that class's list at all).
export function spellLevelForClass(classKey, spellKey) {
  const list = SPELL_LISTS[classKey]
  if (!list) return null
  for (const [level, keys] of Object.entries(list)) {
    if (keys.includes(spellKey)) return Number(level)
  }
  return null
}

// Spells eligible to be picked at this class level, excluding ones already
// known/in the spellbook. Wizard cantrips are never eligible (auto-known).
export function eligibleSpellPicks(classKey, classLevel, known) {
  const maxLvl = maxSpellLevelAtClassLevel(classKey, classLevel)
  let first = FIRST_SPELL_LEVEL[classKey] ?? 0
  if (classKey === 'wizard') first = 1
  const out = []
  for (let sl = first; sl <= maxLvl; sl++) {
    for (const key of SPELL_LISTS[classKey]?.[sl] ?? []) {
      if (!known.includes(key)) out.push({ key, level: sl })
    }
  }
  return out
}

// Sorcerer/Bard spell swap-out: confirmed via direct in-game testing (not
// documented on the wiki's class pages, which only cover new-spell counts —
// this is level-up UI behavior, not a class trait the wiki catalogs).
// At every level-up, a spontaneous caster may trade any number of previously
// known spells for different spells of the SAME spell level — up to and
// including their entire known spellbook. It's free — doesn't consume the
// level's normal new-spell-pick budget — and any known spell is eligible,
// including 1st-level starting spells. Unlimited per level-up (confirmed by
// the user in-game; an earlier one-swap assumption was wrong).
export function canSwapSpells(classKey) {
  return SPONTANEOUS_CASTERS.includes(classKey)
}

// Applies a level's already-committed swaps to a known-spells list, so
// eligibility checks for the NEXT swap (or new pick) at the same level see
// the up-to-date result rather than the pre-level snapshot.
export function applySwaps(known, swaps) {
  let result = [...known]
  for (const { out, in: inKey } of swaps ?? []) {
    result = result.filter(k => k !== out)
    result.push(inKey)
  }
  return result
}

// Same-level replacement candidates for a known spell being swapped out.
export function eligibleSwapTargets(classKey, outKey, known) {
  const level = spellLevelForClass(classKey, outKey)
  if (level === null) return []
  return (SPELL_LISTS[classKey]?.[level] ?? []).filter(k => k !== outKey && !known.includes(k))
}
