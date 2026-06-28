import React, { createContext, useContext, useReducer } from 'react'
import { SKILLS } from '../data/skills.js'

const CharacterContext = createContext(null)

const initialAbilities = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
const initialSkills = Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0]))

const initialState = {
  name: '',
  race: null,
  alignment: null,
  // classLevels: [{ classKey, levels }]
  classLevels: [],
  abilities: { ...initialAbilities },
  skills: { ...initialSkills },
  // selectedFeats: [{ featKey, weaponChoice? }]
  selectedFeats: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }
    case 'SET_RACE':
      return { ...state, race: action.payload }
    case 'SET_ALIGNMENT':
      return { ...state, alignment: action.payload }
    case 'SET_CLASS_LEVELS':
      return { ...state, classLevels: action.payload }
    case 'SET_ABILITY':
      return { ...state, abilities: { ...state.abilities, [action.ability]: action.value } }
    case 'SET_ABILITIES':
      return { ...state, abilities: action.payload }
    case 'SET_SKILL':
      return { ...state, skills: { ...state.skills, [action.skill]: action.value } }
    case 'SET_SKILLS':
      return { ...state, skills: action.payload }
    case 'ADD_FEAT':
      return { ...state, selectedFeats: [...state.selectedFeats, action.payload] }
    case 'REMOVE_FEAT':
      return {
        ...state,
        selectedFeats: state.selectedFeats.filter((_, i) => i !== action.index),
      }
    case 'RESET':
      return { ...initialState, abilities: { ...initialAbilities }, skills: { ...initialSkills } }
    default:
      return state
  }
}

export function CharacterProvider({ children }) {
  const [character, dispatch] = useReducer(reducer, {
    ...initialState,
    abilities: { ...initialAbilities },
    skills: { ...initialSkills },
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
