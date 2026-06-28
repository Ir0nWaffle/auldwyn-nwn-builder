import { useState } from 'react'
import { useCharacter } from '../store/CharacterContext.jsx'
import StepNav from './StepNav.jsx'
import RaceStep from './steps/RaceStep.jsx'
import AlignmentStep from './steps/AlignmentStep.jsx'
import ClassStep from './steps/ClassStep.jsx'
import AbilityStep from './steps/AbilityStep.jsx'
import SkillStep from './steps/SkillStep.jsx'
import FeatStep from './steps/FeatStep.jsx'
import SummaryStep from './steps/SummaryStep.jsx'

const TOTAL_STEPS = 7

export default function CharacterBuilder() {
  const [step, setStep] = useState(0)
  const [highestReached, setHighestReached] = useState(0)
  const { dispatch } = useCharacter()

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
        {step === 2 && <ClassStep {...stepProps} />}
        {step === 3 && <AbilityStep {...stepProps} />}
        {step === 4 && <SkillStep {...stepProps} />}
        {step === 5 && <FeatStep {...stepProps} />}
        {step === 6 && <SummaryStep onBack={back} onRestart={restart} />}
      </div>
    </div>
  )
}
