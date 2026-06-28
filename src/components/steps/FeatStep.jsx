import { useState } from 'react'
import { useCharacter } from '../../store/CharacterContext.jsx'
import { FEATS } from '../../data/feats.js'
import { calcTotalFeatsAvailable, checkFeatPrereqs } from '../../utils/validation.js'

const FEAT_TYPES = ['all', 'general', 'fighter', 'metamagic', 'spellcasting', 'skillbonus']
const TYPE_LABELS = {
  all: 'All',
  general: 'General',
  fighter: 'Fighter Bonus',
  metamagic: 'Metamagic',
  spellcasting: 'Spell',
  skillbonus: 'Skill Focus',
}

export default function FeatStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showUnavailable, setShowUnavailable] = useState(false)

  const totalFeats = calcTotalFeatsAvailable(character.classLevels, character.race)
  const selectedCount = character.selectedFeats.length
  const remaining = totalFeats - selectedCount

  const takenFeatKeys = character.selectedFeats.map(f => f.featKey)

  function addFeat(featKey) {
    if (remaining <= 0) return
    if (takenFeatKeys.includes(featKey)) return
    dispatch({ type: 'ADD_FEAT', payload: { featKey } })
  }

  function removeFeat(featKey) {
    const idx = character.selectedFeats.findIndex(f => f.featKey === featKey)
    if (idx === -1) return
    dispatch({ type: 'REMOVE_FEAT', index: idx })
  }

  const filteredFeats = Object.entries(FEATS).filter(([key, feat]) => {
    if (filter !== 'all' && feat.type !== filter) return false
    if (search && !feat.name.toLowerCase().includes(search.toLowerCase())) return false
    const { met } = checkFeatPrereqs(key, character)
    if (!showUnavailable && !met && !takenFeatKeys.includes(key)) return false
    return true
  })

  return (
    <div>
      <h2 className="step-title">Feats</h2>
      <p className="step-sub">
        Select up to <span className="text-auldwyn-gold font-bold">{totalFeats}</span> feats.
        Prerequisites are enforced — unmet feats are hidden by default.
      </p>

      {/* Budget */}
      <div className="panel mb-4 flex flex-wrap items-center gap-4">
        <div>
          <span className="text-auldwyn-muted text-sm">Feats remaining: </span>
          <span className={`text-xl font-bold ${remaining < 0 ? 'text-red-400' : 'text-auldwyn-gold'}`}>
            {remaining}
          </span>
          <span className="text-auldwyn-muted text-sm"> / {totalFeats}</span>
        </div>
        {selectedCount > 0 && (
          <div className="flex flex-wrap gap-1">
            {character.selectedFeats.map(({ featKey }) => (
              <button
                key={featKey}
                onClick={() => removeFeat(featKey)}
                className="badge badge-gold text-xs hover:bg-red-900/30 hover:border-red-700
                           hover:text-red-400 transition-all"
                title="Click to remove"
              >
                {FEATS[featKey]?.name} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Search feats…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-auldwyn-dark border border-auldwyn-border rounded px-3 py-1.5 text-sm
                     text-auldwyn-text focus:outline-none focus:border-auldwyn-gold flex-1 min-w-40"
        />
        <label className="flex items-center gap-2 text-sm text-auldwyn-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showUnavailable}
            onChange={e => setShowUnavailable(e.target.checked)}
            className="accent-auldwyn-gold"
          />
          Show unavailable
        </label>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {FEAT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded border text-xs transition-all ${
              filter === t
                ? 'bg-auldwyn-gold text-auldwyn-dark border-auldwyn-gold font-bold'
                : 'border-auldwyn-border text-auldwyn-muted hover:border-auldwyn-gold'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {filteredFeats.map(([key, feat]) => {
          const taken = takenFeatKeys.includes(key)
          const { met, reasons } = checkFeatPrereqs(key, character)
          const canTake = met && !taken && remaining > 0

          return (
            <button
              key={key}
              onClick={() => taken ? removeFeat(key) : addFeat(key)}
              disabled={!canTake && !taken}
              className={[
                'card text-left transition-all',
                taken ? 'card-selected' : '',
                !met && !taken ? 'opacity-50' : '',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className={`text-sm font-bold ${taken ? 'text-auldwyn-gold' : 'text-auldwyn-text'}`}>
                    {feat.name}
                  </span>
                  <span className="ml-2 badge border-auldwyn-border/50 text-auldwyn-muted/60 text-xs">
                    {TYPE_LABELS[feat.type]}
                  </span>
                </div>
                {taken && <span className="text-auldwyn-gold text-xs shrink-0">✓ Taken</span>}
              </div>
              <p className="text-xs text-auldwyn-muted mt-1">{feat.description}</p>
              {!met && reasons.length > 0 && (
                <div className="text-xs text-red-400/70 mt-1">
                  {reasons.map(r => <div key={r}>✗ {r}</div>)}
                </div>
              )}
            </button>
          )
        })}
        {filteredFeats.length === 0 && (
          <p className="text-auldwyn-muted text-sm col-span-3">
            No feats match the current filter. Try enabling "Show unavailable".
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext}>
          View Summary →
        </button>
      </div>
    </div>
  )
}
