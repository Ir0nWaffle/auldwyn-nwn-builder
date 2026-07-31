import { CLASSES, SERVER_SETTINGS } from '../data/classes.js'
import { FEATS, baseFeatKey, featDisplayName } from '../data/feats.js'

export { baseFeatKey, featDisplayName }
import { SKILLS, maxClassRanks, maxCrossClassRanks } from '../data/skills.js'
import { RACES } from '../data/races.js'
import {
  GENERAL_FEAT_LEVELS, CLASS_BONUS_FEAT_LEVELS, classBonusFeatsAt, classBonusFeatPool,
  epicAttackBonus, epicSaveBonus, EPIC_CLASS_MAX_LEVEL, EPIC_START_LEVEL,
} from '../data/epicProgression.js'
import { hasClassFeature, featuresAtClassLevel, allClassFeatures } from '../data/classFeatures.js'
import {
  needsSpellSelection, spellPickBudget, spellLevelForClass, eligibleSpellPicks,
  maxSpellLevelAtClassLevel, canSwapSpells, eligibleSwapTargets, applySwaps,
} from '../data/spellSelection.js'

export { hasClassFeature, featuresAtClassLevel, allClassFeatures }

export { epicAttackBonus, epicSaveBonus }

export {
  needsSpellSelection, spellPickBudget, eligibleSpellPicks, spellLevelForClass,
  canSwapSpells, eligibleSwapTargets, applySwaps,
}

// ─── Ability helpers ──────────────────────────────────────────────────────────

export function abilityMod(score) {
  return Math.floor((score - 10) / 2)
}

// NWN point-buy cost table (cumulative from base 8)
const POINT_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 6, 15: 8, 16: 10, 17: 13, 18: 16 }
export const ABILITY_POINT_BUDGET = 30

export function pointCost(score) {
  return POINT_COSTS[score] ?? 0
}

export function totalPointsSpent(abilities) {
  return Object.values(abilities).reduce((sum, s) => sum + pointCost(s), 0)
}

// Level-up ability increases: +1 at every 4th character level
export function levelUpIncreasesAvailable(classLevels) {
  return Math.floor(totalCharacterLevel(classLevels) / 4)
}

export function levelUpIncreasesSpent(abilityIncreases) {
  return Object.values(abilityIncreases ?? {}).reduce((s, v) => s + v, 0)
}

// Final effective score: base (point-buy) + racial mod + level-up increases
export function effectiveScore(abilityKey, abilities, racialMods, abilityIncreases) {
  return (abilities[abilityKey] ?? 8)
    + (racialMods[abilityKey] ?? 0)
    + (abilityIncreases[abilityKey] ?? 0)
}

// ─── Character level helpers ──────────────────────────────────────────────────

export function totalCharacterLevel(classLevels) {
  return classLevels.reduce((sum, cl) => sum + cl.levels, 0)
}

export function classLevelFor(classLevels, classKey) {
  return classLevels.find(cl => cl.classKey === classKey)?.levels ?? 0
}

export function hasArcaneSpellcasting(classLevels) {
  return classLevels.some(cl => CLASSES[cl.classKey]?.spellcasting === 'arcane' && cl.levels > 0)
}

export function hasDivineSpellcasting(classLevels) {
  return classLevels.some(cl => CLASSES[cl.classKey]?.spellcasting === 'divine' && cl.levels > 0)
}

// Summed levels across all classes matching a given spellcasting type —
// used for prereqs like "arcane spellcasting level 3+" (e.g. Pale Master).
export function spellcastingLevel(classLevels, type) {
  return classLevels.reduce((sum, cl) => {
    const cls = CLASSES[cl.classKey]
    return cls?.spellcasting === type ? sum + cl.levels : sum
  }, 0)
}

export function hasSpellcasting(classLevels) {
  return hasArcaneSpellcasting(classLevels) || hasDivineSpellcasting(classLevels)
}

// ─── Epic spellcasting helpers ───────────────────────────────────────────────

// Class level at which each full caster gains access to 9th-level spells.
// Bard/Paladin/Ranger are partial casters and never reach 9th, so they're
// intentionally absent.
const NINTH_LEVEL_SPELL_AT = { wizard: 17, cleric: 17, druid: 17, sorcerer: 18 }

export function canCast9thLevelSpells(classLevels) {
  return classLevels.some(cl => {
    const needed = NINTH_LEVEL_SPELL_AT[cl.classKey]
    return needed !== undefined && cl.levels >= needed
  })
}

// The real in-game gate for the Epic Spell feats: an epic Cleric, Druid,
// Sorcerer, or Wizard, or at least 15 Pale Master levels.
const EPIC_SPELL_CLASSES = ['cleric', 'druid', 'sorcerer', 'wizard']

export function isEpicSpellcaster(classLevels) {
  if (classLevelFor(classLevels, 'palemaster') >= 15) return true
  return EPIC_SPELL_CLASSES.some(c => classLevelFor(classLevels, c) > 0)
}

// BAB from progression table
export function calcBAB(classLevels) {
  let bab = 0
  for (const { classKey, levels } of classLevels) {
    const cls = CLASSES[classKey]
    if (!cls) continue
    switch (cls.babProgression) {
      case 'full':   bab += levels; break
      case 'medium': bab += Math.floor(levels * 0.75); break
      case 'half':   bab += Math.floor(levels * 0.5); break
    }
  }
  return bab
}

// Base saves from class progression (good = level/2 + 2, poor = level/3).
export function calcClassSaves(classLevels) {
  let fort = 0, ref = 0, will = 0
  for (const { classKey, levels } of classLevels) {
    const cls = CLASSES[classKey]
    if (!cls) continue
    fort += cls.saves.fort === 'good' ? Math.floor(levels / 2) + 2 : Math.floor(levels / 3)
    ref  += cls.saves.ref  === 'good' ? Math.floor(levels / 2) + 2 : Math.floor(levels / 3)
    will += cls.saves.will === 'good' ? Math.floor(levels / 2) + 2 : Math.floor(levels / 3)
  }
  return { fort, ref, will }
}

// ─── Epic-aware BAB and saves ────────────────────────────────────────────────
// Past character level 20, BAB and saves stop advancing by class and instead
// freeze at their level-20 value plus a flat epic bonus driven by character
// level. That means these need the ordered level plan, not just the aggregated
// class totals — a level of Fighter taken at character level 25 adds no BAB.
//
// Below level 21 these are identical to calcBAB / calcClassSaves, so existing
// level-1-20 characters are unaffected.

// Max levels allowed in a class. Prestige classes cap at 10 (Harper Scout 5)
// pre-epic; once the character is epic most of them extend to 30.
export function classMaxLevel(classKey, charLevel) {
  const base = CLASSES[classKey]?.maxLevel
  if (charLevel >= EPIC_START_LEVEL) {
    const epicMax = EPIC_CLASS_MAX_LEVEL[classKey]
    if (epicMax !== undefined) return epicMax
  }
  return base ?? SERVER_SETTINGS.maxLevel
}

export function babFromPlan(levels) {
  const preEpic = deriveClassLevels(levels.slice(0, 20))
  return calcBAB(preEpic) + epicAttackBonus(levels.length)
}

export function savesFromPlan(levels) {
  const preEpic = deriveClassLevels(levels.slice(0, 20))
  const base = calcClassSaves(preEpic)
  const bonus = epicSaveBonus(levels.length)
  return { fort: base.fort + bonus, ref: base.ref + bonus, will: base.will + bonus }
}

// ─── Skill point calculation ──────────────────────────────────────────────────

// Returns total available skill points for the character build
export function calcTotalSkillPoints(classLevels, intMod, isHuman) {
  let total = 0
  let isFirst = true
  for (const { classKey, levels } of classLevels) {
    const cls = CLASSES[classKey]
    if (!cls) continue
    const perLevel = Math.max(1, cls.skillsPerLevel + intMod)
    if (isFirst) {
      total += perLevel * 4 // 4× at 1st level
      total += (levels - 1) * perLevel
      if (isHuman) total += 4 + (levels - 1) // +1 human bonus per level, +4 at level 1
      isFirst = false
    } else {
      total += levels * perLevel
      if (isHuman) total += levels
    }
  }
  return total
}

export function calcSkillPointsSpent(skills, classLevels = []) {
  return Object.entries(skills).reduce((sum, [key, rank]) => {
    const isCS = classLevels.some(cl => CLASSES[cl.classKey]?.classSkills.includes(key))
    return sum + (isCS || classLevels.length === 0 ? rank : rank * 2)
  }, 0)
}

// ─── Max skill rank for a given skill given the character's class mix ─────────
export function maxRankForSkill(skillKey, classLevels) {
  const charLevel = totalCharacterLevel(classLevels)
  const isClassSkillForAny = classLevels.some(cl =>
    CLASSES[cl.classKey]?.classSkills.includes(skillKey)
  )
  // classOnly skills are completely unavailable if no class has it as a class skill
  if (!isClassSkillForAny && SKILLS[skillKey]?.classOnly) return 0
  return isClassSkillForAny
    ? maxClassRanks(charLevel)
    : maxCrossClassRanks(charLevel)
}

// ─── Feat prerequisites check ─────────────────────────────────────────────────

export function checkFeatPrereqs(featKey, character) {
  const feat = FEATS[baseFeatKey(featKey)]
  if (!feat) return { met: false, reasons: ['Unknown feat'] }

  const { abilities, classLevels, race, selectedFeats } = character
  const prereqs = feat.prereqs
  const reasons = []
  const takenFeatKeys = selectedFeats.map(f => baseFeatKey(f.featKey))
  const bab = calcBAB(classLevels)

  // Prereqs check against final scores: point-buy + racial mods + level-up increases
  const racialMods = RACES[race]?.abilityMods ?? {}
  const increases = character.abilityIncreases ?? {}
  const eff = k => effectiveScore(k, abilities, racialMods, increases)

  if (prereqs.minLevel) {
    const charLevel = totalCharacterLevel(classLevels)
    if (charLevel < prereqs.minLevel) {
      reasons.push(`Character level ${prereqs.minLevel} required (have ${charLevel})`)
    }
  }

  if (prereqs.bab && bab < prereqs.bab) reasons.push(`BAB +${prereqs.bab} required (have +${bab})`)
  for (const k of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
    if (prereqs[k] && eff(k) < prereqs[k]) {
      reasons.push(`${k.toUpperCase()} ${prereqs[k]} required (have ${eff(k)})`)
    }
  }

  if (prereqs.skills) {
    for (const [sk, minRank] of Object.entries(prereqs.skills)) {
      const have = character.skills?.[sk] ?? 0
      if (have < minRank) {
        reasons.push(`${SKILLS[sk]?.name ?? sk}: ${minRank} ranks required (have ${have})`)
      }
    }
  }

  if (prereqs.spellcasting && !hasSpellcasting(classLevels))
    reasons.push('Requires spellcasting levels')

  if (prereqs.cast9th && !canCast9thLevelSpells(classLevels))
    reasons.push('Requires the ability to cast 9th-level spells')

  if (prereqs.epicCaster && !isEpicSpellcaster(classLevels))
    reasons.push('Requires an epic Cleric, Druid, Sorcerer, or Wizard (or Pale Master 15+)')

  if (prereqs.classFeatures) {
    for (const [key, label] of Object.entries(prereqs.classFeatures)) {
      if (!hasClassFeature(classLevels, key)) reasons.push(`Requires ${label}`)
    }
  }

  // Any-of form, for feats satisfied by either of two class features
  if (prereqs.anyClassFeature) {
    if (!prereqs.anyClassFeature.some(k => hasClassFeature(classLevels, k))) {
      reasons.push(feat.prereqNote ?? 'Requires a qualifying class feature')
    }
  }

  if (prereqs.feats) {
    for (const req of prereqs.feats) {
      if (!takenFeatKeys.includes(req)) {
        reasons.push(`Requires ${FEATS[req]?.name ?? req}`)
      }
    }
  }

  if (prereqs.fighterLevel) {
    const fl = classLevelFor(classLevels, 'fighter')
    if (fl < prereqs.fighterLevel) reasons.push(`Fighter ${prereqs.fighterLevel} required (have ${fl})`)
  }

  if (prereqs.classLevels) {
    for (const [cls, lvl] of Object.entries(prereqs.classLevels)) {
      const have = classLevelFor(classLevels, cls)
      if (have < lvl) reasons.push(`${CLASSES[cls]?.name ?? cls} ${lvl} required (have ${have})`)
    }
  }

  return { met: reasons.length === 0, reasons }
}

// Total general + class bonus feats available for the build.
// General feats follow the every-3-levels cadence (1,3,6,...,18) which
// continues into epic levels (21,24,...,39). Class bonus feats come from each
// class's own schedule in CLASS_BONUS_FEAT_LEVELS.
export function calcTotalFeatsAvailable(classLevels, race) {
  const charLevel = totalCharacterLevel(classLevels)
  let total = GENERAL_FEAT_LEVELS.filter(l => l <= charLevel).length
  if (race === 'human') total += 1

  for (const { classKey, levels } of classLevels) {
    const schedule = CLASS_BONUS_FEAT_LEVELS[classKey]
    if (schedule) total += schedule.filter(l => l <= levels).length
  }

  return total
}

// ─── Alignment requirement matching ──────────────────────────────────────────
// Alignment values are keys like 'lawfulgood', 'neutralevil', 'trueneutral'.
// Requirements can be a category ('evil', 'nongood') or an exact alignment.

const ALIGNMENT_REQ_LABELS = {
  evil: 'Evil',
  good: 'Good',
  nongood: 'Non-Good',
  nonevil: 'Non-Evil',
  lawful: 'Lawful',
  nonlawful: 'Non-Lawful',
  lawfulgood: 'Lawful Good',
  neutral: 'Neutral (at least one axis)',
  nonchaotic_nonevil: 'Non-Chaotic and Non-Evil',
}

export function alignmentMatches(alignment, req) {
  if (!alignment) return false
  switch (req) {
    case 'evil':      return alignment.endsWith('evil')
    case 'good':      return alignment.endsWith('good')
    case 'nongood':   return !alignment.endsWith('good')
    case 'nonevil':   return !alignment.endsWith('evil')
    case 'lawful':    return alignment.startsWith('lawful')
    case 'nonlawful': return !alignment.startsWith('lawful')
    case 'neutral':   return alignment.includes('neutral')
    case 'nonchaotic_nonevil':
      return !alignment.startsWith('chaotic') && !alignment.endsWith('evil')
    default:          return alignment === req
  }
}

// ─── Prestige class prerequisite check ───────────────────────────────────────

export function checkPrcPrereqs(classKey, character) {
  const cls = CLASSES[classKey]
  if (!cls || cls.type !== 'prestige') return { met: true, reasons: [] }

  const { abilities, classLevels, race, selectedFeats, alignment } = character
  const prereqs = cls.prereqs
  const reasons = []
  const takenFeatKeys = selectedFeats.map(f => f.featKey)
  const bab = calcBAB(classLevels)

  if (prereqs.race && !prereqs.race.includes(race)) {
    reasons.push(`Race must be: ${prereqs.race.join(' or ')}`)
  }

  if (prereqs.bab && bab < prereqs.bab) {
    reasons.push(`BAB +${prereqs.bab} required (have +${bab})`)
  }

  if (prereqs.feats) {
    for (const req of prereqs.feats) {
      if (!takenFeatKeys.includes(req)) {
        reasons.push(`Feat required: ${FEATS[req]?.name ?? req}`)
      }
    }
  }

  if (prereqs.skills) {
    for (const [sk, minRank] of Object.entries(prereqs.skills)) {
      const have = character.skills[sk] ?? 0
      if (have < minRank) {
        reasons.push(`${SKILLS[sk]?.name ?? sk}: ${minRank} ranks required (have ${have})`)
      }
    }
  }

  if (prereqs.spellcasting === 'arcane' && !hasArcaneSpellcasting(classLevels)) {
    reasons.push('Requires arcane spellcasting levels')
  }
  if (prereqs.spellcasting === 'divine' && !hasDivineSpellcasting(classLevels)) {
    reasons.push('Requires divine spellcasting levels')
  }

  if (prereqs.arcaneLevel) {
    const have = spellcastingLevel(classLevels, 'arcane')
    if (have < prereqs.arcaneLevel) {
      reasons.push(`Arcane spellcasting level ${prereqs.arcaneLevel} required (have ${have})`)
    }
  }
  if (prereqs.divineLevel) {
    const have = spellcastingLevel(classLevels, 'divine')
    if (have < prereqs.divineLevel) {
      reasons.push(`Divine spellcasting level ${prereqs.divineLevel} required (have ${have})`)
    }
  }

  if (prereqs.classLevels) {
    for (const [cls2, lvl] of Object.entries(prereqs.classLevels)) {
      const have = classLevelFor(classLevels, cls2)
      if (have < lvl) reasons.push(`${CLASSES[cls2]?.name ?? cls2} ${lvl} required`)
    }
  }

  if (prereqs.anyClassLevels) {
    const has = prereqs.anyClassLevels.some(c => classLevelFor(classLevels, c) > 0)
    if (!has) {
      const names = prereqs.anyClassLevels.map(c => CLASSES[c]?.name ?? c).join(' or ')
      reasons.push(`Requires at least one level of: ${names}`)
    }
  }

  if (prereqs.alignment && !alignmentMatches(alignment, prereqs.alignment)) {
    reasons.push(`Alignment must be ${ALIGNMENT_REQ_LABELS[prereqs.alignment] ?? prereqs.alignment}`)
  }

  return { met: reasons.length === 0, reasons }
}

// ─── Base-class alignment restriction (e.g. Paladin must be Lawful Good) ─────

export function checkClassAlignment(classKey, alignment) {
  const cls = CLASSES[classKey]
  if (!cls?.alignmentRestriction) return { met: true, reasons: [] }
  if (alignmentMatches(alignment, cls.alignmentRestriction)) return { met: true, reasons: [] }
  const label = ALIGNMENT_REQ_LABELS[cls.alignmentRestriction] ?? cls.alignmentRestriction
  return { met: false, reasons: [`Alignment must be ${label}`] }
}

// ─── Auldwyn's 3-class limit ──────────────────────────────────────────────────
// classLevels here is the aggregated [{classKey, levels}] form, so its length
// is the number of distinct classes already taken.

export function checkClassSlot(classKey, classLevels) {
  if (classLevels.some(cl => cl.classKey === classKey)) return { met: true, reasons: [] }
  if (classLevels.length >= SERVER_SETTINGS.maxDistinctClasses) {
    return { met: false, reasons: [`Auldwyn allows a maximum of ${SERVER_SETTINGS.maxDistinctClasses} classes per character`] }
  }
  return { met: true, reasons: [] }
}

// ─── Combined eligibility check for taking a level in a class ───────────────
// Used both by the Level Plan wizard (to gate/explain class choices) and by
// validatePlan (to catch a plan that became invalid after edits elsewhere).

export function checkClassEligibility(classKey, character) {
  const reasons = []
  const slot = checkClassSlot(classKey, character.classLevels)
  reasons.push(...slot.reasons)
  // Prestige classes already carry their alignment requirement in prereqs.alignment
  // (checked below) — only apply the standalone check to base classes, so the
  // same restriction isn't reported twice.
  if (CLASSES[classKey]?.type !== 'prestige') {
    const align = checkClassAlignment(classKey, character.alignment)
    reasons.push(...align.reasons)
  }
  const prc = checkPrcPrereqs(classKey, character)
  reasons.push(...prc.reasons)
  return { met: reasons.length === 0, reasons }
}

// ─── Level-by-level plan ──────────────────────────────────────────────────────
// character.levels is the source of truth: one entry per character level.
// { classKey, skills: {skillKey: ranksAddedThisLevel}, feats: [featKey], abilityIncrease: 'str'|null }
// Skill points may be pooled: unspent points carry forward (Auldwyn rule).

export function deriveClassLevels(levels) {
  // Aggregated [{classKey, levels}] in order of first appearance
  const order = []
  const counts = {}
  for (const lv of levels) {
    if (!(lv.classKey in counts)) { counts[lv.classKey] = 0; order.push(lv.classKey) }
    counts[lv.classKey]++
  }
  return order.map(k => ({ classKey: k, levels: counts[k] }))
}

export function deriveSkills(levels) {
  const totals = Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0]))
  for (const lv of levels) {
    for (const [k, r] of Object.entries(lv.skills ?? {})) totals[k] = (totals[k] ?? 0) + r
  }
  return totals
}

// Proficiency/class feats granted automatically the first time a class is
// taken (e.g. Fighter's weapon & armor proficiencies, Wizard's Scribe Scroll).
// These don't consume a feat slot and can't be removed by the player.
export function getFreeClassFeats(classKey) {
  return CLASSES[classKey]?.freeFeats ?? []
}

// Free class feats granted specifically at level index i (only on the level
// a class is first taken), for per-level display in the level-up wizard.
// Excludes any feat already granted by an earlier class the character has.
export function freeFeatsGrantedAtLevel(levels, i) {
  const lv = levels[i]
  if (!lv) return []
  const firstTaken = levels.findIndex(l => l.classKey === lv.classKey)
  if (firstTaken !== i) return []
  const already = new Set(deriveFeats(levels.slice(0, i)))
  return getFreeClassFeats(lv.classKey).filter(f => !already.has(f))
}

export function deriveFeats(levels) {
  const seenClass = new Set()
  const seenFeat = new Set()
  const auto = []
  for (const lv of levels) {
    if (seenClass.has(lv.classKey)) continue
    seenClass.add(lv.classKey)
    // Dedupe: two classes may both grant the same proficiency (e.g. Simple
    // Weapon Proficiency) — a character only has it once regardless of source.
    for (const f of getFreeClassFeats(lv.classKey)) {
      if (seenFeat.has(f)) continue
      seenFeat.add(f)
      auto.push(f)
    }
  }
  return [...auto, ...levels.flatMap(lv => lv.feats ?? [])]
}

// Spells known/in the spellbook per class, accumulated from the level plan.
// GATED behind SERVER_SETTINGS.spellSelectionEnabled — see spellSelection.js.
export function deriveSpells(levels) {
  const byClass = {}
  for (const lv of levels) {
    if (lv.spells?.length) {
      byClass[lv.classKey] = [...(byClass[lv.classKey] ?? []), ...lv.spells]
    }
    if (lv.spellSwaps?.length) {
      let list = byClass[lv.classKey] ?? []
      for (const { out, in: inKey } of lv.spellSwaps) {
        list = list.filter(k => k !== out)
        list.push(inKey)
      }
      byClass[lv.classKey] = list
    }
  }
  return byClass
}

// Whether `spellKey` can be added as a new pick at level index `i`.
// `intMod` is only used for wizards (drives the level-1 free-pick count).
export function canPickSpell(levels, i, spellKey, intMod) {
  const lv = levels[i]
  if (!lv || !needsSpellSelection(lv.classKey)) return false
  const classNum = levels.slice(0, i + 1).filter(l => l.classKey === lv.classKey).length
  const budget = spellPickBudget(lv.classKey, classNum, intMod)
  if (!budget) return false
  const chosen = lv.spells ?? []
  if (chosen.length >= budget.total) return false

  const baseKnown = deriveSpells(levels.slice(0, i))[lv.classKey] ?? []
  const known = applySwaps(baseKnown, lv.spellSwaps)
  if (known.includes(spellKey) || chosen.includes(spellKey)) return false

  const spellLevel = spellLevelForClass(lv.classKey, spellKey)
  if (spellLevel === null) return false
  if (spellLevel > maxSpellLevelAtClassLevel(lv.classKey, classNum)) return false
  if (lv.classKey === 'wizard' && classNum === 1 && spellLevel !== 1) return false

  if (budget.mode === 'perLevel') {
    const chosenAtThisLevel = chosen.filter(k => spellLevelForClass(lv.classKey, k) === spellLevel).length
    if (chosenAtThisLevel >= (budget.perLevel[spellLevel] ?? 0)) return false
  }
  return true
}

// Whether `outKey` (a currently known spell) can be swapped for `inKey` (a
// different spell of the same level) at level index `i`. Free — doesn't
// touch the level's new-spell-pick budget — unlimited swaps per level-up,
// so this only checks the swap itself, not any per-level count.
export function canSwapSpell(levels, i, outKey, inKey) {
  const lv = levels[i]
  if (!lv || !canSwapSpells(lv.classKey)) return false

  const baseKnown = deriveSpells(levels.slice(0, i))[lv.classKey] ?? []
  const known = applySwaps(baseKnown, lv.spellSwaps)
  if (!known.includes(outKey)) return false
  if (known.includes(inKey) || (lv.spells ?? []).includes(inKey)) return false

  const outLevel = spellLevelForClass(lv.classKey, outKey)
  const inLevel = spellLevelForClass(lv.classKey, inKey)
  if (outLevel === null || inLevel === null || outLevel !== inLevel) return false
  return true
}

export function deriveIncreases(levels) {
  const inc = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }
  for (const lv of levels) {
    if (lv.abilityIncrease) inc[lv.abilityIncrease]++
  }
  return inc
}

// Skill point cost of one level's allocations (cross-class ×2, judged by that level's class)
export function levelSkillCost(lv) {
  const cls = CLASSES[lv.classKey]
  return Object.entries(lv.skills ?? {}).reduce((sum, [k, r]) => {
    const isCS = cls?.classSkills.includes(k)
    return sum + (isCS ? r : r * 2)
  }, 0)
}

// Per-level skill point economy: earned, spent, and running pool.
// INT increases taken at or before a level count toward that level's points.
export function planLevelEconomics(character) {
  const levels = character.levels ?? []
  const racialMods = RACES[character.race]?.abilityMods ?? {}
  const isHuman = character.race === 'human'
  const baseInt = (character.abilities.int ?? 8) + (racialMods.int ?? 0)
  let pool = 0
  let intIncreases = 0
  return levels.map((lv, i) => {
    if (lv.abilityIncrease === 'int') intIncreases++
    const intMod = abilityMod(baseInt + intIncreases)
    const cls = CLASSES[lv.classKey]
    const perLevel = Math.max(1, (cls?.skillsPerLevel ?? 0) + intMod)
    const earned = i === 0
      ? perLevel * 4 + (isHuman ? 4 : 0)
      : perLevel + (isHuman ? 1 : 0)
    const spent = levelSkillCost(lv)
    pool += earned - spent
    return { earned, spent, pool }
  })
}

// Max total ranks a skill may have as of level index i (0-based),
// based on the class taken at that level. classOnly skills require
// the level's class to grant them at all.
export function maxRankAtLevel(skillKey, levels, i) {
  const lv = levels[i]
  const cls = CLASSES[lv?.classKey]
  const charLevel = i + 1
  const isCS = cls?.classSkills.includes(skillKey) ?? false
  if (!isCS && SKILLS[skillKey]?.classOnly) return 0
  return isCS ? charLevel + 3 : Math.floor((charLevel + 3) / 2)
}

// Cumulative ranks in a skill through level index i (inclusive)
export function ranksThroughLevel(skillKey, levels, i) {
  let total = 0
  for (let j = 0; j <= i && j < levels.length; j++) {
    total += levels[j].skills?.[skillKey] ?? 0
  }
  return total
}

// Feat slots granted at level index i — a general feat on the every-3-levels
// cadence, the human bonus feat at level 1, plus any class bonus feats granted
// at that class level (Ranger 35 grants two, hence a count rather than a flag).
export function featSlotsAtLevel(character, i) {
  const levels = character.levels ?? []
  const lv = levels[i]
  if (!lv) return 0
  const charLevel = i + 1
  let slots = 0
  if (GENERAL_FEAT_LEVELS.includes(charLevel)) slots++
  if (charLevel === 1 && character.race === 'human') slots++
  const classCount = levels.slice(0, i + 1).filter(l => l.classKey === lv.classKey).length
  slots += classBonusFeatsAt(lv.classKey, classCount)
  return slots
}

// If this level's class grants a restricted bonus feat (Ranger's Favored
// Enemy/Greater Spell Focus, Rogue's special bonus feats, Wizard's metamagic/
// spell feat list, etc.) and the player hasn't picked enough of them yet to
// cover the bonus-feat slots, returns the array of feat keys the REMAINING
// pick(s) must come from. Once every remaining slot is accounted for by a
// still-unmet bonus obligation, general (non-bonus) feats disappear from the
// available list — but nothing stops spending an earlier slot on a bonus-pool
// feat too, since the two slot types aren't otherwise distinguished.
// Returns null when the slots are unrestricted or already satisfied.
export function requiredBonusFeatPool(character, i) {
  const levels = character.levels ?? []
  const lv = levels[i]
  if (!lv) return null
  const charLevel = i + 1
  const classCount = levels.slice(0, i + 1).filter(l => l.classKey === lv.classKey).length
  const bonusSlots = classBonusFeatsAt(lv.classKey, classCount)
  if (bonusSlots === 0) return null
  const pool = classBonusFeatPool(lv.classKey, classCount)
  if (!pool) return null

  let generalSlots = 0
  if (GENERAL_FEAT_LEVELS.includes(charLevel)) generalSlots++
  if (charLevel === 1 && character.race === 'human') generalSlots++

  const chosen = lv.feats ?? []
  const bonusPicked = chosen.filter(k => pool.includes(k)).length
  const totalSlots = generalSlots + bonusSlots
  const slotsLeft = totalSlots - chosen.length
  const bonusObligationRemaining = Math.max(0, bonusSlots - bonusPicked)

  if (slotsLeft > 0 && bonusObligationRemaining >= slotsLeft) return pool
  return null
}

// Snapshot of the character as it exists through level index i (inclusive),
// shaped like a regular character so checkFeatPrereqs / checkPrcPrereqs work on it.
export function characterAtLevel(character, i) {
  const levels = (character.levels ?? []).slice(0, i + 1)
  return {
    ...character,
    classLevels: deriveClassLevels(levels),
    skills: deriveSkills(levels),
    selectedFeats: deriveFeats(levels).map(featKey => ({ featKey })),
    abilityIncreases: deriveIncreases(levels),
  }
}

// Validate the whole plan: pools never negative, rank caps respected at every
// level, feat slots not exceeded, PrC prereqs met at the level taken.
export function validatePlan(character) {
  const errors = []
  const levels = character.levels ?? []
  if (levels.length === 0) return errors

  const econ = planLevelEconomics(character)
  econ.forEach((e, i) => {
    if (e.pool < 0) errors.push(`Level ${i + 1}: skill points overspent (pool is ${e.pool}).`)
  })

  levels.forEach((lv, i) => {
    for (const [k, r] of Object.entries(lv.skills ?? {})) {
      if (r <= 0) continue
      const cum = ranksThroughLevel(k, levels, i)
      const cap = maxRankAtLevel(k, levels, i)
      if (cum > cap) errors.push(`Level ${i + 1}: ${SKILLS[k]?.name ?? k} exceeds max rank ${cap} (${cum}).`)
    }
    const slots = featSlotsAtLevel(character, i)
    const chosen = (lv.feats ?? []).length
    if (chosen > slots) errors.push(`Level ${i + 1}: ${chosen} feats chosen but only ${slots} slot(s).`)
    if (lv.abilityIncrease && (i + 1) % 4 !== 0) {
      errors.push(`Level ${i + 1}: ability increase not allowed at this level.`)
    }
    // Class entry check (alignment restriction, 3-class limit, PrC prereqs)
    // against the character as it was before this level
    const firstTaken = levels.findIndex(l => l.classKey === lv.classKey)
    if (firstTaken === i) {
      const snapshot = i === 0
        ? { ...character, classLevels: [], skills: deriveSkills([]), selectedFeats: [], abilityIncreases: deriveIncreases([]) }
        : characterAtLevel(character, i - 1)
      const check = checkClassEligibility(lv.classKey, snapshot)
      if (!check.met) {
        check.reasons.forEach(r => errors.push(`Level ${i + 1} (${CLASSES[lv.classKey].name}): ${r}`))
      }
    }
  })

  return errors
}

// ─── Full character validation ────────────────────────────────────────────────

export function validateCharacter(character) {
  const errors = []
  const warnings = []

  const charLevel = totalCharacterLevel(character.classLevels)

  if (!character.name.trim()) errors.push('Character name is required.')
  if (!character.race) errors.push('Race must be selected.')
  if (!character.alignment) errors.push('Alignment must be selected.')
  if (charLevel === 0) errors.push('At least one class level is required.')
  if (charLevel > SERVER_SETTINGS.maxLevel) {
    errors.push(`Total level exceeds server max of ${SERVER_SETTINGS.maxLevel}.`)
  }

  // Ability point budget
  const spent = totalPointsSpent(character.abilities)
  if (spent > ABILITY_POINT_BUDGET) errors.push(`Ability points over budget (${spent}/${ABILITY_POINT_BUDGET}).`)

  // Minimum ability scores
  for (const [key, val] of Object.entries(character.abilities)) {
    if (val < 3) errors.push(`${key.toUpperCase()} cannot be below 3.`)
    if (val > 18) errors.push(`${key.toUpperCase()} cannot exceed 18 before racial modifiers.`)
  }

  // Totals-based skill/feat budget checks — superseded by validatePlan
  // when a level plan exists (the plan accounting is more precise)
  if (!(character.levels?.length > 0)) {
    for (const [sk, rank] of Object.entries(character.skills)) {
      const max = maxRankForSkill(sk, character.classLevels)
      if (rank > max) errors.push(`${SKILLS[sk]?.name ?? sk}: rank ${rank} exceeds max of ${max}.`)
    }

    const intMod = abilityMod(character.abilities.int)
    const isHuman = character.race === 'human'
    const skillBudget = calcTotalSkillPoints(character.classLevels, intMod, isHuman)
    const skillSpent = calcSkillPointsSpent(character.skills, character.classLevels)
    if (skillSpent > skillBudget) errors.push(`Skill points over budget (${skillSpent}/${skillBudget}).`)

    const featBudget = calcTotalFeatsAvailable(character.classLevels, character.race)
    if (character.selectedFeats.length > featBudget) {
      errors.push(`Too many feats selected (${character.selectedFeats.length}/${featBudget}).`)
    }
  }

  // Level plan checks (pools, rank caps, feat slots, PrC entry timing)
  if (character.levels?.length > 0) {
    validatePlan(character).forEach(e => errors.push(e))
  } else {
    // Legacy totals-based PrC check for characters without a plan
    for (const { classKey } of character.classLevels) {
      if (CLASSES[classKey]?.type === 'prestige') {
        const result = checkPrcPrereqs(classKey, character)
        if (!result.met) {
          result.reasons.forEach(r => errors.push(`${CLASSES[classKey].name}: ${r}`))
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
