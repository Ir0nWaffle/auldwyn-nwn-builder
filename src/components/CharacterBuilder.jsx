import { useState } from 'react'
import { useCharacter } from '../store/CharacterContext.jsx'
import StepNav from './StepNav.jsx'
import RaceStep from './steps/RaceStep.jsx'
import AlignmentStep from './steps/AlignmentStep.jsx'
import AbilityStep from './steps/AbilityStep.jsx'
import LevelPlanStep from './steps/LevelPlanStep.jsx'
import SummaryStep from './steps/SummaryStep.jsx'

const TOTAL_STEPS = 5

export default function CharacterBuilder() {
  const { character, dispatch } = useCharacter()
  // A restored draft or shared build unlocks every step so the user can jump around
  const hasProgress = character.levels.length > 0 || character.race !== null
  const [step, setStep] = useState(0)
  const [highestReached, setHighestReached] = useState(hasProgress ? TOTAL_STEPS - 1 : 0)

  function goTo(s) {
    setStep(s)
  }

  function next() {
    const nextStep = step + 1
    setStep(nextStep)
    if (nextStep > highestReached) setHighestReached(nextStep)
  }

  function back() {
    setStep(s => Math.max(0, s - 1))
  }

  function restart() {
    dispatch({ type: 'RESET' })
    setStep(0)
    setHighestReached(0)
  }

  const stepProps = { onNext: next, onBack: back }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <StepNav current={step} onGoto={goTo} completedUpTo={highestReached} />

      <div className="panel min-h-[60vh]">
        {step === 0 && <RaceStep {...stepProps} />}
        {step === 1 && <AlignmentStep {...stepProps} />}
        {step === 2 && <AbilityStep {...stepProps} />}
        {step === 3 && <LevelPlanStep {...stepProps} />}
        {step === 4 && <SummaryStep onBack={back} onRestart={restart} />}
      </div>
    </div>
  )
}
