import { useState } from 'react'
import { useCharacter } from '../../store/CharacterContext.jsx'
import { CLASSES, SERVER_SETTINGS } from '../../data/classes.js'
import { SKILLS } from '../../data/skills.js'
import { FEATS } from '../../data/feats.js'
import { RACES } from '../../data/races.js'
import {
  planLevelEconomics, featSlotsAtLevel, characterAtLevel, deriveFeats,
  maxRankAtLevel, ranksThroughLevel, checkClassEligibility, checkFeatPrereqs,
  abilityMod, effectiveScore, deriveIncreases, calcBAB, deriveClassLevels,
  freeFeatsGrantedAtLevel,
} from '../../utils/validation.js'
import { CLASS_ICONS, SKILL_ICONS, FEAT_ICONS } from '../../data/icons.js'
import IconSlot from '../IconSlot.jsx'

const ABILITY_LABELS = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
}
const ALLOWED_CLASSES = Object.entries(CLASSES)
  .filter(([key]) => SERVER_SETTINGS.allowedClasses.includes(key))
const BASE = ALLOWED_CLASSES.filter(([, c]) => c.type === 'base')
const PRESTIGE = ALLOWED_CLASSES.filter(([, c]) => c.type === 'prestige')

const BAB_LABELS = { full: 'High', medium: 'Medium', half: 'Low' }

// Sub-steps of one level-up, in the same order as the NWN level-up wizard
function subStepsFor(character, i) {
  const steps = []
  if ((i + 1) % 4 === 0) steps.push('ability')
  steps.push('skills')
  if (featSlotsAtLevel(character, i) > 0) steps.push('feats')
  steps.push('confirm')
  return steps
}

export default function LevelPlanStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const levels = character.levels
  const charLevel = levels.length
  const atCap = charLevel >= SERVER_SETTINGS.maxLevel

  // mode: 'overview' | 'class' (picking a class) | one of the sub-steps
  const [mode, setMode] = useState('overview')
  const [selClass, setSelClass] = useState(null)
  const [featSearch, setFeatSearch] = useState('')

  const econ = planLevelEconomics(character)
  const i = charLevel - 1 // index of the level being built while in a sub-step

  // ── Level-up flow control ──
  function beginLevelUp() {
    setSelClass(null)
    setMode('class')
  }

  function confirmClass() {
    if (!canTake(selClass)) return
    dispatch({ type: 'ADD_LEVEL', classKey: selClass })
    // levels.length is stale here; the new level's index is charLevel
    const nextSteps = subStepsFor(
      { ...character, levels: [...levels, { classKey: selClass, skills: {}, feats: [], abilityIncrease: null }] },
      charLevel
    )
    setFeatSearch('')
    setMode(nextSteps[0])
  }

  function cancelLevel() {
    dispatch({ type: 'TRUNCATE_LEVELS', index: i })
    setMode('overview')
  }

  const steps = charLevel > 0 ? subStepsFor(character, i) : []
  const stepIdx = steps.indexOf(mode)

  function nextSub() {
    if (stepIdx < steps.length - 1) setMode(steps[stepIdx + 1])
  }
  function prevSub() {
    if (stepIdx > 0) setMode(steps[stepIdx - 1])
  }
  function finishLevel() {
    setMode('overview')
  }

  // ── Class eligibility ──
  const snapshotNow = charLevel === 0
    ? { ...character, classLevels: [], skills: {}, selectedFeats: [], abilityIncreases: {} }
    : characterAtLevel(character, charLevel - 1)

  function classCheck(key) {
    return checkClassEligibility(key, snapshotNow)
  }
  function classMaxed(key) {
    const cls = CLASSES[key]
    return cls.maxLevel ? levels.filter(l => l.classKey === key).length >= cls.maxLevel : false
  }
  function canTake(key) {
    return key && !classMaxed(key) && classCheck(key).met
  }

  // ── Skill helpers (operate on level i) ──
  const suffixMinPool = new Array(charLevel)
  for (let j = charLevel - 1; j >= 0; j--) {
    suffixMinPool[j] = j === charLevel - 1 ? econ[j].pool : Math.min(econ[j].pool, suffixMinPool[j + 1])
  }

  function canAddRank(skillKey) {
    const cost = CLASSES[levels[i].classKey]?.classSkills.includes(skillKey) ? 1 : 2
    if (suffixMinPool[i] < cost) return false
    for (let j = i; j < charLevel; j++) {
      if (ranksThroughLevel(skillKey, levels, j) + 1 > maxRankAtLevel(skillKey, levels, j)) return false
    }
    return true
  }

  function changeRank(skillKey, delta) {
    const current = levels[i].skills?.[skillKey] ?? 0
    if (delta > 0 && !canAddRank(skillKey)) return
    if (delta < 0 && current <= 0) return
    dispatch({ type: 'SET_LEVEL_SKILL', index: i, skill: skillKey, value: current + delta })
  }

  // ═══════════════════════ OVERVIEW ═══════════════════════
  if (mode === 'overview') {
    return (
      <div>
        <h2 className="step-title">Character Progression</h2>
        <p className="step-sub">
          Level your character one level at a time, just like in game. Unspent skill points
          are banked and carry forward (Auldwyn rule).
        </p>

        {/* Completed levels */}
        {charLevel > 0 && (
          <div className="mb-4">
            <div className="nwn-bar mb-px">Adventure Record — Level {charLevel}</div>
            <div className="panel !p-0 divide-y divide-auldwyn-border/30">
              {levels.map((lv, idx) => {
                const classNum = levels.slice(0, idx + 1).filter(l => l.classKey === lv.classKey).length
                const freeFeats = freeFeatsGrantedAtLevel(levels, idx)
                const featList = [
                  ...freeFeats.map(f => FEATS[f]?.name ?? f),
                  ...(lv.feats ?? []).map(f => FEATS[f]?.name ?? f),
                ].join(', ')
                const skillPts = econ[idx].spent
                return (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2">
                    <span className="w-7 h-7 rounded-sm border border-auldwyn-gold/40 text-auldwyn-gold
                                     flex items-center justify-center font-bold text-[10px] shrink-0"
                          style={{ background: 'linear-gradient(160deg,#33250F,#241B0E)' }}>
                      {idx + 1}
                    </span>
                    <IconSlot icon={CLASS_ICONS[lv.classKey]} size="md" />
                    <span className="font-bold text-auldwyn-text w-40 shrink-0">
                      {CLASSES[lv.classKey]?.name} {classNum}
                    </span>
                    <span className="flex-1 text-xs text-auldwyn-muted truncate">
                      {lv.abilityIncrease && <span className="text-auldwyn-gold">+1 {lv.abilityIncrease.toUpperCase()} · </span>}
                      {featList && <span>{featList} · </span>}
                      {skillPts > 0 && <span>{skillPts} skill pts</span>}
                      {!lv.abilityIncrease && !featList && skillPts === 0 && '—'}
                    </span>
                    <span className="text-xs text-auldwyn-muted/60 font-mono shrink-0">bank {econ[idx].pool}</span>
                    <button
                      onClick={() => { dispatch({ type: 'TRUNCATE_LEVELS', index: idx }) }}
                      title="Re-play from this level"
                      className="w-6 h-6 rounded-sm border border-auldwyn-border text-auldwyn-muted text-xs
                                 hover:border-red-600 hover:text-red-400 shrink-0
                                 flex items-center justify-center"
                    >✕</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Level up button */}
        {!atCap ? (
          <div className="panel text-center py-8 mb-4">
            {charLevel === 0 && (
              <p className="text-auldwyn-muted text-sm mb-4">Your story begins. Choose your first class.</p>
            )}
            <button className="btn-primary text-lg px-10 py-3" onClick={beginLevelUp}>
              ⬆ Level Up — Level {charLevel + 1}
            </button>
            {charLevel > 0 && (
              <p className="text-xs text-auldwyn-muted mt-3">
                Skill points banked: <span className="text-auldwyn-gold font-mono font-bold">{econ[charLevel - 1].pool}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="panel text-center py-6 mb-4 border-auldwyn-gold/50">
            <p className="text-auldwyn-gold font-bold text-lg">⚔ Level 20 — the journey is complete.</p>
            <p className="text-auldwyn-muted text-xs mt-1">Review your build in the Summary.</p>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button className="btn-secondary" onClick={onBack}>← Back</button>
          <button className="btn-primary" disabled={charLevel === 0} onClick={onNext}>
            View Summary →
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════ CLASS SELECTION ═══════════════════════
  if (mode === 'class') {
    const details = selClass ? CLASSES[selClass] : null
    const check = selClass ? classCheck(selClass) : null
    const maxed = selClass ? classMaxed(selClass) : false

    return (
      <div>
        <div className="nwn-bar mb-3">Level {charLevel + 1} — Choose a Class</div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-3">
          {/* Class list (left pane, like NWN) */}
          <div className="panel !p-0 max-h-[420px] overflow-y-auto">
            <div className="px-3 py-1 text-xs uppercase tracking-widest text-auldwyn-muted/70 border-b border-auldwyn-border/40">Classes</div>
            {BASE.map(([key, cls]) => {
              const ok = classCheck(key).met
              return (
                <button key={key}
                  onClick={() => setSelClass(key)}
                  className={`nwn-list-item flex items-center gap-2 ${selClass === key ? 'nwn-list-item-active' : ''} ${ok ? '' : 'nwn-list-item-disabled'}`}>
                  <IconSlot icon={CLASS_ICONS[key]} size="sm" />
                  <span className="flex-1 truncate">{ok ? '' : '🔒 '}{cls.name}</span>
                  {levels.some(l => l.classKey === key) && (
                    <span className="text-auldwyn-gold/70 text-xs">
                      ({levels.filter(l => l.classKey === key).length})
                    </span>
                  )}
                </button>
              )
            })}
            <div className="px-3 py-1 text-xs uppercase tracking-widest text-auldwyn-muted/70 border-y border-auldwyn-border/40">Prestige Classes</div>
            {PRESTIGE.map(([key, cls]) => {
              const ok = classCheck(key).met && !classMaxed(key)
              return (
                <button key={key}
                  onClick={() => setSelClass(key)}
                  className={`nwn-list-item flex items-center gap-2 ${selClass === key ? 'nwn-list-item-active' : ''} ${ok ? '' : 'nwn-list-item-disabled'}`}>
                  <IconSlot icon={CLASS_ICONS[key]} size="sm" />
                  <span className="flex-1 truncate">{ok ? '' : '🔒 '}{cls.name}</span>
                  {levels.some(l => l.classKey === key) && (
                    <span className="text-auldwyn-gold/70 text-xs">
                      ({levels.filter(l => l.classKey === key).length})
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Details (right pane, like NWN description box) */}
          <div className="panel min-h-[420px] flex flex-col">
            {!details ? (
              <p className="text-auldwyn-muted text-sm m-auto">Select a class to see its description.</p>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <IconSlot icon={CLASS_ICONS[selClass]} size="lg" />
                  <h3 className="text-auldwyn-gold font-bold text-lg uppercase tracking-widest"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {details.name}
                  </h3>
                </div>
                <p className="text-sm text-auldwyn-text/90 leading-relaxed mb-3">{details.description}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                  <div><span className="text-auldwyn-muted">Hit Die:</span> <span className="text-auldwyn-text font-mono">d{details.hitDie}</span></div>
                  <div><span className="text-auldwyn-muted">Attack Bonus:</span> <span className="text-auldwyn-text">{BAB_LABELS[details.babProgression]}</span></div>
                  <div><span className="text-auldwyn-muted">Skill Points:</span> <span className="text-auldwyn-text font-mono">{details.skillsPerLevel} + INT</span></div>
                  <div><span className="text-auldwyn-muted">Good Saves:</span> <span className="text-auldwyn-text capitalize">
                    {Object.entries(details.saves).filter(([, v]) => v === 'good').map(([k]) => k).join(', ') || 'None'}
                  </span></div>
                  {details.spellcasting && (
                    <div><span className="text-auldwyn-muted">Magic:</span> <span className="text-purple-300 capitalize">{details.spellcasting}</span></div>
                  )}
                  {details.maxLevel && (
                    <div><span className="text-auldwyn-muted">Max Level:</span> <span className="text-auldwyn-text font-mono">{details.maxLevel}</span></div>
                  )}
                </div>
                <div className="text-xs text-auldwyn-muted mb-2">
                  <span className="font-bold text-auldwyn-gold/80 block mb-1">Class Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {details.classSkills.map(k => SKILLS[k] && (
                      <span key={k} className="inline-flex items-center gap-1 bg-black/20 rounded-sm px-1.5 py-0.5">
                        <IconSlot icon={SKILL_ICONS[k]} size="sm" />
                        {SKILLS[k].name}
                      </span>
                    ))}
                  </div>
                </div>
                {(details.freeFeats?.length > 0) && !levels.some(l => l.classKey === selClass) && (
                  <div className="text-xs text-auldwyn-muted mb-3">
                    <span className="font-bold text-auldwyn-gold/80 block mb-1">Granted Free at Level 1</span>
                    <div className="flex flex-wrap gap-1.5">
                      {details.freeFeats.map(f => (
                        <span key={f} className="inline-flex items-center gap-1 bg-black/20 rounded-sm px-1.5 py-0.5">
                          <IconSlot icon={FEAT_ICONS[f]} size="sm" />
                          {FEATS[f]?.name ?? f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(details.type === 'prestige' || details.alignmentRestriction || !check?.met) && (
                  <div className={`text-xs p-2 rounded-sm border mt-auto ${
                    check?.met && !maxed ? 'border-green-800/60 text-green-400/90' : 'border-red-800/60 text-red-400/90'
                  }`}>
                    {maxed ? (
                      <span>✗ Already at maximum of {details.maxLevel} levels.</span>
                    ) : check?.met ? (
                      <span>✓ You meet all requirements for this class.</span>
                    ) : (
                      <>
                        <span className="font-bold">✗ Requirements not met:</span>
                        <ul className="mt-1 space-y-0.5">
                          {check.reasons.map(r => <li key={r}>• {r}</li>)}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button className="btn-secondary" onClick={() => setMode('overview')}>✕ Cancel</button>
          <button className="btn-primary" disabled={!canTake(selClass)} onClick={confirmClass}>
            Take {details ? details.name : 'Class'} Level →
          </button>
        </div>
      </div>
    )
  }

  // ── Shared header for sub-steps ──
  const lv = levels[i]
  const cls = CLASSES[lv.classKey]
  const classNum = levels.filter(l => l.classKey === lv.classKey).length
  const stepLabels = { ability: 'Ability Increase', skills: 'Skills', feats: 'Feats', confirm: 'Confirm' }

  const header = (
    <div className="nwn-bar mb-3 flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <IconSlot icon={CLASS_ICONS[lv.classKey]} size="sm" />
        Level {charLevel} — {cls?.name} {classNum}
      </span>
      <span className="text-xs normal-case tracking-normal text-auldwyn-gold/70 font-normal">
        {steps.map((s, n) => (
          <span key={s} className={s === mode ? 'text-auldwyn-gold font-bold' : ''}>
            {n > 0 && ' · '}{stepLabels[s]}
          </span>
        ))}
      </span>
    </div>
  )

  const footer = (nextDisabled = false, nextLabel = 'Next →') => (
    <div className="mt-4 flex justify-between">
      <div className="flex gap-2">
        <button className="btn-secondary" onClick={cancelLevel}>✕ Cancel Level</button>
        {stepIdx > 0 && <button className="btn-secondary" onClick={prevSub}>← Back</button>}
      </div>
      <button className="btn-primary" disabled={nextDisabled}
              onClick={mode === 'confirm' ? finishLevel : nextSub}>
        {mode === 'confirm' ? `✓ Finish Level ${charLevel}` : nextLabel}
      </button>
    </div>
  )

  // ═══════════════════════ ABILITY INCREASE ═══════════════════════
  if (mode === 'ability') {
    const racialMods = RACES[character.race]?.abilityMods ?? {}
    const prevIncreases = deriveIncreases(levels.slice(0, i)) // before this level

    return (
      <div>
        {header}
        <p className="step-sub">You have reached level {charLevel} — raise one ability score by 1.</p>
        <div className="panel !p-0 divide-y divide-auldwyn-border/30 max-w-xl">
          {Object.keys(ABILITY_LABELS).map(k => {
            const current = effectiveScore(k, character.abilities, racialMods, prevIncreases)
            const chosen = lv.abilityIncrease === k
            return (
              <button key={k}
                onClick={() => dispatch({ type: 'SET_LEVEL_INCREASE', index: i, ability: chosen ? null : k })}
                className={`nwn-list-item flex items-center gap-4 ${chosen ? 'nwn-list-item-active' : ''}`}>
                <span className="w-28 font-bold">{ABILITY_LABELS[k]}</span>
                <span className="font-mono text-auldwyn-muted">{current}</span>
                <span className="text-auldwyn-muted">→</span>
                <span className={`font-mono font-bold ${chosen ? 'text-auldwyn-gold' : 'text-auldwyn-muted/50'}`}>
                  {chosen ? current + 1 : current}
                </span>
                <span className="ml-auto text-xs font-mono text-auldwyn-muted">
                  mod {abilityMod(chosen ? current + 1 : current) >= 0 ? '+' : ''}{abilityMod(chosen ? current + 1 : current)}
                </span>
              </button>
            )
          })}
        </div>
        {footer(!lv.abilityIncrease)}
      </div>
    )
  }

  // ═══════════════════════ SKILLS ═══════════════════════
  if (mode === 'skills') {
    const skillRows = Object.entries(SKILLS)
      .map(([key, skill]) => ({
        key, skill,
        isCS: cls?.classSkills.includes(key) ?? false,
        locked: maxRankAtLevel(key, levels, i) === 0,
      }))
      .filter(r => !r.locked)
      .sort((a, b) => (a.isCS === b.isCS ? a.skill.name.localeCompare(b.skill.name) : a.isCS ? -1 : 1))

    return (
      <div>
        {header}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-auldwyn-muted">
            Class skills cost <span className="text-auldwyn-gold">1</span> point per rank,
            cross-class cost <span className="text-auldwyn-gold">2</span>. Unspent points are banked.
          </p>
          <p className="text-sm font-mono">
            <span className="text-auldwyn-muted">Points remaining: </span>
            <span className={`text-lg font-bold ${econ[i].pool < 0 ? 'text-red-400' : 'text-auldwyn-gold'}`}>{econ[i].pool}</span>
          </p>
        </div>
        <div className="panel !p-0 divide-y divide-auldwyn-border/20 max-h-[420px] overflow-y-auto">
          {skillRows.map(({ key, skill, isCS }) => {
            const added = lv.skills?.[key] ?? 0
            const total = ranksThroughLevel(key, levels, i)
            const cap = maxRankAtLevel(key, levels, i)
            return (
              <div key={key} className={`flex items-center gap-3 px-3 py-1.5 text-sm ${added > 0 ? 'bg-auldwyn-gold/5' : ''}`}>
                <IconSlot icon={SKILL_ICONS[key]} size="sm" />
                <span className={`w-2 ${isCS ? 'text-auldwyn-gold' : 'text-auldwyn-muted/50'}`}>●</span>
                <span className={`flex-1 ${isCS ? 'text-auldwyn-text' : 'text-auldwyn-muted'}`}>
                  {skill.name}
                  {!isCS && <span className="text-xs opacity-60 ml-1">(cross-class)</span>}
                </span>
                <span className="text-xs font-mono text-auldwyn-muted/60 w-8">{isCS ? '1 pt' : '2 pt'}</span>
                <button onClick={() => changeRank(key, -1)} disabled={added <= 0}
                        className="w-6 h-6 rounded-sm border border-auldwyn-border text-auldwyn-muted
                                   hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-25
                                   flex items-center justify-center">−</button>
                <span className={`w-8 text-center font-mono ${added > 0 ? 'text-auldwyn-gold font-bold' : 'text-auldwyn-muted/40'}`}>
                  {added > 0 ? `+${added}` : '—'}
                </span>
                <button onClick={() => changeRank(key, 1)} disabled={!canAddRank(key)}
                        className="w-6 h-6 rounded-sm border border-auldwyn-border text-auldwyn-muted
                                   hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-25
                                   flex items-center justify-center">+</button>
                <span className="w-14 text-right font-mono text-xs text-auldwyn-muted">{total} / {cap}</span>
              </div>
            )
          })}
        </div>
        {footer(false)}
      </div>
    )
  }

  // ═══════════════════════ FEATS ═══════════════════════
  if (mode === 'feats') {
    const slots = featSlotsAtLevel(character, i)
    const chosen = lv.feats ?? []
    const slotsLeft = slots - chosen.length
    const snapshot = characterAtLevel(character, i)
    const allPlanned = deriveFeats(levels)

    const available = Object.entries(FEATS).filter(([key, feat]) => {
      if (allPlanned.includes(key)) return false
      if (feat.firstLevelOnly && i !== 0) return false
      if (featSearch && !feat.name.toLowerCase().includes(featSearch.toLowerCase())) return false
      return checkFeatPrereqs(key, snapshot).met
    })

    const freeFeats = freeFeatsGrantedAtLevel(levels, i)

    return (
      <div>
        {header}
        {freeFeats.length > 0 && (
          <p className="text-xs text-auldwyn-gold/80 mb-2">
            ✓ Granted free by {cls?.name}: {freeFeats.map(f => FEATS[f]?.name ?? f).join(', ')}
          </p>
        )}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-auldwyn-muted">Choose your feat{slots > 1 ? 's' : ''} for this level.</p>
          <p className="text-sm font-mono">
            <span className="text-auldwyn-muted">Feats remaining: </span>
            <span className={`text-lg font-bold ${slotsLeft > 0 ? 'text-auldwyn-gold' : 'text-green-400'}`}>{slotsLeft}</span>
            <span className="text-auldwyn-muted"> / {slots}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Available (left, like NWN) */}
          <div>
            <div className="nwn-bar mb-px text-xs">Available Feats</div>
            <input
              type="text" placeholder="Search…" value={featSearch}
              onChange={e => setFeatSearch(e.target.value)}
              className="w-full bg-auldwyn-dark border border-auldwyn-border rounded-none px-3 py-1.5 text-sm
                         text-auldwyn-text focus:outline-none focus:border-auldwyn-gold"
            />
            <div className="panel !p-0 max-h-[330px] overflow-y-auto divide-y divide-auldwyn-border/20">
              {available.map(([key, feat]) => (
                <button key={key}
                  onClick={() => slotsLeft > 0 && dispatch({ type: 'ADD_LEVEL_FEAT', index: i, featKey: key })}
                  disabled={slotsLeft <= 0}
                  className="nwn-list-item disabled:opacity-40 flex items-start gap-2">
                  <IconSlot icon={FEAT_ICONS[key]} size="sm" className="mt-0.5" />
                  <span className="flex-1">
                    <span className="font-bold">{feat.name}</span>
                    <span className="block text-xs text-auldwyn-muted mt-0.5">{feat.description}</span>
                  </span>
                </button>
              ))}
              {available.length === 0 && (
                <p className="text-xs text-auldwyn-muted p-3">No eligible feats match.</p>
              )}
            </div>
          </div>

          {/* Chosen (right, like NWN) */}
          <div>
            <div className="nwn-bar mb-px text-xs">Selected This Level</div>
            <div className="panel min-h-[120px] divide-y divide-auldwyn-border/20 !p-0">
              {chosen.map(f => (
                <button key={f}
                  onClick={() => dispatch({ type: 'REMOVE_LEVEL_FEAT', index: i, featKey: f })}
                  className="nwn-list-item hover:!bg-red-950/30 flex items-start gap-2" title="Click to remove">
                  <IconSlot icon={FEAT_ICONS[f]} size="sm" className="mt-0.5" />
                  <span className="flex-1">
                    <span className="font-bold text-auldwyn-gold">{FEATS[f]?.name}</span>
                    <span className="text-xs text-red-400/70 float-right">remove ✕</span>
                    <span className="block text-xs text-auldwyn-muted mt-0.5">{FEATS[f]?.description}</span>
                  </span>
                </button>
              ))}
              {chosen.length === 0 && (
                <p className="text-xs text-auldwyn-muted p-3">Nothing selected yet.</p>
              )}
            </div>
            {slotsLeft > 0 && (
              <p className="text-xs text-yellow-500/80 mt-2">
                ⚠ {slotsLeft} feat slot{slotsLeft > 1 ? 's' : ''} unfilled — you can still continue, but the slot is wasted.
              </p>
            )}
          </div>
        </div>
        {footer(false)}
      </div>
    )
  }

  // ═══════════════════════ CONFIRM ═══════════════════════
  if (mode === 'confirm') {
    const skillList = Object.entries(lv.skills ?? {})
      .filter(([, r]) => r > 0)
      .map(([k, r]) => `${SKILLS[k]?.name} +${r}`)
    const featList = (lv.feats ?? []).map(f => FEATS[f]?.name ?? f)
    const freeFeats = freeFeatsGrantedAtLevel(levels, i).map(f => FEATS[f]?.name ?? f)
    const conMod = abilityMod(effectiveScore('con', character.abilities,
      RACES[character.race]?.abilityMods ?? {}, deriveIncreases(levels)))
    const hpGain = (cls?.hitDie ?? 0) + conMod
    const newBab = calcBAB(deriveClassLevels(levels))

    return (
      <div>
        {header}
        <p className="step-sub">Review your choices for this level.</p>
        <div className="panel max-w-xl space-y-2 text-sm">
          <div className="flex justify-between items-center border-b border-auldwyn-border/30 pb-2">
            <span className="text-auldwyn-muted">Class</span>
            <span className="text-auldwyn-gold font-bold flex items-center gap-2">
              <IconSlot icon={CLASS_ICONS[lv.classKey]} size="sm" />
              {cls?.name} {classNum}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-auldwyn-muted">Hit Points gained (max)</span>
            <span className="font-mono text-auldwyn-text">+{Math.max(1, hpGain)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-auldwyn-muted">Base Attack Bonus</span>
            <span className="font-mono text-auldwyn-text">+{newBab}</span>
          </div>
          {lv.abilityIncrease && (
            <div className="flex justify-between">
              <span className="text-auldwyn-muted">Ability Increase</span>
              <span className="text-auldwyn-gold font-bold">+1 {ABILITY_LABELS[lv.abilityIncrease]}</span>
            </div>
          )}
          {freeFeats.length > 0 && (
            <div className="flex justify-between">
              <span className="text-auldwyn-muted">Free Class Feats</span>
              <span className="text-auldwyn-gold text-right">{freeFeats.join(', ')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-auldwyn-muted">Feats</span>
            <span className="text-auldwyn-text text-right">{featList.length ? featList.join(', ') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-auldwyn-muted">Skills</span>
            <span className="text-auldwyn-text text-right max-w-[60%]">{skillList.length ? skillList.join(', ') : '—'}</span>
          </div>
          <div className="flex justify-between border-t border-auldwyn-border/30 pt-2">
            <span className="text-auldwyn-muted">Skill points banked</span>
            <span className="font-mono text-auldwyn-gold font-bold">{econ[i].pool}</span>
          </div>
        </div>
        {footer(false)}
      </div>
    )
  }

  return null
}
