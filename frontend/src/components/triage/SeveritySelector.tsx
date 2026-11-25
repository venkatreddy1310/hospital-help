import { Check } from 'lucide-react'
import type { SeverityId } from '../../types/triage'
import { cn } from '../../utils/cn'
import { severityOptions } from '../../utils/triageData'

interface SeveritySelectorProps {
  value: SeverityId | null
  onChange: (severity: SeverityId) => void
}

const severityTone: Record<
  SeverityId,
  { dot: string; selected: string; check: string }
> = {
  mild: {
    dot: 'bg-brand-teal',
    selected: 'border-brand-teal bg-brand-teal-soft ring-1 ring-brand-teal/25',
    check: 'border-brand-teal bg-brand-teal text-white',
  },
  moderate: {
    dot: 'bg-brand-warning',
    selected: 'border-brand-warning bg-brand-warning-soft ring-1 ring-brand-warning/25',
    check: 'border-brand-warning bg-brand-warning text-white',
  },
  severe: {
    dot: 'bg-brand-critical',
    selected: 'border-brand-critical bg-brand-critical-soft ring-1 ring-brand-critical/20',
    check: 'border-brand-critical bg-brand-critical text-white',
  },
}

export function SeveritySelector({ value, onChange }: SeveritySelectorProps) {
  return (
    <div role="group" aria-label="Self-reported severity" className="grid gap-2 sm:grid-cols-3">
      {severityOptions.map((option) => {
        const isSelected = value === option.id
        const tone = severityTone[option.id]

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex min-h-24 flex-col items-start gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors',
              isSelected
                ? tone.selected
                : 'border-brand-line bg-white hover:border-brand-blue/30 hover:bg-brand-surface',
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                <span className={cn('size-2.5 rounded-full', tone.dot)} aria-hidden="true" />
                {option.label}
              </span>
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  isSelected
                    ? tone.check
                    : 'border-brand-line bg-white text-transparent',
                )}
                aria-hidden="true"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            </span>
            <span className="text-xs leading-relaxed text-brand-navy-soft">
              {option.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
