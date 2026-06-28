import React, { createContext, useContext, useReducer } from 'react'
import { SKILLS } from '../data/skills.js'

const CharacterContext = createContext(null)

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
      return {
        ...initialState,
        abilities:        { ...initialAbilities },
        abilityIncreases: { ...initialIncreases },
        skills:           { ...initialSkills },
      }
    default:
      return state
  }
}

export function CharacterProvider({ children }) {
  const [character, dispatch] = useReducer(reducer, {
    ...initialState,
    abilities:        { ...initialAbilities },
    abilityIncreases: { ...initialIncreases },
    skills:           { ...initialSkills },
  })
  return (
    <CharacterContext.Provider value={{ character, dispatch }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacter() {
  return useContext(CharacterContext)
}
