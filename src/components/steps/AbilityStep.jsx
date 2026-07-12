import { useCharacter } from '../../store/CharacterContext.jsx'
import { RACES } from '../../data/races.js'
import {
  abilityMod, pointCost, totalPointsSpent, ABILITY_POINT_BUDGET, effectiveScore,
} from '../../utils/validation.js'

const ABILITIES = [
  { key: 'str', label: 'Strength',     abbr: 'STR', desc: 'Melee attack/damage, carry weight, Discipline' },
  { key: 'dex', label: 'Dexterity',    abbr: 'DEX', desc: 'AC, Reflex saves, ranged attacks, stealth skills' },
  { key: 'con', label: 'Constitution', abbr: 'CON', desc: 'Hit points, Fortitude saves, Concentration' },
  { key: 'int', label: 'Intelligence', abbr: 'INT', desc: 'Skill points per level, Wizard spells, many skills' },
  { key: 'wis', label: 'Wisdom',       abbr: 'WIS', desc: 'Will saves, divine spells, Heal, Spot, Listen' },
  { key: 'cha', label: 'Charisma',     abbr: 'CHA', desc: 'Sorcerer/Bard spells, social skills, turning' },
]

const MIN_BASE = 8
const MAX_BASE = 18

export default function AbilityStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const race = character.race ? RACES[character.race] : null
  const racialMods = race?.abilityMods ?? {}
  const increases = character.abilityIncreases ?? {}

  const spent = totalPointsSpent(character.abilities)
  const remaining = ABILITY_POINT_BUDGET - spent
  const overBudget = remaining < 0

  function changeBase(key, delta) {
    const current = character.abilities[key]
    const next = current + delta
    if (next < MIN_BASE || next > MAX_BASE) return
    const newSpent = spent - pointCost(current) + pointCost(next)
    if (delta > 0 && newSpent > ABILITY_POINT_BUDGET) return
    dispatch({ type: 'SET_ABILITY', ability: key, value: next })
  }

  function resetBase() {
    dispatch({ type: 'SET_ABILITIES', payload: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } })
  }

  return (
    <div>
      <h2 className="step-title">Ability Scores</h2>
      <p className="step-sub">
        Distribute <span className="text-auldwyn-gold font-bold">{ABILITY_POINT_BUDGET} points</span> using NWN's point-buy system.
        The +1 ability increases at levels 4, 8, 12, 16, and 20 are chosen in the Level Plan step.
      </p>

      {/* Point-buy budget */}
      <div className="panel mb-3 flex items-center justify-between">
        <div>
          <span className="text-auldwyn-muted text-sm">Point-buy remaining: </span>
          <span className={`text-xl font-bold ${overBudget ? 'text-red-400' : 'text-auldwyn-gold'}`}>
            {remaining}
          </span>
          <span className="text-auldwyn-muted text-sm"> / {ABILITY_POINT_BUDGET}</span>
        </div>
        <button className="btn-secondary text-sm py-1" onClick={resetBase}>Reset buy</button>
      </div>

      {/* Point cost reference */}
      <div className="panel mb-4">
        <p className="text-xs text-auldwyn-muted mb-1 font-bold">Point-Buy Cost Reference</p>
        <div className="flex flex-wrap gap-2 text-xs text-auldwyn-muted font-mono">
          {[8,9,10,11,12,13,14,15,16,17,18].map(s => (
            <span key={s}>
              <span className="text-auldwyn-text">{s}</span>
              <span className="text-auldwyn-border mx-0.5">=</span>
              <span className="text-auldwyn-gold">{pointCost(s)}pt</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ABILITIES.map(({ key, label, abbr, desc }) => {
          const base      = character.abilities[key]
          const raceMod   = racialMods[key] ?? 0
          const levelUps  = increases[key] ?? 0
          const final     = effectiveScore(key, character.abilities, racialMods, increases)
          const mod       = abilityMod(final)
          const cost      = pointCost(base)

          const canIncBase = base < MAX_BASE && spent - cost + pointCost(base + 1) <= ABILITY_POINT_BUDGET
          const canDecBase = base > MIN_BASE

          return (
            <div key={key} className="panel">
              {/* Header: name + modifier badge */}
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-bold text-auldwyn-gold">{abbr}</span>
                  <span className="text-auldwyn-muted text-sm ml-2">{label}</span>
                </div>
                <span className={`badge font-mono text-sm ${mod >= 0 ? 'badge-green' : 'badge-red'}`}>
                  {mod >= 0 ? '+' : ''}{mod}
                </span>
              </div>
              <p className="text-xs text-auldwyn-muted mb-2">{desc}</p>

              {/* Hero: final effective score */}
              <div className="text-center mb-3">
                <div className="text-4xl font-bold text-auldwyn-text">{final}</div>
                <div className="text-xs text-auldwyn-muted mt-0.5 font-mono">
                  {base} base
                  {raceMod !== 0 && (
                    <span className={raceMod > 0 ? ' text-green-400' : ' text-red-400'}>
                      {' '}{raceMod > 0 ? '+' : ''}{raceMod} racial
                    </span>
                  )}
                  {levelUps > 0 && (
                    <span className="text-auldwyn-gold"> +{levelUps} lvl-up</span>
                  )}
                </div>
              </div>

              {/* Point-buy spinner */}
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => changeBase(key, -1)} disabled={!canDecBase}
                  className="w-8 h-8 rounded border border-auldwyn-border text-auldwyn-muted
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             text-xl leading-none flex items-center justify-center">−</button>
                <div className="flex-1 text-center">
                  <div className="text-sm text-auldwyn-muted">Base: <span className="text-auldwyn-text font-bold">{base}</span></div>
                  <div className="text-xs text-auldwyn-muted/60">({cost} pts)</div>
                </div>
                <button onClick={() => changeBase(key, 1)} disabled={!canIncBase}
                  className="w-8 h-8 rounded border border-auldwyn-border text-auldwyn-muted
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             text-xl leading-none flex items-center justify-center">+</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" disabled={overBudget} onClick={onNext}>
          Next: Level Plan →
        </button>
      </div>
    </div>
  )
}
