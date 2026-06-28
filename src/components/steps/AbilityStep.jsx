import { useCharacter } from '../../store/CharacterContext.jsx'
import { RACES } from '../../data/races.js'
import { abilityMod, pointCost, totalPointsSpent, ABILITY_POINT_BUDGET } from '../../utils/validation.js'

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

function ModifierBadge({ score }) {
  const mod = abilityMod(score)
  return (
    <span className={`badge font-mono ${mod >= 0 ? 'badge-green' : 'badge-red'}`}>
      {mod >= 0 ? '+' : ''}{mod}
    </span>
  )
}

export default function AbilityStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const race = character.race ? RACES[character.race] : null
  const mods = race?.abilityMods ?? {}

  const spent = totalPointsSpent(character.abilities)
  const remaining = ABILITY_POINT_BUDGET - spent
  const overBudget = remaining < 0

  function change(key, delta) {
    const current = character.abilities[key]
    const next = current + delta
    if (next < MIN_BASE || next > MAX_BASE) return
    const newSpent = spent - pointCost(current) + pointCost(next)
    if (delta > 0 && newSpent > ABILITY_POINT_BUDGET) return
    dispatch({ type: 'SET_ABILITY', ability: key, value: next })
  }

  function reset() {
    const reset = Object.fromEntries(ABILITIES.map(a => [a.key, 8]))
    dispatch({ type: 'SET_ABILITIES', payload: reset })
  }

  return (
    <div>
      <h2 className="step-title">Ability Scores</h2>
      <p className="step-sub">
        Distribute <span className="text-auldwyn-gold font-bold">{ABILITY_POINT_BUDGET} points</span> using NWN's point-buy system.
        Racial modifiers are shown separately and do not cost points.
      </p>

      {/* Point budget */}
      <div className="panel mb-4 flex items-center justify-between">
        <div>
          <span className="text-auldwyn-muted text-sm">Points remaining: </span>
          <span className={`text-xl font-bold ${overBudget ? 'text-red-400' : 'text-auldwyn-gold'}`}>
            {remaining}
          </span>
          <span className="text-auldwyn-muted text-sm"> / {ABILITY_POINT_BUDGET}</span>
        </div>
        <button className="btn-secondary text-sm py-1" onClick={reset}>Reset</button>
      </div>

      {/* Point cost reference */}
      <div className="panel mb-4">
        <p className="text-xs text-auldwyn-muted mb-1 font-bold">Point Cost Reference</p>
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
          const base = character.abilities[key]
          const raceMod = mods[key] ?? 0
          const effective = base + raceMod
          const cost = pointCost(base)
          const canIncrease = base < MAX_BASE && spent - cost + pointCost(base + 1) <= ABILITY_POINT_BUDGET
          const canDecrease = base > MIN_BASE

          return (
            <div key={key} className="panel">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-bold text-auldwyn-gold">{abbr}</span>
                  <span className="text-auldwyn-muted text-sm ml-2">{label}</span>
                </div>
                <ModifierBadge score={effective} />
              </div>
              <p className="text-xs text-auldwyn-muted mb-3">{desc}</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => change(key, -1)}
                  disabled={!canDecrease}
                  className="w-8 h-8 rounded border border-auldwyn-border text-auldwyn-muted
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             text-xl leading-none flex items-center justify-center"
                >−</button>

                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-auldwyn-text">{base}</div>
                  {raceMod !== 0 && (
                    <div className="text-xs">
                      <span className={raceMod > 0 ? 'text-green-400' : 'text-red-400'}>
                        {raceMod > 0 ? '+' : ''}{raceMod} racial
                      </span>
                      <span className="text-auldwyn-muted"> = </span>
                      <span className="text-auldwyn-gold font-bold">{effective}</span>
                    </div>
                  )}
                  <div className="text-xs text-auldwyn-muted/60">({cost} pts)</div>
                </div>

                <button
                  onClick={() => change(key, 1)}
                  disabled={!canIncrease}
                  className="w-8 h-8 rounded border border-auldwyn-border text-auldwyn-muted
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             text-xl leading-none flex items-center justify-center"
                >+</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" disabled={overBudget} onClick={onNext}>
          Next: Skills →
        </button>
      </div>
    </div>
  )
}
