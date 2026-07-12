import { useState } from 'react'
import { useCharacter } from '../../store/CharacterContext.jsx'
import { CLASSES, SERVER_SETTINGS } from '../../data/classes.js'
import { totalCharacterLevel, calcBAB, checkPrcPrereqs } from '../../utils/validation.js'

const ALLOWED = Object.entries(CLASSES).filter(([key]) => SERVER_SETTINGS.allowedClasses.includes(key))
const BASE_CLASSES = ALLOWED.filter(([, c]) => c.type === 'base')
const PRESTIGE_CLASSES = ALLOWED.filter(([, c]) => c.type === 'prestige')

function HitDieIcon({ die }) {
  return <span className="badge badge-gold">d{die}</span>
}

function BABBadge({ prog }) {
  const labels = { full: 'Full BAB', medium: '¾ BAB', half: '½ BAB' }
  return <span className="badge border-auldwyn-border text-auldwyn-muted">{labels[prog]}</span>
}

function SaveBadge({ saves }) {
  const goods = Object.entries(saves).filter(([, v]) => v === 'good').map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
  if (!goods.length) return null
  return <span className="badge border-auldwyn-border text-auldwyn-muted">Good: {goods.join(', ')}</span>
}

export default function ClassStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const [tab, setTab] = useState('base')

  const classLevels = character.classLevels
  const charLevel = totalCharacterLevel(classLevels)
  const remaining = SERVER_SETTINGS.maxLevel - charLevel

  function setLevels(classKey, value) {
    const val = Math.max(0, Math.min(value, remaining + (classLevels.find(cl => cl.classKey === classKey)?.levels ?? 0)))
    let updated = classLevels.filter(cl => cl.classKey !== classKey)
    if (val > 0) updated = [...updated, { classKey, levels: val }]
    dispatch({ type: 'SET_CLASS_LEVELS', payload: updated })
  }

  function levelsFor(classKey) {
    return classLevels.find(cl => cl.classKey === classKey)?.levels ?? 0
  }

  const displayClasses = tab === 'base' ? BASE_CLASSES : PRESTIGE_CLASSES

  return (
    <div>
      <h2 className="step-title">Class &amp; Levels</h2>
      <p className="step-sub">
        Distribute up to <span className="text-auldwyn-gold font-bold">{SERVER_SETTINGS.maxLevel}</span> levels across classes.
        Prestige classes show exactly what you're missing — skills and feats you pick in later steps count toward them.
      </p>

      {/* Level budget bar */}
      <div className="panel mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-auldwyn-muted">Levels used</span>
          <span className={`font-bold ${charLevel > SERVER_SETTINGS.maxLevel ? 'text-red-400' : 'text-auldwyn-gold'}`}>
            {charLevel} / {SERVER_SETTINGS.maxLevel}
          </span>
        </div>
        <div className="w-full bg-auldwyn-dark rounded-full h-2">
          <div
            className="bg-auldwyn-gold h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (charLevel / SERVER_SETTINGS.maxLevel) * 100)}%` }}
          />
        </div>
        {classLevels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {classLevels.map(({ classKey, levels }) => (
              <span key={classKey} className="badge-gold badge text-xs">
                {CLASSES[classKey]?.name}: {levels}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 mb-4">
        {['base', 'prestige'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded border text-sm transition-all ${
              tab === t
                ? 'bg-auldwyn-gold text-auldwyn-dark border-auldwyn-gold font-bold'
                : 'border-auldwyn-border text-auldwyn-muted hover:border-auldwyn-gold'
            }`}
          >
            {t === 'base' ? 'Base Classes' : 'Prestige Classes'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {displayClasses.map(([key, cls]) => {
          const levels = levelsFor(key)
          const prcCheck = cls.type === 'prestige' ? checkPrcPrereqs(key, character) : null
          const maxForClass = cls.maxLevel ?? SERVER_SETTINGS.maxLevel

          return (
            <div key={key} className={`card ${levels > 0 ? 'card-selected' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="font-bold text-auldwyn-gold block">{cls.name}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <HitDieIcon die={cls.hitDie} />
                    <BABBadge prog={cls.babProgression} />
                    <SaveBadge saves={cls.saves} />
                    {cls.spellcasting && (
                      <span className="badge border-purple-700 text-purple-400 capitalize">{cls.spellcasting}</span>
                    )}
                    {cls.maxLevel && (
                      <span className="badge border-auldwyn-border text-auldwyn-muted">Max {cls.maxLevel}</span>
                    )}
                  </div>
                </div>
                {/* Level spinner */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setLevels(key, levels - 1)}
                    disabled={levels <= 0}
                    className="w-7 h-7 rounded border border-auldwyn-border text-auldwyn-muted
                               hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                               text-lg leading-none flex items-center justify-center"
                  >−</button>
                  <span className="w-6 text-center font-bold text-auldwyn-gold">{levels}</span>
                  <button
                    onClick={() => setLevels(key, levels + 1)}
                    disabled={remaining <= 0 || levels >= maxForClass}
                    className="w-7 h-7 rounded border border-auldwyn-border text-auldwyn-muted
                               hover:border-auldwyn-gold hover:text-auldwyn-gold disabled:opacity-30
                               text-lg leading-none flex items-center justify-center"
                  >+</button>
                </div>
              </div>

              <p className="text-xs text-auldwyn-muted mb-2 leading-relaxed">{cls.description}</p>

              {cls.type === 'prestige' && cls.prereqDescription && (
                <div className={`text-xs mt-1 p-1.5 rounded border ${
                  prcCheck?.met ? 'border-green-800 text-green-400/80' : 'border-auldwyn-red/50 text-red-400/70'
                }`}>
                  <span className="font-bold">{prcCheck?.met ? '✓ Requirements met' : '✗ Missing requirements'}</span>
                  {!prcCheck?.met && (
                    <ul className="mt-1 space-y-0.5">
                      {prcCheck.reasons.map(r => <li key={r}>• {r}</li>)}
                    </ul>
                  )}
                  <div className="mt-1 text-auldwyn-muted/70">{cls.prereqDescription}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" disabled={charLevel === 0} onClick={onNext}>
          Next: Abilities →
        </button>
      </div>
    </div>
  )
}
