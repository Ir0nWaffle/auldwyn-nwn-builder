import { CLASSES, SERVER_SETTINGS } from '../data/classes.js'
import { FEATS } from '../data/feats.js'
import { SKILLS, maxClassRanks, maxCrossClassRanks } from '../data/skills.js'
import { RACES } from '../data/races.js'

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
  const feat = FEATS[featKey]
  if (!feat) return { met: false, reasons: ['Unknown feat'] }

  const { abilities, classLevels, race, selectedFeats } = character
  const prereqs = feat.prereqs
  const reasons = []
  const takenFeatKeys = selectedFeats.map(f => f.featKey)
  const bab = calcBAB(classLevels)

  // Prereqs check against final scores: point-buy + racial mods + level-up increases
  const racialMods = RACES[race]?.abilityMods ?? {}
  const increases = character.abilityIncreases ?? {}
  const eff = k => effectiveScore(k, abilities, racialMods, increases)

  if (prereqs.bab && bab < prereqs.bab) reasons.push(`BAB +${prereqs.bab} required (have +${bab})`)
  for (const k of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
    if (prereqs[k] && eff(k) < prereqs[k]) {
      reasons.push(`${k.toUpperCase()} ${prereqs[k]} required (have ${eff(k)})`)
    }
  }

  if (prereqs.spellcasting && !hasSpellcasting(classLevels))
    reasons.push('Requires spellcasting levels')

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

// Total general feats available for the build
export function calcTotalFeatsAvailable(classLevels, race) {
  const charLevel = totalCharacterLevel(classLevels)
  const isHuman = race === 'human'
  let total = 0
  // General feat at levels 1, 3, 6, 9, 12, 15, 18
  const generalFeatLevels = [1, 3, 6, 9, 12, 15, 18]
  total += generalFeatLevels.filter(l => l <= charLevel).length
  if (isHuman) total += 1

  // Fighter bonus feats
  const fl = classLevelFor(classLevels, 'fighter')
  if (fl > 0) {
    const bonusFeatLevels = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
    total += bonusFeatLevels.filter(l => l <= fl).length
  }

  // Wizard bonus feats
  const wl = classLevelFor(classLevels, 'wizard')
  if (wl > 0) {
    const wzBonusFeatLevels = [5, 10, 15, 20]
    total += wzBonusFeatLevels.filter(l => l <= wl).length
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

// Feat slots granted at level index i
const GENERAL_FEAT_LEVELS = [1, 3, 6, 9, 12, 15, 18]
const FIGHTER_BONUS_LEVELS = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
const WIZARD_BONUS_LEVELS = [5, 10, 15, 20]

export function featSlotsAtLevel(character, i) {
  const levels = character.levels ?? []
  const lv = levels[i]
  if (!lv) return 0
  const charLevel = i + 1
  let slots = 0
  if (GENERAL_FEAT_LEVELS.includes(charLevel)) slots++
  if (charLevel === 1 && character.race === 'human') slots++
  const classCount = levels.slice(0, i + 1).filter(l => l.classKey === lv.classKey).length
  if (lv.classKey === 'fighter' && FIGHTER_BONUS_LEVELS.includes(classCount)) slots++
  if (lv.classKey === 'wizard' && WIZARD_BONUS_LEVELS.includes(classCount)) slots++
  return slots
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
