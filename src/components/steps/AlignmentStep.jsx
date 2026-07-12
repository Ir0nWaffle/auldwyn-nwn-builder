import { useCharacter } from '../../store/CharacterContext.jsx'

const ALIGNMENTS = [
  { key: 'lawfulgood',    label: 'Lawful Good',    abbr: 'LG', desc: 'The Crusader' },
  { key: 'neutralgood',   label: 'Neutral Good',   abbr: 'NG', desc: 'The Benefactor' },
  { key: 'chaoticgood',   label: 'Chaotic Good',   abbr: 'CG', desc: 'The Rebel' },
  { key: 'lawfulneutral', label: 'Lawful Neutral',  abbr: 'LN', desc: 'The Judge' },
  { key: 'trueneutral',   label: 'True Neutral',    abbr: 'TN', desc: 'The Undecided' },
  { key: 'chaoticneutral',label: 'Chaotic Neutral', abbr: 'CN', desc: 'The Free Spirit' },
  { key: 'lawfulevil',    label: 'Lawful Evil',     abbr: 'LE', desc: 'The Dominator' },
  { key: 'neutralevil',   label: 'Neutral Evil',    abbr: 'NE', desc: 'The Malefactor' },
  { key: 'chaoticevil',   label: 'Chaotic Evil',    abbr: 'CE', desc: 'The Destroyer' },
]

// Returns alignment restriction warnings for selected race/class combo
function getRestrictions(race, classLevels) {
  const notes = []
  if (classLevels.some(cl => cl.classKey === 'paladin')) notes.push('Paladin requires Lawful Good')
  if (classLevels.some(cl => cl.classKey === 'monk')) notes.push('Monk requires Lawful')
  if (classLevels.some(cl => cl.classKey === 'barbarian')) notes.push('Barbarian cannot be Lawful')
  if (classLevels.some(cl => cl.classKey === 'bard')) notes.push('Bard cannot be Chaotic')
  if (classLevels.some(cl => cl.classKey === 'druid')) notes.push('Druid must be Neutral on at least one axis')
  return notes
}

export default function AlignmentStep({ onNext, onBack }) {
  const { character, dispatch } = useCharacter()
  const restrictions = getRestrictions(character.race, character.classLevels)

  function select(key) {
    dispatch({ type: 'SET_ALIGNMENT', payload: key })
  }

  const rows = [
    ['lawfulgood', 'neutralgood', 'chaoticgood'],
    ['lawfulneutral', 'trueneutral', 'chaoticneutral'],
    ['lawfulevil', 'neutralevil', 'chaoticevil'],
  ]

  const colHeaders = ['Lawful', 'Neutral', 'Chaotic']
  const rowHeaders = ['Good', 'Neutral', 'Evil']

  return (
    <div>
      <h2 className="step-title">Alignment</h2>
      <p className="step-sub">Choose your character's moral and ethical outlook. Some classes restrict alignment choices.</p>

      {restrictions.length > 0 && (
        <div className="panel mb-4 border-auldwyn-gold/30">
          <p className="text-xs text-auldwyn-gold mb-1 font-bold">Class Alignment Requirements:</p>
          {restrictions.map(r => <p key={r} className="text-xs text-auldwyn-muted">â€¢ {r}</p>)}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full max-w-lg">
          <thead>
            <tr>
              <th />
              {colHeaders.map(h => (
                <th key={h} className="text-auldwyn-muted text-sm pb-2 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="text-auldwyn-muted text-sm pr-3 text-right w-16">{rowHeaders[ri]}</td>
                {row.map(key => {
                  const al = ALIGNMENTS.find(a => a.key === key)
                  const selected = character.alignment === key
                  return (
                    <td key={key} className="p-1">
                      <button
                        onClick={() => select(key)}
                        className={`w-full card text-center ${selected ? 'card-selected' : ''}`}
                      >
                        <div className="text-lg font-bold text-auldwyn-gold">{al.abbr}</div>
                        <div className="text-xs text-auldwyn-muted">{al.label}</div>
                        <div className="text-xs text-auldwyn-muted/60 italic">{al.desc}</div>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>â† Back</button>
        <button className="btn-primary" disabled={!character.alignment} onClick={onNext}>
          Next: Abilities â†’
        </button>
      </div>
    </div>
  )
}
