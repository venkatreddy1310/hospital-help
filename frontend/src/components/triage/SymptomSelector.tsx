import { Check } from 'lucide-react'
import type { SymptomId } from '../../types/triage'
import { cn } from '../../utils/cn'
import { symptomOptions } from '../../utils/triageData'

interface SymptomSelectorProps {
  selected: SymptomId[]
  onToggle: (symptom: SymptomId) => void
}

export function SymptomSelector({ selected, onToggle }: SymptomSelectorProps) {
  return (
    <div>
      <div role="group" aria-label="Symptoms" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {symptomOptions.map((option) => {
          const isSelected = selected.includes(option.id)

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option.id)}
              className={cn(
                'flex min-h-14 items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-colors',
                isSelected
                  ? 'border-brand-blue bg-brand-blue-soft text-brand-blue-dark ring-1 ring-brand-blue/25'
                  : 'border-brand-line bg-white text-brand-navy hover:border-brand-blue/30 hover:bg-brand-surface',
              )}
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  isSelected
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-brand-line bg-white text-transparent',
                )}
                aria-hidden="true"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-brand-navy-soft" aria-live="polite">
        {selected.length === 0
          ? 'Select all that apply.'
          : `${selected.length} symptom${selected.length === 1 ? '' : 's'} selected.`}
      </p>
    </div>
  )
}
