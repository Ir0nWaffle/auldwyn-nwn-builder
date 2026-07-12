import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { SKILLS } from '../data/skills.js'
import { deriveClassLevels, deriveSkills, deriveFeats, deriveIncreases, featSlotsAtLevel } from '../utils/validation.js'

const CharacterContext = createContext(null)

const STORAGE_KEY = 'auldwyn-character'

const initialAbilities  = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
const initialIncreases  = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }
const initialSkills     = Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0]))

// `levels` is the source of truth for the build plan: one entry per character
// level — { classKey, skills: {skillKey: ranksAdded}, feats: [featKey], abilityIncrease }.
// classLevels / skills / selectedFeats / abilityIncreases are derived from it
// after every plan change so summary, print, export, and validation keep working.
const initialState = {
  name: '',
  race: null,
  alignment: null,
  levels: [],
  classLevels: [],
  abilities:  { ...initialAbilities },
  abilityIncreases: { ...initialIncreases },
  skills: { ...initialSkills },
  selectedFeats: [],
}

function freshState() {
  return {
    ...initialState,
    levels: [],
    abilities:        { ...initialAbilities },
    abilityIncreases: { ...initialIncreases },
    skills:           { ...initialSkills },
    selectedFeats: [],
  }
}

function withDerived(state) {
  return {
    ...state,
    classLevels: deriveClassLevels(state.levels),
    skills: { ...initialSkills, ...deriveSkills(state.levels) },
    selectedFeats: deriveFeats(state.levels).map(featKey => ({ featKey })),
    abilityIncreases: deriveIncreases(state.levels),
  }
}

// Merge a saved/shared character over a fresh state so missing keys
// (e.g. skills added in later versions) get sane defaults.
function hydrate(saved) {
  const fresh = freshState()
  if (!saved || typeof saved !== 'object') return fresh
  const base = {
    ...fresh,
    name: typeof saved.name === 'string' ? saved.name : '',
    race: saved.race ?? null,
    alignment: saved.alignment ?? null,
    abilities: { ...fresh.abilities, ...(saved.abilities ?? {}) },
    levels: Array.isArray(saved.levels)
      ? saved.levels.map(lv => ({
          classKey: lv.classKey,
          skills: { ...(lv.skills ?? {}) },
          feats: Array.isArray(lv.feats) ? lv.feats : [],
          abilityIncrease: lv.abilityIncrease ?? null,
        }))
      : [],
  }
  // Pre-plan saves (classLevels/skills as totals) can't be split into levels;
  // keep identity + abilities and let the user rebuild the plan.
  return withDerived(base)
}

// ─── Build permalink encoding ────────────────────────────────────────────────

export function encodeCharacter(character) {
  // Only persist source-of-truth fields; derived ones are recomputed on load
  const { name, race, alignment, abilities, levels } = character
  const payload = { name, race, alignment, abilities, levels }
  return btoa(encodeURIComponent(JSON.stringify(payload)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeCharacter(encoded) {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(atob(b64)))
  } catch {
    return null
  }
}

export function buildShareLink(character) {
  return `${window.location.origin}${window.location.pathname}#build=${encodeCharacter(character)}`
}

// ─── Initial load: URL permalink > localStorage > fresh ─────────────────────

// Capture a shared build from the URL exactly once, at module load.
// (The reducer initializer can run more than once under React StrictMode,
// so consuming the hash inside it would lose the build on the second run.)
const sharedBuildFromUrl = (() => {
  const hash = window.location.hash
  if (!hash.startsWith('#build=')) return null
  const shared = decodeCharacter(hash.slice('#build='.length))
  if (shared) {
    // Clear the hash so further edits become the user's own working copy
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }
  return shared
})()

function loadInitialState() {
  // A shared build link takes priority over the local draft
  if (sharedBuildFromUrl) return hydrate(sharedBuildFromUrl)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return hydrate(JSON.parse(raw))
  } catch {
    // Corrupt or unavailable storage — start fresh
  }
  return freshState()
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }
    case 'SET_RACE':
      return { ...state, race: action.payload }
    case 'SET_ALIGNMENT':
      return { ...state, alignment: action.payload }
    case 'SET_ABILITY':
      return { ...state, abilities: { ...state.abilities, [action.ability]: action.value } }
    case 'SET_ABILITIES':
      return { ...state, abilities: action.payload }

    // ── Level plan actions ──
    case 'ADD_LEVEL':
      return withDerived({
        ...state,
        levels: [...state.levels, { classKey: action.classKey, skills: {}, feats: [], abilityIncrease: null }],
      })
    case 'TRUNCATE_LEVELS':
      // Remove level at `index` and everything after it
      return withDerived({ ...state, levels: state.levels.slice(0, action.index) })
    case 'SET_LEVEL_SKILL': {
      const levels = state.levels.map((lv, i) => {
        if (i !== action.index) return lv
        const skills = { ...lv.skills }
        if (action.value <= 0) delete skills[action.skill]
        else skills[action.skill] = action.value
        return { ...lv, skills }
      })
      return withDerived({ ...state, levels })
    }
    case 'ADD_LEVEL_FEAT': {
      // Guard against double-dispatch: no duplicates anywhere, no slot overflow
      if (deriveFeats(state.levels).includes(action.featKey)) return state
      const lv = state.levels[action.index]
      if (!lv || lv.feats.length >= featSlotsAtLevel(state, action.index)) return state
      const levels = state.levels.map((l, i) =>
        i === action.index ? { ...l, feats: [...l.feats, action.featKey] } : l
      )
      return withDerived({ ...state, levels })
    }
    case 'REMOVE_LEVEL_FEAT': {
      const levels = state.levels.map((lv, i) =>
        i === action.index ? { ...lv, feats: lv.feats.filter(f => f !== action.featKey) } : lv
      )
      return withDerived({ ...state, levels })
    }
    case 'SET_LEVEL_INCREASE': {
      const levels = state.levels.map((lv, i) =>
        i === action.index ? { ...lv, abilityIncrease: action.ability } : lv
      )
      return withDerived({ ...state, levels })
    }

    case 'RESET':
      return freshState()
    default:
      return state
  }
}

export function CharacterProvider({ children }) {
  const [character, dispatch] = useReducer(reducer, undefined, loadInitialState)

  // Auto-save the draft on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character))
    } catch {
      // Storage full or unavailable — draft just won't persist
    }
  }, [character])

  return (
    <CharacterContext.Provider value={{ character, dispatch }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacter() {
  return useContext(CharacterContext)
}
