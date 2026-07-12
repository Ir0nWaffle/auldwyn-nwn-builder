import { useState } from 'react'
import { useCharacter } from '../../store/CharacterContext.jsx'

const ALIGNMENTS = {
  lawfulgood:     { label: 'Lawful Good',     abbr: 'LG', title: 'The Crusader',
    desc: 'A lawful good character acts as a good person is expected or required to act. She combines a commitment to oppose evil with the discipline to fight relentlessly.' },
  neutralgood:    { label: 'Neutral Good',    abbr: 'NG', title: 'The Benefactor',
    desc: 'A neutral good character does the best that a good person can do. He is devoted to helping others, and works with rulers but does not feel beholden to them.' },
  chaoticgood:    { label: 'Chaotic Good',    abbr: 'CG', title: 'The Rebel',
    desc: 'A chaotic good character acts as his conscience directs him with little regard for what others expect. He follows his own moral compass, which points toward good.' },
  lawfulneutral:  { label: 'Lawful Neutral',  abbr: 'LN', title: 'The Judge',
    desc: 'A lawful neutral character acts as law, tradition, or a personal code directs her. Order and organization are paramount to her.' },
  trueneutral:    { label: 'True Neutral',    abbr: 'TN', title: 'The Undecided',
    desc: 'A neutral character does what seems to be a good idea. She thinks of good as better than evil, but is not personally committed to upholding it in any abstract way.' },
  chaoticneutral: { label: 'Chaotic Neutral', abbr: 'CN', title: 'The Free Spirit',
    desc: 'A chaotic neutral character follows his whims. He is an individualist first and last — he values his own liberty but does not strive to protect the freedom of others.' },
  lawfulevil:     { label: 'Lawful Evil',     abbr: 'LE', title: 'The Dominator',
    desc: 'A lawful evil villain methodically takes what he wants within the limits of his code of conduct. He cares about tradition, loyalty, and order — but not about freedom or life.' },
  neutralevil:    { label: 'Neutral Evil',    abbr: 'NE', title: 'The Malefactor',
    desc: 'A neutral evil villain does whatever she can get away with. She is out for herself, pure and simple, shedding no tears for those she kills.' },
  chaoticevil:    { label: 'Chaotic Evil',    abbr: 'CE', title: 'The Destroyer',
    desc: 'A chaotic evil character does whatever his greed, hatred, and lust for destruction drive him to do. He is vicious, arbitrarily violent, and unpredictable.' },
}

// Returns alignment restriction warnings for selected classes
function getRestrictions(classLevels) {
  const notes = []
  if (classLevels.some(cl => cl.classKey === 'paladin')) notes.push('Paladin requires Lawful Good')
  if (classLevels.some(cl => cl.classKey === 'monk')) notes.push('Monk requires Lawful')
  if (classLevels.some(cl => cl.classKey === 'barbarian')) notes.push('Barbarian cannot be Lawful')
  if (classLevels.some(cl => cl.classKey === 'bard')) notes.push('Bard cannot be Chaotic')
  if (classLevels.some(cl => cl.classKey === 'druid')) notes.push('Druid must be Neutral on at least one axis')
  return notes
}

const GRID = [
  ['lawfulgood', 'neutralgood', 'chaoticgood'],
  ['lawfulneutral', 'trueneutral', 'chaoticneutral'],
  ['lawfulevil', 'neutralevil', 'chaoticevil'],
]

export default function AlignmentStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const restrictions = getRestrictions(character.classLevels)
  const [viewed, setViewed] = useState(character.alignment ?? 'trueneutral')
  const al = ALIGNMENTS[viewed]

  function select(key) {
    setViewed(key)
    dispatch({ type: 'SET_ALIGNMENT', payload: key })
  }

  return (
    <div>
      <h2 className="step-title">Alignment</h2>
      <p className="step-sub">Choose your character's moral and ethical outlook. Some classes restrict alignment choices.</p>

      {restrictions.length > 0 && (
        <div className="panel mb-4 border-auldwyn-gold/30">
          <p className="text-xs text-auldwyn-gold mb-1 font-bold">Class Alignment Requirements:</p>
          {restrictions.map(r => <p key={r} className="text-xs text-auldwyn-muted">• {r}</p>)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,380px)_1fr] gap-3">
        {/* 3×3 alignment grid (left) */}
        <div>
          <div className="nwn-bar mb-px text-xs">Alignment</div>
          <div className="panel">
            <div className="grid grid-cols-3 gap-1.5">
              {GRID.flat().map(key => {
                const a = ALIGNMENTS[key]
                const chosen = character.alignment === key
                return (
                  <button
                    key={key}
                    onClick={() => select(key)}
                    className={`card !p-2 text-center ${chosen ? 'card-selected' : ''}`}
                  >
                    <div className="text-lg font-bold text-auldwyn-gold"
                         style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{a.abbr}</div>
                    <div className="text-[11px] text-auldwyn-muted leading-tight">{a.label}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Description (right pane, like NWN) */}
        <div>
          <div className="nwn-bar mb-px text-xs">Description</div>
          <div className="panel min-h-[230px]">
            <h3 className="text-auldwyn-gold font-bold text-lg uppercase tracking-widest mb-0.5"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {al.label}
            </h3>
            <p className="text-xs text-auldwyn-gold/60 italic mb-3">{al.title}</p>
            <p className="text-sm text-auldwyn-text/90 leading-relaxed">{al.desc}</p>
            {character.alignment === viewed && character.alignment && (
              <p className="text-xs text-green-400/80 mt-4">✓ Selected</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn-primary" disabled={!character.alignment} onClick={onNext}>
          Next: Abilities →
        </button>
      </div>
    </div>
  )
}
