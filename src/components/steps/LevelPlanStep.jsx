import { useState } from 'react'
import { useCharacter } from '../../store/CharacterContext.jsx'
import { CLASSES, SERVER_SETTINGS } from '../../data/classes.js'
import { SKILLS } from '../../data/skills.js'
import { FEATS } from '../../data/feats.js'
import {
  planLevelEconomics, featSlotsAtLevel, characterAtLevel, deriveFeats,
  maxRankAtLevel, ranksThroughLevel, checkPrcPrereqs, checkFeatPrereqs,
} from '../../utils/validation.js'

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const ALLOWED_CLASSES = Object.entries(CLASSES)
  .filter(([key]) => SERVER_SETTINGS.allowedClasses.includes(key))

export default function LevelPlanStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const levels = character.levels
  const [expanded, setExpanded] = useState(levels.length > 0 ? levels.length - 1 : null)
  const [pendingClass, setPendingClass] = useState('')
  const [featSearch, setFeatSearch] = useState('')

  const econ = planLevelEconomics(character)
  const charLevel = levels.length
  const atCap = charLevel >= SERVER_SETTINGS.maxLevel

  // Suffix minimum of the pool: spending at level i drains every later pool too
  const suffixMinPool = new Array(charLevel)
  for (let i = charLevel - 1; i >= 0; i--) {
    suffixMinPool[i] = i === charLevel - 1 ? econ[i].pool : Math.min(econ[i].pool, suffixMinPool[i + 1])
  }

  const allPlannedFeats = deriveFeats(levels)

  // ── Add level ──
  const snapshotNow = charLevel === 0
    ? { ...character, classLevels: [], skills: {}, selectedFeats: [], abilityIncreases: {} }
    : characterAtLevel(character, charLevel - 1)
  const pendingPrcCheck = pendingClass && CLASSES[pendingClass]?.type === 'prestige'
    ? checkPrcPrereqs(pendingClass, snapshotNow)
    : null
  const pendingMaxed = pendingClass && CLASSES[pendingClass]?.maxLevel
    ? levels.filter(l => l.classKey === pendingClass).length >= CLASSES[pendingClass].maxLevel
    : false
  const canAdd = pendingClass && !atCap && !pendingMaxed && (pendingPrcCheck === null || pendingPrcCheck.met)

  function addLevel() {
    if (!canAdd) return
    dispatch({ type: 'ADD_LEVEL', classKey: pendingClass })
    setExpanded(charLevel) // new level's index
  }

  function truncateFrom(index) {
    dispatch({ type: 'TRUNCATE_LEVELS', index })
    setExpanded(index > 0 ? index - 1 : null)
  }

  // ── Skill helpers (per level) ──
  function skillCost(i, skillKey) {
    return CLASSES[levels[i].classKey]?.classSkills.includes(skillKey) ? 1 : 2
  }

  function canAddRank(i, skillKey) {
    const cost = skillCost(i, skillKey)
    if (suffixMinPool[i] < cost) return false
    for (let j = i; j < charLevel; j++) {
      if (ranksThroughLevel(skillKey, levels, j) + 1 > maxRankAtLevel(skillKey, levels, j)) return false
    }
    return true
  }

  function changeRank(i, skillKey, delta) {
    const current = levels[i].skills?.[skillKey] ?? 0
    if (delta > 0 && !canAddRank(i, skillKey)) return
    if (delta < 0 && current <= 0) return
    dispatch({ type: 'SET_LEVEL_SKILL', index: i, skill: skillKey, value: current + delta })
  }

  // ── Render one expanded level body ──
  function LevelBody({ i }) {
    const lv = levels[i]
    const cls = CLASSES[lv.classKey]
    const lvCharLevel = i + 1
    const slots = featSlotsAtLevel(character, i)
    const chosen = lv.feats ?? []
    const slotsLeft = slots - chosen.length
    const hasIncrease = lvCharLevel % 4 === 0
    const snapshot = characterAtLevel(character, i)

    // Skills investable at this level: class skills first, then cross-class (non-locked)
    const skillRows = Object.entries(SKILLS)
      .map(([key, skill]) => ({
        key, skill,
        isCS: cls?.classSkills.includes(key) ?? false,
        locked: maxRankAtLevel(key, levels, i) === 0,
      }))
      .filter(r => !r.locked)
      .sort((a, b) => (a.isCS === b.isCS ? a.skill.name.localeCompare(b.skill.name) : a.isCS ? -1 : 1))

    const eligibleFeats = slotsLeft > 0
      ? Object.entries(FEATS).filter(([key, feat]) => {
          if (allPlannedFeats.includes(key)) return false
          if (featSearch && !feat.name.toLowerCase().includes(featSearch.toLowerCase())) return false
          return checkFeatPrereqs(key, snapshot).met
        })
      : []

    return (
      <div className="border-t border-auldwyn-border/40 mt-2 pt-3 space-y-4">
        {/* Ability increase */}
        {hasIncrease && (
          <div>
            <p className="text-xs font-bold text-auldwyn-gold mb-1.5">Ability Increase (+1)</p>
            <div className="flex gap-1.5 flex-wrap">
              {ABILITY_KEYS.map(k => (
                <button
                  key={k}
                  onClick={() => dispatch({ type: 'SET_LEVEL_INCREASE', index: i, ability: lv.abilityIncrease === k ? null : k })}
                  className={`px-3 py-1 rounded border text-xs font-mono uppercase transition-all ${
                    lv.abilityIncrease === k
                      ? 'bg-auldwyn-gold text-auldwyn-dark border-auldwyn-gold font-bold'
                      : 'border-auldwyn-border text-auldwyn-muted hover:border-auldwyn-gold'
                  }`}
                >
                  {k} +1
                </button>
              ))}
            </div>
            {!lv.abilityIncrease && (
              <p className="text-xs text-yellow-500/70 mt-1">Choose which ability gains +1 at this level.</p>
            )}
          </div>
        )}

        {/* Feats */}
        {slots > 0 && (
          <div>
            <p className="text-xs font-bold text-auldwyn-gold mb-1.5">
              Feats — {chosen.length}/{slots} chosen
            </p>
            {chosen.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {chosen.map(f => (
                  <button
                    key={f}
                    onClick={() => dispatch({ type: 'REMOVE_LEVEL_FEAT', index: i, featKey: f })}
                    className="badge badge-gold text-xs hover:bg-red-900/30 hover:border-red-700 hover:text-red-400"
                    title="Click to remove"
                  >
                    {FEATS[f]?.name} ✕
                  </button>
                ))}
              </div>
            )}
            {slotsLeft > 0 && (
              <>
                <input
                  type="text"
                  placeholder="Search available feats…"
                  value={featSearch}
                  onChange={e => setFeatSearch(e.target.value)}
                  className="bg-auldwyn-dark border border-auldwyn-border rounded px-2 py-1 text-xs
                             text-auldwyn-text focus:outline-none focus:border-auldwyn-gold w-full mb-1.5"
                />
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {eligibleFeats.map(([key, feat]) => (
                    <button
                      key={key}
                      onClick={() => dispatch({ type: 'ADD_LEVEL_FEAT', index: i, featKey: key })}
                      className="w-full text-left px-2 py-1 rounded border border-auldwyn-border/50
                                 hover:border-auldwyn-gold text-xs transition-all"
                    >
                      <span className="text-auldwyn-text font-medium">{feat.name}</span>
                      <span className="text-auldwyn-muted ml-2">{feat.description}</span>
                    </button>
                  ))}
                  {eligibleFeats.length === 0 && (
                    <p className="text-xs text-auldwyn-muted">No eligible feats match.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Skills */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold text-auldwyn-gold">Skills</p>
            <p className="text-xs font-mono text-auldwyn-muted">
              Earned <span className="text-auldwyn-text">{econ[i].earned}</span> ·
              Spent <span className="text-auldwyn-text">{econ[i].spent}</span> ·
              Pool after: <span className={econ[i].pool < 0 ? 'text-red-400 font-bold' : 'text-auldwyn-gold font-bold'}>{econ[i].pool}</span>
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {skillRows.map(({ key, skill, isCS }) => {
              const added = lv.skills?.[key] ?? 0
              const total = ranksThroughLevel(key, levels, i)
              const cap = maxRankAtLevel(key, levels, i)
              return (
                <div key={key} className={`flex items-center gap-2 px-2 py-1 rounded border text-xs ${
                  added > 0 ? 'border-auldwyn-gold/40 bg-auldwyn-gold/5' : 'border-auldwyn-border/40'
                }`}>
                  <span className={isCS ? 'text-auldwyn-gold' : 'text-auldwyn-muted'}>●</span>
                  <span className="flex-1 min-w-0 truncate">{skill.name}</span>
                  <span className="text-auldwyn-muted/70 font-mono">{isCS ? '1pt' : '2pt'}</span>
                  <button
                    onClick={() => changeRank(i, key, -1)}
                    disabled={added <= 0}
                    className="w-5 h-5 rounded border border-auldwyn-border text-auldwyn-muted
                               hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                               flex items-center justify-center"
                  >−</button>
                  <span className="w-6 text-center font-mono text-auldwyn-text">{added > 0 ? `+${added}` : '·'}</span>
                  <button
                    onClick={() => changeRank(i, key, 1)}
                    disabled={!canAddRank(i, key)}
                    className="w-5 h-5 rounded border border-auldwyn-border text-auldwyn-muted
                               hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                               flex items-center justify-center"
                  >+</button>
                  <span className="w-12 text-right font-mono text-auldwyn-muted">{total}/{cap}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="step-title">Level Plan</h2>
      <p className="step-sub">
        Build your character level by level. Unspent skill points pool and carry forward
        (Auldwyn rule). Feats and +1 ability picks happen at the levels that grant them.
      </p>

      {/* Status bar */}
      <div className="panel mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-auldwyn-muted text-sm">Character level: </span>
          <span className="text-xl font-bold text-auldwyn-gold">{charLevel}</span>
          <span className="text-auldwyn-muted text-sm"> / {SERVER_SETTINGS.maxLevel}</span>
        </div>
        {charLevel > 0 && (
          <div className="text-sm text-auldwyn-muted">
            Skill pool: <span className={`font-bold font-mono ${econ[charLevel - 1].pool < 0 ? 'text-red-400' : 'text-auldwyn-gold'}`}>
              {econ[charLevel - 1].pool}
            </span> pts banked
          </div>
        )}
      </div>

      {/* Add level */}
      {!atCap && (
        <div className="panel mb-4">
          <p className="text-xs font-bold text-auldwyn-gold mb-2">Add Level {charLevel + 1}</p>
          <div className="flex flex-wrap gap-2 items-start">
            <select
              value={pendingClass}
              onChange={e => setPendingClass(e.target.value)}
              className="bg-auldwyn-dark border border-auldwyn-border rounded px-3 py-1.5 text-sm
                         text-auldwyn-text focus:outline-none focus:border-auldwyn-gold"
            >
              <option value="">— Choose a class —</option>
              <optgroup label="Base Classes">
                {ALLOWED_CLASSES.filter(([, c]) => c.type === 'base').map(([key, c]) => (
                  <option key={key} value={key}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Prestige Classes">
                {ALLOWED_CLASSES.filter(([, c]) => c.type === 'prestige').map(([key, c]) => (
                  <option key={key} value={key}>{c.name}</option>
                ))}
              </optgroup>
            </select>
            <button className="btn-primary text-sm py-1.5" disabled={!canAdd} onClick={addLevel}>
              + Add Level
            </button>
          </div>
          {pendingPrcCheck && !pendingPrcCheck.met && (
            <div className="text-xs text-red-400/80 mt-2 p-1.5 rounded border border-auldwyn-red/40">
              <span className="font-bold">✗ Not yet eligible:</span>
              <ul className="mt-1 space-y-0.5">
                {pendingPrcCheck.reasons.map(r => <li key={r}>• {r}</li>)}
              </ul>
            </div>
          )}
          {pendingMaxed && (
            <p className="text-xs text-red-400/80 mt-2">
              {CLASSES[pendingClass]?.name} is at its maximum of {CLASSES[pendingClass]?.maxLevel} levels.
            </p>
          )}
        </div>
      )}

      {/* Level cards */}
      <div className="space-y-2">
        {levels.map((lv, i) => {
          const cls = CLASSES[lv.classKey]
          const classNum = levels.slice(0, i + 1).filter(l => l.classKey === lv.classKey).length
          const isOpen = expanded === i
          const slots = featSlotsAtLevel(character, i)
          const hasIncrease = (i + 1) % 4 === 0
          const incomplete =
            (slots > (lv.feats?.length ?? 0)) || (hasIncrease && !lv.abilityIncrease)

          return (
            <div key={i} className={`panel ${isOpen ? 'border-auldwyn-gold/50' : ''}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="w-8 h-8 rounded-full border border-auldwyn-gold/50 text-auldwyn-gold
                                   flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-bold text-auldwyn-text">{cls?.name} {classNum}</span>
                  <span className="flex gap-1.5 flex-wrap">
                    {slots > 0 && (
                      <span className={`badge text-xs ${(lv.feats?.length ?? 0) >= slots ? 'badge-gold' : 'border-yellow-700 text-yellow-500'}`}>
                        Feats {(lv.feats?.length ?? 0)}/{slots}
                      </span>
                    )}
                    {hasIncrease && (
                      <span className={`badge text-xs ${lv.abilityIncrease ? 'badge-gold' : 'border-yellow-700 text-yellow-500'}`}>
                        {lv.abilityIncrease ? `+1 ${lv.abilityIncrease.toUpperCase()}` : '+1 ability?'}
                      </span>
                    )}
                    {econ[i].spent > 0 && (
                      <span className="badge text-xs border-auldwyn-border text-auldwyn-muted">
                        {econ[i].spent} skill pts
                      </span>
                    )}
                    {incomplete && !isOpen && <span className="text-yellow-500 text-xs">⚠</span>}
                  </span>
                </button>
                <span className="text-xs text-auldwyn-muted font-mono shrink-0">pool {econ[i].pool}</span>
                <button
                  onClick={() => truncateFrom(i)}
                  title={i === charLevel - 1 ? 'Remove this level' : 'Remove this level and all levels after it'}
                  className="w-6 h-6 rounded border border-auldwyn-border text-auldwyn-muted text-xs
                             hover:border-red-600 hover:text-red-400 shrink-0
                             flex items-center justify-center"
                >✕</button>
              </div>
              {isOpen && <LevelBody i={i} />}
            </div>
          )
        })}
        {charLevel === 0 && (
          <p className="text-auldwyn-muted text-sm text-center py-6">
            No levels planned yet — choose a class above to add Level 1.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" disabled={charLevel === 0} onClick={onNext}>
          View Summary →
        </button>
      </div>
    </div>
  )
}
