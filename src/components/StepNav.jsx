const STEPS = [
  { id: 0, label: 'Name & Race' },
  { id: 1, label: 'Alignment' },
  { id: 2, label: 'Abilities' },
  { id: 3, label: 'Level Plan' },
  { id: 4, label: 'Summary' },
]

export default function StepNav({ current, onGoto, completedUpTo }) {
  return (
    <nav className="flex flex-wrap gap-1 mb-6">
      {STEPS.map(step => {
        const done = step.id < completedUpTo
        const active = step.id === current
        const accessible = step.id <= completedUpTo
        return (
          <button
            key={step.id}
            onClick={() => accessible && onGoto(step.id)}
            className={[
              'px-3 py-1.5 rounded text-sm transition-all border',
              active
                ? 'bg-auldwyn-gold text-auldwyn-dark border-auldwyn-gold font-bold'
                : done
                ? 'border-auldwyn-gold/50 text-auldwyn-gold/70 hover:border-auldwyn-gold hover:text-auldwyn-gold cursor-pointer'
                : accessible
                ? 'border-auldwyn-border text-auldwyn-muted hover:border-auldwyn-gold/50 cursor-pointer'
                : 'border-auldwyn-border/30 text-auldwyn-muted/30 cursor-not-allowed',
            ].join(' ')}
          >
            <span className="mr-1 text-xs">{done ? '✓' : step.id + 1}.</span>
            {step.label}
          </button>
        )
      })}
    </nav>
  )
}
