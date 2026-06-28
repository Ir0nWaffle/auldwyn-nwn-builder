import { useState } from 'react'
import { useCharacter } from '../../store/CharacterContext.jsx'
import { CLASSES } from '../../data/classes.js'
import { SKILLS } from '../../data/skills.js'
import { abilityMod, calcTotalSkillPoints, calcSkillPointsSpent, maxRankForSkill } from '../../utils/validation.js'

const ABILITY_ABBR = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

export default function SkillStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const [search, setSearch] = useState('')
  const [showClassOnly, setShowClassOnly] = useState(false)

  const intMod = abilityMod(character.abilities.int)
  const isHuman = character.race === 'human'
  const totalPoints = calcTotalSkillPoints(character.classLevels, intMod, isHuman)
  const spentPoints = calcSkillPointsSpent(character.skills)
  const remaining = totalPoints - spentPoints

  // Which skills are class skills for at least one taken class
  function isClassSkillForChar(skillKey) {
    return character.classLevels.some(cl => CLASSES[cl.classKey]?.classSkills.includes(skillKey))
  }

  function setRank(skillKey, value) {
    const max = maxRankForSkill(skillKey, character.classLevels)
    const clamped = Math.max(0, Math.min(value, max))
    // Cross-class costs 2 pts per rank
    const isCS = isClassSkillForChar(skillKey)
    const currentRank = character.skills[skillKey]
    const delta = clamped - currentRank
    const cost = isCS ? delta : delta * 2
    if (cost > remaining && delta > 0) return
    dispatch({ type: 'SET_SKILL', skill: skillKey, value: clamped })
  }

  function resetAll() {
    const reset = Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0]))
    dispatch({ type: 'SET_SKILLS', payload: reset })
  }

  const filteredSkills = Object.entries(SKILLS).filter(([key, skill]) => {
    if (search && !skill.name.toLowerCase().includes(search.toLowerCase())) return false
    if (showClassOnly && !isClassSkillForChar(key)) return false
    return true
  })

  return (
    <div>
      <h2 className="step-title">Skills</h2>
      <p className="step-sub">
        Allocate skill ranks. Class skills cost 1 point per rank; cross-class skills cost 2.
        Max rank = character level + 3 (half for cross-class).
      </p>

      {/* Budget bar */}
      <div className="panel mb-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-auldwyn-muted text-sm">Skill points remaining: </span>
          <span className={`text-xl font-bold ${remaining < 0 ? 'text-red-400' : 'text-auldwyn-gold'}`}>
            {remaining}
          </span>
          <span className="text-auldwyn-muted text-sm"> / {totalPoints}</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm py-1" onClick={resetAll}>Reset</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search skills…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-auldwyn-dark border border-auldwyn-border rounded px-3 py-1.5 text-sm
                     text-auldwyn-text focus:outline-none focus:border-auldwyn-gold flex-1 min-w-40"
        />
        <label className="flex items-center gap-2 text-sm text-auldwyn-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showClassOnly}
            onChange={e => setShowClassOnly(e.target.checked)}
            className="accent-auldwyn-gold"
          />
          Class skills only
        </label>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-3 text-xs">
        <span><span className="text-auldwyn-gold">●</span> Class skill (1pt/rank)</span>
        <span><span className="text-auldwyn-muted">●</span> Cross-class skill (2pt/rank)</span>
      </div>

      <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
        {filteredSkills.map(([key, skill]) => {
          const isCS = isClassSkillForChar(key)
          const rank = character.skills[key]
          const maxRank = maxRankForSkill(key, character.classLevels)
          const abilScore = character.abilities[skill.ability]
          const totalBonus = rank + abilityMod(abilScore)
          const canIncrease = rank < maxRank && (isCS ? remaining >= 1 : remaining >= 2)
          const canDecrease = rank > 0

          return (
            <div
              key={key}
              className={`flex items-center gap-2 px-3 py-2 rounded border transition-all ${
                rank > 0
                  ? 'border-auldwyn-gold/40 bg-auldwyn-gold/5'
                  : 'border-auldwyn-border/50'
              }`}
            >
              <span className={`text-xs ${isCS ? 'text-auldwyn-gold' : 'text-auldwyn-muted'}`}>●</span>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{skill.name}</span>
                <span className="text-xs text-auldwyn-muted ml-2">{ABILITY_ABBR[skill.ability]}</span>
                {!isCS && <span className="text-xs text-auldwyn-muted ml-1">(cross-class)</span>}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setRank(key, rank - 1)}
                  disabled={!canDecrease}
                  className="w-6 h-6 rounded border border-auldwyn-border text-auldwyn-muted text-sm
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             flex items-center justify-center"
                >−</button>
                <span className="w-8 text-center font-mono text-sm text-auldwyn-text">{rank}</span>
                <button
                  onClick={() => setRank(key, rank + 1)}
                  disabled={!canIncrease}
                  className="w-6 h-6 rounded border border-auldwyn-border text-auldwyn-muted text-sm
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             flex items-center justify-center"
                >+</button>
              </div>

              <span className="text-xs text-auldwyn-muted w-10 text-center">/{maxRank}</span>

              <span className={`w-10 text-right font-mono text-sm font-bold ${
                totalBonus >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {totalBonus >= 0 ? '+' : ''}{totalBonus}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext}>
          Next: Feats →
        </button>
      </div>
    </div>
  )
}
