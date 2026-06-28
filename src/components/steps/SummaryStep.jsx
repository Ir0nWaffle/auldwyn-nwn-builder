import { useState } from 'react'
import PrintSheet from '../PrintSheet.jsx'
import { useCharacter } from '../../store/CharacterContext.jsx'
import { RACES } from '../../data/races.js'
import { CLASSES } from '../../data/classes.js'
import { SKILLS } from '../../data/skills.js'
import { FEATS } from '../../data/feats.js'
import {
  abilityMod, calcBAB, totalCharacterLevel,
  calcTotalSkillPoints, calcSkillPointsSpent, calcTotalFeatsAvailable,
  validateCharacter, effectiveScore,
} from '../../utils/validation.js'

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

function Section({ title, children }) {
  return (
    <div className="panel mb-4">
      <h3 className="text-auldwyn-gold font-bold mb-3 border-b border-auldwyn-border pb-1">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, sub }) {
  return (
    <div className="flex justify-between items-baseline py-0.5 text-sm">
      <span className="text-auldwyn-muted">{label}</span>
      <span className="text-auldwyn-text font-medium">
        {value}
        {sub && <span className="text-auldwyn-muted text-xs ml-1">({sub})</span>}
      </span>
    </div>
  )
}

export default function SummaryStep({ onBack, onRestart }) {
  const [showPrint, setShowPrint] = useState(false)
  const { character } = useCharacter()
  const race = character.race ? RACES[character.race] : null
  const mods = race?.abilityMods ?? {}

  const charLevel = totalCharacterLevel(character.classLevels)
  const bab = calcBAB(character.classLevels)
  const increases = character.abilityIncreases ?? {}
  const intMod = abilityMod(effectiveScore('int', character.abilities, mods, increases))
  const conMod = abilityMod(effectiveScore('con', character.abilities, mods, increases))
  const isHuman = character.race === 'human'

  const skillBudget = calcTotalSkillPoints(character.classLevels, intMod, isHuman)
  const skillSpent = calcSkillPointsSpent(character.skills, character.classLevels)
  const featBudget = calcTotalFeatsAvailable(character.classLevels, character.race)

  const { valid, errors, warnings } = validateCharacter(character)

  // HP is max per level on Auldwyn
  const avgHp = character.classLevels.reduce((sum, { classKey, levels }) => {
    const cls = CLASSES[classKey]
    if (!cls) return sum
    return sum + cls.hitDie * levels + conMod * levels
  }, 0)

  const takenSkills = Object.entries(character.skills).filter(([, r]) => r > 0)

  function exportText() {
    const lines = [
      `=== ${character.name} ===`,
      `Race: ${race?.name ?? 'Unknown'}  Alignment: ${character.alignment ?? 'Unknown'}`,
      `Level: ${charLevel}  BAB: +${bab}`,
      '',
      'Classes:',
      ...character.classLevels.map(cl => `  ${CLASSES[cl.classKey]?.name}: ${cl.levels}`),
      '',
      'Abilities:',
      ...ABILITY_KEYS.map(k => {
        const base = character.abilities[k]
        const mod2 = mods[k] ?? 0
        const eff = base + mod2
        return `  ${ABILITY_LABELS[k]}: ${eff} (${abilityMod(eff) >= 0 ? '+' : ''}${abilityMod(eff)})`
      }),
      '',
      'Skills:',
      ...takenSkills.map(([k, r]) => `  ${SKILLS[k]?.name}: ${r}`),
      '',
      'Feats:',
      ...character.selectedFeats.map(({ featKey }) => `  ${FEATS[featKey]?.name}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.name || 'character'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {showPrint && <PrintSheet onClose={() => setShowPrint(false)} />}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="step-title mb-0">{character.name || 'Unnamed Character'}</h2>
          <p className="text-auldwyn-muted text-sm">
            {race?.name} · {character.alignment} · Level {charLevel}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPrint(true)} className="btn-primary text-sm py-1">
            🖨 Print Sheet
          </button>
          <button onClick={exportText} className="btn-secondary text-sm py-1">
            Export .txt
          </button>
          <button onClick={onRestart} className="btn-secondary text-sm py-1 border-red-800 text-red-400 hover:border-red-500">
            New Character
          </button>
        </div>
      </div>

      {/* Validation */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="mb-4 space-y-2">
          {errors.map(e => (
            <div key={e} className="panel border-red-800/60 bg-red-950/20 text-red-400 text-sm">
              ✗ {e}
            </div>
          ))}
          {warnings.map(w => (
            <div key={w} className="panel border-yellow-700/60 bg-yellow-950/20 text-yellow-400 text-sm">
              ⚠ {w}
            </div>
          ))}
          {valid && (
            <div className="panel border-green-800/60 bg-green-950/20 text-green-400 text-sm">
              ✓ Character is valid and ready to play on Auldwyn!
            </div>
          )}
        </div>
      )}
      {valid && errors.length === 0 && (
        <div className="panel border-green-800/60 bg-green-950/20 text-green-400 text-sm mb-4">
          ✓ Character is valid and ready to play on Auldwyn!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Section title="Classes">
            {character.classLevels.map(({ classKey, levels }) => (
              <Row key={classKey} label={CLASSES[classKey]?.name} value={`Level ${levels}`} />
            ))}
            <div className="divider" />
            <Row label="Total Level" value={charLevel} />
            <Row label="Base Attack Bonus" value={`+${bab}`} />
            <Row label="Max HP" value={Math.max(1, avgHp)} />
          </Section>

          <Section title="Ability Scores">
            {ABILITY_KEYS.map(k => {
              const base    = character.abilities[k]
              const raceMod = mods[k] ?? 0
              const inc     = increases[k] ?? 0
              const final   = effectiveScore(k, character.abilities, mods, increases)
              const mod2    = abilityMod(final)
              const parts   = [`${base} buy`]
              if (raceMod !== 0) parts.push(`${raceMod > 0 ? '+' : ''}${raceMod} racial`)
              if (inc > 0) parts.push(`+${inc} level-up`)
              return (
                <Row
                  key={k}
                  label={ABILITY_LABELS[k]}
                  value={`${final}  (${mod2 >= 0 ? '+' : ''}${mod2})`}
                  sub={final !== base ? parts.join(', ') : null}
                />
              )
            })}
          </Section>
        </div>

        <div>
          <Section title={`Skills (${skillSpent}/${skillBudget} pts)`}>
            {takenSkills.length === 0 && <p className="text-auldwyn-muted text-sm">No skills allocated.</p>}
            {takenSkills.map(([k, rank]) => {
              const skill = SKILLS[k]
              const abilScore = effectiveScore(skill.ability, character.abilities, mods, increases)
              const total = rank + abilityMod(abilScore)
              return (
                <Row
                  key={k}
                  label={skill.name}
                  value={`${total >= 0 ? '+' : ''}${total}`}
                  sub={`${rank} ranks`}
                />
              )
            })}
          </Section>

          <Section title={`Feats (${character.selectedFeats.length}/${featBudget})`}>
            {character.selectedFeats.length === 0 && (
              <p className="text-auldwyn-muted text-sm">No feats selected.</p>
            )}
            {character.selectedFeats.map(({ featKey }) => (
              <div key={featKey} className="text-sm py-0.5">
                <span className="text-auldwyn-gold">•</span>{' '}
                <span>{FEATS[featKey]?.name ?? featKey}</span>
              </div>
            ))}
          </Section>
        </div>
      </div>

      <div className="mt-4 flex justify-start">
        <button className="btn-secondary" onClick={onBack}>← Back to Feats</button>
      </div>
    </div>
  )
}
