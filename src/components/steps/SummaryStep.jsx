import { useState } from 'react'
import PrintSheet from '../PrintSheet.jsx'
import { useCharacter, buildShareLink } from '../../store/CharacterContext.jsx'
import { RACES } from '../../data/races.js'
import { CLASSES } from '../../data/classes.js'
import { SKILLS } from '../../data/skills.js'
import { FEATS } from '../../data/feats.js'
import {
  abilityMod, calcBAB, babFromPlan, totalCharacterLevel,
  calcTotalSkillPoints, calcSkillPointsSpent, calcTotalFeatsAvailable,
  validateCharacter, effectiveScore, freeFeatsGrantedAtLevel, featuresAtClassLevel,
} from '../../utils/validation.js'
import { CLASS_ICONS, SKILL_ICONS, FEAT_ICONS } from '../../data/icons.js'
import { alignmentLabel } from '../../data/alignments.js'
import {
  CASTING_ABILITY, FIRST_SPELL_LEVEL, totalSpellSlots, baseSpellsKnown,
} from '../../data/spellSlots.js'
import IconSlot from '../IconSlot.jsx'

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

function Row({ label, value, sub, icon }) {
  return (
    <div className="flex justify-between items-baseline py-0.5 text-sm">
      <span className="text-auldwyn-muted flex items-center gap-1.5">
        {icon && <IconSlot icon={icon} size="sm" />}
        {label}
      </span>
      <span className="text-auldwyn-text font-medium">
        {value}
        {sub && <span className="text-auldwyn-muted text-xs ml-1">({sub})</span>}
      </span>
    </div>
  )
}

export default function SummaryStep({ onBack }) {
  const [showPrint, setShowPrint] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const { character } = useCharacter()
  const race = character.race ? RACES[character.race] : null
  const mods = race?.abilityMods ?? {}

  const charLevel = totalCharacterLevel(character.classLevels)
  // Epic-aware: past level 20 BAB freezes and gains a flat epic bonus instead
  const bab = character.levels?.length
    ? babFromPlan(character.levels)
    : calcBAB(character.classLevels)
  const increases = character.abilityIncreases ?? {}
  const intMod = abilityMod(effectiveScore('int', character.abilities, mods, increases))
  const conMod = abilityMod(effectiveScore('con', character.abilities, mods, increases))
  const isHuman = character.race === 'human'

  const skillBudget = calcTotalSkillPoints(character.classLevels, intMod, isHuman)
  const skillSpent = calcSkillPointsSpent(character.skills, character.classLevels)
  const featBudget = calcTotalFeatsAvailable(character.classLevels, character.race)
  // Free class feats (proficiencies, Scribe Scroll, etc.) don't consume a slot
  const freeFeatKeys = new Set(character.classLevels.flatMap(cl => CLASSES[cl.classKey]?.freeFeats ?? []))
  const chosenFeatCount = character.selectedFeats.filter(f => !freeFeatKeys.has(f.featKey)).length

  const { valid, errors, warnings } = validateCharacter(character)

  // Spell slots per caster class. Slots freeze at class level 20 — epic levels
  // grant none — so totalSpellSlots() clamps internally.
  const casterBlocks = character.classLevels
    .filter(cl => CASTING_ABILITY[cl.classKey])
    .map(({ classKey, levels }) => {
      const ability = CASTING_ABILITY[classKey]
      const mod = abilityMod(effectiveScore(ability, character.abilities, mods, increases))
      return {
        classKey, classLevel: levels, ability, mod,
        slots: totalSpellSlots(classKey, levels, mod),
        known: baseSpellsKnown(classKey, levels),
      }
    })
    .filter(b => b.slots)

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
      `Race: ${race?.name ?? 'Unknown'}  Alignment: ${alignmentLabel(character.alignment)}`,
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
      ...character.selectedFeats.map(({ featKey }) => `  ${FEATS[featKey]?.name}${freeFeatKeys.has(featKey) ? ' (class)' : ''}`),
      '',
      'Leveling Guide:',
      ...(character.levels ?? []).map((lv, i) => {
        const classNum = character.levels.slice(0, i + 1).filter(l => l.classKey === lv.classKey).length
        const parts = []
        if (lv.abilityIncrease) parts.push(`+1 ${lv.abilityIncrease.toUpperCase()}`)
        const gains = featuresAtClassLevel(lv.classKey, classNum).map(f => f.name).join(', ')
        if (gains) parts.push(`Gains: ${gains}`)
        const free = freeFeatsGrantedAtLevel(character.levels, i).map(f => FEATS[f]?.name ?? f).join(', ')
        if (free) parts.push(`Free: ${free}`)
        const fl = (lv.feats ?? []).map(f => FEATS[f]?.name ?? f).join(', ')
        if (fl) parts.push(`Feats: ${fl}`)
        const sl = Object.entries(lv.skills ?? {}).filter(([, r]) => r > 0)
          .map(([k, r]) => `${SKILLS[k]?.name} +${r}`).join(', ')
        if (sl) parts.push(`Skills: ${sl}`)
        return `  Lv ${String(i + 1).padStart(2)}: ${CLASSES[lv.classKey]?.name} ${classNum}${parts.length ? ' — ' + parts.join('; ') : ''}`
      }),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.name || 'character'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyShareLink() {
    const link = buildShareLink(character)
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Clipboard API blocked — fall back to a prompt the user can copy from
      window.prompt('Copy this build link:', link)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div>
      {showPrint && <PrintSheet onClose={() => setShowPrint(false)} />}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="step-title mb-0">{character.name || 'Unnamed Character'}</h2>
          <p className="text-auldwyn-muted text-sm">
            {race?.name} · {alignmentLabel(character.alignment)} · Level {charLevel}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPrint(true)} className="btn-primary text-sm py-1">
            🖨 Print Sheet
          </button>
          <button onClick={exportText} className="btn-secondary text-sm py-1">
            Export .txt
          </button>
          <button onClick={copyShareLink} className="btn-secondary text-sm py-1">
            {linkCopied ? '✓ Link copied!' : '🔗 Copy Build Link'}
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
              <Row key={classKey} icon={CLASS_ICONS[classKey]} label={CLASSES[classKey]?.name} value={`Level ${levels}`} />
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
                  icon={SKILL_ICONS[k]}
                  label={skill.name}
                  value={`${total >= 0 ? '+' : ''}${total}`}
                  sub={`${rank} ranks`}
                />
              )
            })}
          </Section>

          <Section title={`Feats (${chosenFeatCount}/${featBudget})`}>
            {character.selectedFeats.length === 0 && (
              <p className="text-auldwyn-muted text-sm">No feats selected.</p>
            )}
            {character.selectedFeats.map(({ featKey }, idx) => {
              const isFree = freeFeatKeys.has(featKey)
              return (
                <div key={`${featKey}-${idx}`} className="flex items-center gap-1.5 text-sm py-0.5">
                  <IconSlot icon={FEAT_ICONS[featKey]} size="sm" />
                  <span>{FEATS[featKey]?.name ?? featKey}</span>
                  {isFree && <span className="text-auldwyn-muted text-xs ml-1">(class)</span>}
                </div>
              )
            })}
          </Section>
        </div>
      </div>

      {/* Spells per day — only for characters with caster levels */}
      {casterBlocks.length > 0 && (
        <Section title="Spells per Day">
          {casterBlocks.map(({ classKey, classLevel, ability, mod, slots, known }) => (
            <div key={classKey} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <IconSlot icon={CLASS_ICONS[classKey]} size="sm" />
                <span className="text-auldwyn-text font-bold">
                  {CLASSES[classKey]?.name} {classLevel}
                </span>
                <span className="text-auldwyn-muted text-xs">
                  {ability.toUpperCase()} {mod >= 0 ? '+' : ''}{mod}
                  {classLevel > 20 && ' · slots capped at class level 20'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {slots.map((n, idx) => {
                  if (n === null) return null
                  const lvl = idx + (FIRST_SPELL_LEVEL[classKey] ?? 0)
                  const k = known?.[idx]
                  return (
                    <span key={lvl} className="text-xs font-mono bg-black/20 rounded-sm px-2 py-1">
                      <span className="text-auldwyn-muted">{lvl === 0 ? 'Cant' : `L${lvl}`}</span>
                      <span className="text-auldwyn-gold font-bold ml-1.5">{n}</span>
                      {k != null && <span className="text-auldwyn-muted/70 ml-1">({k} known)</span>}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Leveling guide */}
      {character.levels?.length > 0 && (
        <Section title="Leveling Guide">
          <div className="space-y-1">
            {character.levels.map((lv, i) => {
              const classNum = character.levels.slice(0, i + 1).filter(l => l.classKey === lv.classKey).length
              const skillList = Object.entries(lv.skills ?? {})
                .filter(([, r]) => r > 0)
                .map(([k, r]) => `${SKILLS[k]?.name} +${r}`)
                .join(', ')
              const featList = (lv.feats ?? []).map(f => FEATS[f]?.name ?? f).join(', ')
              const freeList = freeFeatsGrantedAtLevel(character.levels, i).map(f => FEATS[f]?.name ?? f).join(', ')
              const featureList = featuresAtClassLevel(lv.classKey, classNum).map(f => f.name).join(', ')
              return (
                <div key={i} className="flex gap-3 text-sm py-1 border-b border-auldwyn-border/30 last:border-0">
                  <span className="text-auldwyn-gold font-bold w-8 shrink-0">{i + 1}</span>
                  <IconSlot icon={CLASS_ICONS[lv.classKey]} size="sm" />
                  <span className="text-auldwyn-text w-36 shrink-0">{CLASSES[lv.classKey]?.name} {classNum}</span>
                  <span className="text-auldwyn-muted text-xs leading-relaxed">
                    {lv.abilityIncrease && <span className="text-auldwyn-gold">+1 {lv.abilityIncrease.toUpperCase()}. </span>}
                    {featureList && <span className="text-auldwyn-gold/80">Gains: {featureList}. </span>}
                    {freeList && <span>Free: {freeList}. </span>}
                    {featList && <span>Feats: {featList}. </span>}
                    {skillList && <span>Skills: {skillList}.</span>}
                    {!lv.abilityIncrease && !featureList && !featList && !freeList && !skillList && '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      <div className="mt-4 flex justify-start">
        <button className="btn-secondary" onClick={onBack}>← Back to Level Plan</button>
      </div>
    </div>
  )
}
