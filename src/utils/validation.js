import { CLASSES, SERVER_SETTINGS } from '../data/classes.js'
import { FEATS } from '../data/feats.js'
import { SKILLS, maxClassRanks, maxCrossClassRanks } from '../data/skills.js'

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

export function calcSkillPointsSpent(skills) {
  return Object.values(skills).reduce((sum, r) => sum + r, 0)
}

// ─── Max skill rank for a given skill given the character's class mix ─────────
export function maxRankForSkill(skillKey, classLevels) {
  const charLevel = totalCharacterLevel(classLevels)
  const isClassSkillForAny = classLevels.some(cl =>
    CLASSES[cl.classKey]?.classSkills.includes(skillKey)
  )
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

  if (prereqs.bab && bab < prereqs.bab) reasons.push(`BAB +${prereqs.bab} required (have +${bab})`)
  if (prereqs.str && abilities.str < prereqs.str) reasons.push(`STR ${prereqs.str} required`)
  if (prereqs.dex && abilities.dex < prereqs.dex) reasons.push(`DEX ${prereqs.dex} required`)
  if (prereqs.int && abilities.int < prereqs.int) reasons.push(`INT ${prereqs.int} required`)
  if (prereqs.wis && abilities.wis < prereqs.wis) reasons.push(`WIS ${prereqs.wis} required`)
  if (prereqs.con && abilities.con < prereqs.con) reasons.push(`CON ${prereqs.con} required`)
  if (prereqs.cha && abilities.cha < prereqs.cha) reasons.push(`CHA ${prereqs.cha} required`)

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

  if (prereqs.classLevels) {
    for (const [cls2, lvl] of Object.entries(prereqs.classLevels)) {
      const have = classLevelFor(classLevels, cls2)
      if (have < lvl) reasons.push(`${CLASSES[cls2]?.name ?? cls2} ${lvl} required`)
    }
  }

  if (prereqs.alignment) {
    if (alignment !== prereqs.alignment) {
      reasons.push(`Alignment must be ${prereqs.alignment}`)
    }
  }

  return { met: reasons.length === 0, reasons }
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

  // Skill rank caps
  for (const [sk, rank] of Object.entries(character.skills)) {
    const max = maxRankForSkill(sk, character.classLevels)
    if (rank > max) errors.push(`${SKILLS[sk]?.name ?? sk}: rank ${rank} exceeds max of ${max}.`)
  }

  // Skill points budget
  const intMod = abilityMod(character.abilities.int)
  const isHuman = character.race === 'human'
  const skillBudget = calcTotalSkillPoints(character.classLevels, intMod, isHuman)
  const skillSpent = calcSkillPointsSpent(character.skills)
  if (skillSpent > skillBudget) errors.push(`Skill points over budget (${skillSpent}/${skillBudget}).`)

  // Feat count
  const featBudget = calcTotalFeatsAvailable(character.classLevels, character.race)
  if (character.selectedFeats.length > featBudget) {
    errors.push(`Too many feats selected (${character.selectedFeats.length}/${featBudget}).`)
  }

  // Prestige class prereqs for any PrC taken
  for (const { classKey } of character.classLevels) {
    if (CLASSES[classKey]?.type === 'prestige') {
      const result = checkPrcPrereqs(classKey, character)
      if (!result.met) {
        result.reasons.forEach(r => errors.push(`${CLASSES[classKey].name}: ${r}`))
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
