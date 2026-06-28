import { useCharacter } from '../../store/CharacterContext.jsx'
import { RACES } from '../../data/races.js'

function AbilityPip({ label, value }) {
  if (!value) return null
  return (
    <span className={`badge ${value > 0 ? 'badge-green' : 'badge-red'} mr-1`}>
      {value > 0 ? '+' : ''}{value} {label.toUpperCase()}
    </span>
  )
}

export default function RaceStep({ onNext }) {
  const { character, dispatch } = useCharacter()

  function handleName(e) {
    dispatch({ type: 'SET_NAME', payload: e.target.value })
  }

  function handleRace(key) {
    dispatch({ type: 'SET_RACE', payload: key })
  }

  const canAdvance = character.name.trim().length > 0 && character.race !== null

  return (
    <div>
      <h2 className="step-title">Name &amp; Race</h2>
      <p className="step-sub">Choose your character's name and race. Racial bonuses apply to your base ability scores.</p>

      <label className="block text-sm text-auldwyn-muted mb-1">Character Name</label>
      <input
        type="text"
        value={character.name}
        onChange={handleName}
        placeholder="Enter character name…"
        className="w-full max-w-sm bg-auldwyn-dark border border-auldwyn-border rounded px-3 py-2
                   text-auldwyn-text focus:outline-none focus:border-auldwyn-gold mb-6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Object.entries(RACES).map(([key, race]) => {
          const selected = character.race === key
          return (
            <button
              key={key}
              onClick={() => handleRace(key)}
              className={`card text-left ${selected ? 'card-selected' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-auldwyn-gold">{race.name}</span>
                <span className="badge badge-gold text-xs">{race.size}</span>
              </div>
              <p className="text-xs text-auldwyn-muted mb-2 leading-relaxed">{race.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {Object.entries(race.abilityMods).map(([ab, val]) => (
                  <AbilityPip key={ab} label={ab} value={val} />
                ))}
                {Object.keys(race.abilityMods).length === 0 && (
                  <span className="text-xs text-auldwyn-muted">No ability adjustments</span>
                )}
              </div>
              <div className="divider" />
              <ul className="space-y-0.5">
                {race.traits.map(t => (
                  <li key={t} className="text-xs text-auldwyn-muted">• {t}</li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button className="btn-primary" disabled={!canAdvance} onClick={onNext}>
          Next: Alignment →
        </button>
      </div>
    </div>
  )
}
