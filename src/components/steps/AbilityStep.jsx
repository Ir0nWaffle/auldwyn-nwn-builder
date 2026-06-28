import { useCharacter } from '../../store/CharacterContext.jsx'
import { RACES } from '../../data/races.js'
import {
  abilityMod, pointCost, totalPointsSpent, ABILITY_POINT_BUDGET,
  levelUpIncreasesAvailable, levelUpIncreasesSpent, effectiveScore,
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

  const spent = totalPointsSpent(character.abilities)
  const remaining = ABILITY_POINT_BUDGET - spent
  const overBudget = remaining < 0

  const increasesAvailable = levelUpIncreasesAvailable(character.classLevels)
  const increasesSpent     = levelUpIncreasesSpent(character.abilityIncreases)
  const increasesRemaining = increasesAvailable - increasesSpent

  function changeBase(key, delta) {
    const current = character.abilities[key]
    const next = current + delta
    if (next < MIN_BASE || next > MAX_BASE) return
    const newSpent = spent - pointCost(current) + pointCost(next)
    if (delta > 0 && newSpent > ABILITY_POINT_BUDGET) return
    dispatch({ type: 'SET_ABILITY', ability: key, value: next })
  }

  function changeIncrease(key, delta) {
    const current = character.abilityIncreases[key] ?? 0
    const next = current + delta
    if (next < 0) return
    if (delta > 0 && increasesRemaining <= 0) return
    dispatch({ type: 'SET_ABILITY_INCREASE', ability: key, value: next })
  }

  function resetBase() {
    dispatch({ type: 'SET_ABILITIES', payload: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } })
  }

  function resetIncreases() {
    dispatch({ type: 'SET_ABILITIES', payload: character.abilities }) // no-op trick — use dedicated reset
    ;['str','dex','con','int','wis','cha'].forEach(k =>
      dispatch({ type: 'SET_ABILITY_INCREASE', ability: k, value: 0 })
    )
  }

  return (
    <div>
      <h2 className="step-title">Ability Scores</h2>
      <p className="step-sub">
        Distribute <span className="text-auldwyn-gold font-bold">{ABILITY_POINT_BUDGET} points</span> using NWN's point-buy system.
        At every 4th character level you gain +1 to any ability score.
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

      {/* Level-up increases budget */}
      {increasesAvailable > 0 && (
        <div className="panel mb-3 flex items-center justify-between border-auldwyn-gold/40">
          <div>
            <span className="text-auldwyn-muted text-sm">Level-up increases remaining: </span>
            <span className={`text-xl font-bold ${increasesRemaining < 0 ? 'text-red-400' : 'text-auldwyn-gold'}`}>
              {increasesRemaining}
            </span>
            <span className="text-auldwyn-muted text-sm"> / {increasesAvailable}</span>
            <span className="text-auldwyn-muted text-xs ml-2">(+1 at levels 4, 8, 12, 16, 20)</span>
          </div>
          <button className="btn-secondary text-sm py-1" onClick={resetIncreases}>Reset increases</button>
        </div>
      )}

      {increasesAvailable === 0 && (
        <div className="panel mb-3 border-auldwyn-border/40">
          <p className="text-auldwyn-muted text-xs">
            Level-up ability increases (+1 at levels 4, 8, 12, 16, 20) will appear here once you reach level 4 in the Class step.
          </p>
        </div>
      )}

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
          const increases = character.abilityIncreases[key] ?? 0
          const final     = effectiveScore(key, character.abilities, racialMods, character.abilityIncreases)
          const mod       = abilityMod(final)
          const cost      = pointCost(base)

          const canIncBase = base < MAX_BASE && spent - cost + pointCost(base + 1) <= ABILITY_POINT_BUDGET
          const canDecBase = base > MIN_BASE
          const canIncIncrease = increasesRemaining > 0
          const canDecIncrease = increases > 0

          return (
            <div key={key} className="panel">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-bold text-auldwyn-gold">{abbr}</span>
                  <span className="text-auldwyn-muted text-sm ml-2">{label}</span>
                </div>
                <span className={`badge font-mono ${mod >= 0 ? 'badge-green' : 'badge-red'}`}>
                  {mod >= 0 ? '+' : ''}{mod}
                </span>
              </div>
              <p className="text-xs text-auldwyn-muted mb-3">{desc}</p>

              {/* Point-buy row */}
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => changeBase(key, -1)} disabled={!canDecBase}
                  className="w-7 h-7 rounded border border-auldwyn-border text-auldwyn-muted
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             text-xl leading-none flex items-center justify-center">−</button>
                <div className="flex-1 text-center">
                  <div className="text-lg font-bold text-auldwyn-text">{base}</div>
                  <div className="text-xs text-auldwyn-muted/60">buy ({cost} pts)</div>
                </div>
                <button onClick={() => changeBase(key, 1)} disabled={!canIncBase}
                  className="w-7 h-7 rounded border border-auldwyn-border text-auldwyn-muted
                             hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                             text-xl leading-none flex items-center justify-center">+</button>
              </div>

              {/* Level-up increases row */}
              {increasesAvailable > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => changeIncrease(key, -1)} disabled={!canDecIncrease}
                    className="w-7 h-7 rounded border border-auldwyn-gold/30 text-auldwyn-gold/50
                               hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                               text-xl leading-none flex items-center justify-center">−</button>
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold text-auldwyn-gold">{increases > 0 ? `+${increases}` : '0'}</div>
                    <div className="text-xs text-auldwyn-gold/60">level-up</div>
                  </div>
                  <button onClick={() => changeIncrease(key, 1)} disabled={!canIncIncrease}
                    className="w-7 h-7 rounded border border-auldwyn-gold/30 text-auldwyn-gold/50
                               hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                               text-xl leading-none flex items-center justify-center">+</button>
                </div>
              )}

              {/* Final score breakdown */}
              <div className="divider" />
              <div className="text-center text-xs text-auldwyn-muted">
                {base}
                {raceMod !== 0 && <span className={raceMod > 0 ? 'text-green-400' : 'text-red-400'}> {raceMod > 0 ? '+' : ''}{raceMod}</span>}
                {increases > 0 && <span className="text-auldwyn-gold"> +{increases}</span>}
                <span className="text-auldwyn-border mx-1">=</span>
                <span className="text-auldwyn-text font-bold text-base">{final}</span>
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
