import { cn } from '../../utils/cn'

interface StepProgressProps {
  current: number
  steps: readonly string[]
  ariaLabel: string
}

export function StepProgress({ current, steps, ariaLabel }: StepProgressProps) {
  const label = steps[current - 1] ?? ''

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="font-semibold text-brand-navy">
          Step {current} of {steps.length}
        </p>
        <p className="font-medium text-brand-navy-soft">{label}</p>
      </div>
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current}
        aria-valuetext={`Step ${current} of ${steps.length}: ${label}`}
        className="mt-2 flex gap-1.5"
      >
        {steps.map((step, index) => (
          <span
            key={step}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index < current ? 'bg-brand-blue' : 'bg-brand-line',
            )}
          />
        ))}
      </div>
    </div>
  )
}
