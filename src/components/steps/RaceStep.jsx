import { useState } from 'react'
import { useCharacter } from '../../store/CharacterContext.jsx'
import { RACES } from '../../data/races.js'

export default function RaceStep({ onNext }) {
  const { character, dispatch } = useCharacter()
  const [viewed, setViewed] = useState(character.race ?? 'human')

  function handleName(e) {
    dispatch({ type: 'SET_NAME', payload: e.target.value })
  }

  const canAdvance = character.name.trim().length > 0 && character.race !== null
  const race = RACES[viewed]

  return (
    <div>
      <h2 className="step-title">Name &amp; Race</h2>
      <p className="step-sub">Name your character and choose a race. Racial bonuses apply to your base ability scores.</p>

      <label className="block text-sm text-auldwyn-muted mb-1">Character Name</label>
      <input
        type="text"
        value={character.name}
        onChange={handleName}
        placeholder="Enter character name…"
        className="w-full max-w-sm bg-auldwyn-dark border border-auldwyn-border rounded-sm px-3 py-2
                   text-auldwyn-text focus:outline-none focus:border-auldwyn-gold mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
        {/* Race list (left pane, like NWN) */}
        <div>
          <div className="nwn-bar mb-px text-xs">Races</div>
          <div className="panel !p-0">
            {Object.entries(RACES).map(([key, r]) => {
              const chosen = character.race === key
              return (
                <button
                  key={key}
                  onClick={() => { setViewed(key); dispatch({ type: 'SET_RACE', payload: key }) }}
                  className={`nwn-list-item ${chosen ? 'nwn-list-item-active' : ''}`}
                >
                  {r.name}
                  {chosen && <span className="float-right text-auldwyn-gold">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Description (right pane, like NWN) */}
        <div>
          <div className="nwn-bar mb-px text-xs">Description</div>
          <div className="panel min-h-[320px] flex flex-col">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-auldwyn-gold font-bold text-lg uppercase tracking-widest"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                {race.name}
              </h3>
              <span className="badge badge-gold text-xs">{race.size}</span>
            </div>
            <p className="text-sm text-auldwyn-text/90 leading-relaxed mb-3">{race.description}</p>

            <div className="mb-3">
              <p className="text-xs font-bold text-auldwyn-gold/80 uppercase tracking-widest mb-1">Ability Adjustments</p>
              {Object.keys(race.abilityMods).length === 0 ? (
                <span className="text-sm text-auldwyn-muted">None</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(race.abilityMods).map(([ab, val]) => (
                    <span key={ab} className={`badge ${val > 0 ? 'badge-green' : 'badge-red'} font-mono`}>
                      {val > 0 ? '+' : ''}{val} {ab.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-auldwyn-gold/80 uppercase tracking-widest mb-1">Racial Traits</p>
              <ul className="space-y-0.5">
                {race.traits.map(t => (
                  <li key={t} className="text-sm text-auldwyn-muted">• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="btn-primary" disabled={!canAdvance} onClick={onNext}>
          Next: Alignment →
        </button>
      </div>
    </div>
  )
}
