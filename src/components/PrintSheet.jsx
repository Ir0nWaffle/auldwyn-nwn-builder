import { useCharacter } from '../store/CharacterContext.jsx'
import { RACES } from '../data/races.js'
import { CLASSES } from '../data/classes.js'
import { SKILLS } from '../data/skills.js'
import { FEATS } from '../data/feats.js'
import { abilityMod, calcBAB, totalCharacterLevel, calcTotalSkillPoints, calcSkillPointsSpent, calcTotalFeatsAvailable, effectiveScore } from '../utils/validation.js'

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const ABILITY_LABELS = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' }
const ABILITY_ABBR   = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

function calcSaves(classLevels) {
  let fort = 0, ref = 0, will = 0
  for (const { classKey, levels } of classLevels) {
    const cls = CLASSES[classKey]
    if (!cls) continue
    fort += cls.saves.fort === 'good' ? Math.floor(levels / 2) + 2 : Math.floor(levels / 3)
    ref  += cls.saves.ref  === 'good' ? Math.floor(levels / 2) + 2 : Math.floor(levels / 3)
    will += cls.saves.will === 'good' ? Math.floor(levels / 2) + 2 : Math.floor(levels / 3)
  }
  return { fort, ref, will }
}

function Box({ label, value, sub }) {
  return (
    <div className="print-box">
      <div className="print-box-value">{value}</div>
      <div className="print-box-label">{label}</div>
      {sub && <div className="print-box-sub">{sub}</div>}
    </div>
  )
}

function SectionHeader({ children }) {
  return <div className="print-section-header">{children}</div>
}

export default function PrintSheet({ onClose }) {
  const { character } = useCharacter()
  const race = character.race ? RACES[character.race] : null
  const mods = race?.abilityMods ?? {}

  const charLevel = totalCharacterLevel(character.classLevels)
  const bab = calcBAB(character.classLevels)
  const saves = calcSaves(character.classLevels)

  const increases = character.abilityIncreases ?? {}
  const conMod  = abilityMod(effectiveScore('con', character.abilities, mods, increases))
  const intMod  = abilityMod(effectiveScore('int', character.abilities, mods, increases))
  const isHuman = character.race === 'human'

  const skillBudget = calcTotalSkillPoints(character.classLevels, intMod, isHuman)
  const skillSpent  = calcSkillPointsSpent(character.skills, character.classLevels)
  const featBudget  = calcTotalFeatsAvailable(character.classLevels, character.race)

  const avgHp = character.classLevels.reduce((sum, { classKey, levels }) => {
    const cls = CLASSES[classKey]
    if (!cls) return sum
    return sum + cls.hitDie * levels + conMod * levels
  }, 0)

  const takenSkills = Object.entries(character.skills).filter(([, r]) => r > 0)

  function isClassSkill(skillKey) {
    return character.classLevels.some(cl => CLASSES[cl.classKey]?.classSkills.includes(skillKey))
  }

  function handlePrint() {
    window.print()
  }

  const alignmentDisplay = {
    lawfulgood: 'Lawful Good', neutralgood: 'Neutral Good', chaoticgood: 'Chaotic Good',
    lawfulneutral: 'Lawful Neutral', trueneutral: 'True Neutral', chaoticneutral: 'Chaotic Neutral',
    lawfulevil: 'Lawful Evil', neutralevil: 'Neutral Evil', chaoticevil: 'Chaotic Evil',
  }

  return (
    <div className="print-overlay">
      {/* Screen-only controls */}
      <div className="print-controls no-print">
        <button onClick={handlePrint} className="btn-primary">🖨 Print / Save as PDF</button>
        <button onClick={onClose} className="btn-secondary">✕ Close</button>
      </div>

      {/* The actual sheet */}
      <div className="print-sheet" id="print-sheet">

        {/* Header */}
        <div className="print-header">
          <div className="print-header-title">
            <span className="print-char-name">{character.name || 'Unnamed Character'}</span>
            <span className="print-world">Auldwyn · NWN:EE</span>
          </div>
          <div className="print-header-meta">
            <span><strong>Race:</strong> {race?.name ?? '—'}</span>
            <span><strong>Alignment:</strong> {alignmentDisplay[character.alignment] ?? '—'}</span>
            <span><strong>Total Level:</strong> {charLevel}</span>
            <span><strong>Size:</strong> {race?.size ?? '—'}</span>
          </div>
        </div>

        {/* Classes */}
        <SectionHeader>Classes</SectionHeader>
        <div className="print-classes">
          {character.classLevels.map(({ classKey, levels }) => (
            <div key={classKey} className="print-class-row">
              <span className="print-class-name">{CLASSES[classKey]?.name}</span>
              <span className="print-class-level">Level {levels}</span>
              <span className="print-class-hd">HD: d{CLASSES[classKey]?.hitDie}</span>
            </div>
          ))}
        </div>

        {/* Core stats row */}
        <SectionHeader>Combat Statistics</SectionHeader>
        <div className="print-stat-row">
          <Box label="Base Attack" value={`+${bab}`} />
          <Box label="Fort Save" value={`+${saves.fort + abilityMod(effectiveScore('con', character.abilities, mods, increases))}`} sub={`Base +${saves.fort}`} />
          <Box label="Ref Save"  value={`+${saves.ref  + abilityMod(effectiveScore('dex', character.abilities, mods, increases))}`} sub={`Base +${saves.ref}`} />
          <Box label="Will Save" value={`+${saves.will + abilityMod(effectiveScore('wis', character.abilities, mods, increases))}`} sub={`Base +${saves.will}`} />
          <Box label="Max HP"    value={Math.max(1, avgHp)} />
          <Box label="Initiative" value={`+${abilityMod(effectiveScore('dex', character.abilities, mods, increases))}`} />
        </div>

        <div className="print-two-col">
          {/* Ability Scores */}
          <div>
            <SectionHeader>Ability Scores</SectionHeader>
            <table className="print-table">
              <thead>
                <tr><th>Ability</th><th>Base</th><th>Racial</th><th>Level-Up</th><th>Final</th><th>Modifier</th></tr>
              </thead>
              <tbody>
                {ABILITY_KEYS.map(k => {
                  const base    = character.abilities[k] || 8
                  const raceMod = mods[k] ?? 0
                  const inc     = increases[k] ?? 0
                  const final_  = effectiveScore(k, character.abilities, mods, increases)
                  const mod2    = abilityMod(final_)
                  return (
                    <tr key={k}>
                      <td><strong>{ABILITY_ABBR[k]}</strong> <span className="print-muted">{ABILITY_LABELS[k]}</span></td>
                      <td className="text-center">{base}</td>
                      <td className="text-center">{raceMod !== 0 ? (raceMod > 0 ? `+${raceMod}` : raceMod) : '—'}</td>
                      <td className="text-center">{inc > 0 ? `+${inc}` : '—'}</td>
                      <td className="text-center"><strong>{final_}</strong></td>
                      <td className="text-center">{mod2 >= 0 ? `+${mod2}` : mod2}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Feats */}
          <div>
            <SectionHeader>Feats ({character.selectedFeats.length}/{featBudget})</SectionHeader>
            {character.selectedFeats.length === 0
              ? <p className="print-muted">None selected.</p>
              : (
                <ul className="print-feat-list">
                  {character.selectedFeats.map(({ featKey }) => (
                    <li key={featKey}>
                      <strong>{FEATS[featKey]?.name ?? featKey}</strong>
                      <span className="print-muted"> — {FEATS[featKey]?.description}</span>
                    </li>
                  ))}
                </ul>
              )
            }
          </div>
        </div>

        {/* Skills */}
        <SectionHeader>Skills ({skillSpent}/{skillBudget} points spent)</SectionHeader>
        {takenSkills.length === 0
          ? <p className="print-muted">No skills allocated.</p>
          : (
            <div className="print-skills-grid">
              {takenSkills.map(([key, rank]) => {
                const skill     = SKILLS[key]
                const abilScore = effectiveScore(skill.ability, character.abilities, mods, increases)
                const total     = rank + abilityMod(abilScore)
                const cs        = isClassSkill(key)
                return (
                  <div key={key} className="print-skill-row">
                    <span className="print-skill-name">{skill.name}{cs ? '' : ' *'}</span>
                    <span className="print-skill-rank">{rank} ranks</span>
                    <span className="print-skill-total">{total >= 0 ? `+${total}` : total}</span>
                  </div>
                )
              })}
            </div>
          )
        }
        {takenSkills.some(([k]) => !isClassSkill(k)) && (
          <p className="print-muted print-footnote">* Cross-class skill</p>
        )}

        {/* Racial traits */}
        <SectionHeader>Racial Traits — {race?.name}</SectionHeader>
        <div className="print-traits">
          {(race?.traits ?? []).map(t => <span key={t} className="print-trait">{t}</span>)}
        </div>

        <div className="print-footer">
          Generated by Auldwyn Character Builder · auldwyn.net · NWN:EE Level Cap: 20
        </div>
      </div>
    </div>
  )
}
