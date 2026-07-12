import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { SKILLS } from '../data/skills.js'

const CharacterContext = createContext(null)

const STORAGE_KEY = 'auldwyn-character'

const initialAbilities  = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
const initialIncreases  = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }
const initialSkills     = Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0]))

const initialState = {
  name: '',
  race: null,
  alignment: null,
  classLevels: [],
  abilities:  { ...initialAbilities },
  // Level-up ability increases: +1 to any stat at levels 4, 8, 12, 16, 20
  abilityIncreases: { ...initialIncreases },
  skills: { ...initialSkills },
  selectedFeats: [],
}

function freshState() {
  return {
    ...initialState,
    abilities:        { ...initialAbilities },
    abilityIncreases: { ...initialIncreases },
    skills:           { ...initialSkills },
  }
}

// Merge a saved/shared character over a fresh state so missing keys
// (e.g. skills added in later versions) get sane defaults.
function hydrate(saved) {
  const fresh = freshState()
  if (!saved || typeof saved !== 'object') return fresh
  return {
    ...fresh,
    name: typeof saved.name === 'string' ? saved.name : '',
    race: saved.race ?? null,
    alignment: saved.alignment ?? null,
    classLevels: Array.isArray(saved.classLevels) ? saved.classLevels : [],
    abilities:        { ...fresh.abilities,        ...(saved.abilities ?? {}) },
    abilityIncreases: { ...fresh.abilityIncreases, ...(saved.abilityIncreases ?? {}) },
    skills:           { ...fresh.skills,           ...(saved.skills ?? {}) },
    selectedFeats: Array.isArray(saved.selectedFeats) ? saved.selectedFeats : [],
  }
}

// ─── Build permalink encoding ────────────────────────────────────────────────

export function encodeCharacter(character) {
  // JSON → UTF-8-safe base64, URL-friendly
  return btoa(encodeURIComponent(JSON.stringify(character)))
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

function clampIncreases(increases, available) {
  // If levels were removed and we now have fewer points than allocated, trim from each stat
  let total = Object.values(increases).reduce((s, v) => s + v, 0)
  if (total <= available) return increases
  const clamped = { ...increases }
  const keys = Object.keys(clamped)
  for (const k of [...keys].reverse()) {
    while (clamped[k] > 0 && total > available) {
      clamped[k]--
      total--
    }
  }
  return clamped
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }
    case 'SET_RACE':
      return { ...state, race: action.payload }
    case 'SET_ALIGNMENT':
      return { ...state, alignment: action.payload }
    case 'SET_CLASS_LEVELS': {
      const newLevels = action.payload
      const charLevel = newLevels.reduce((s, cl) => s + cl.levels, 0)
      const available = Math.floor(charLevel / 4)
      const abilityIncreases = clampIncreases(state.abilityIncreases, available)
      return { ...state, classLevels: newLevels, abilityIncreases }
    }
    case 'SET_ABILITY':
      return { ...state, abilities: { ...state.abilities, [action.ability]: action.value } }
    case 'SET_ABILITIES':
      return { ...state, abilities: action.payload }
    case 'SET_ABILITY_INCREASE':
      return { ...state, abilityIncreases: { ...state.abilityIncreases, [action.ability]: action.value } }
    case 'SET_SKILL':
      return { ...state, skills: { ...state.skills, [action.skill]: action.value } }
    case 'SET_SKILLS':
      return { ...state, skills: action.payload }
    case 'ADD_FEAT':
      return { ...state, selectedFeats: [...state.selectedFeats, action.payload] }
    case 'REMOVE_FEAT':
      return { ...state, selectedFeats: state.selectedFeats.filter((_, i) => i !== action.index) }
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
