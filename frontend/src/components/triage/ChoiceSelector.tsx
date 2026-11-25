import { Check } from 'lucide-react'
import type { TriageOption } from '../../types/triage'
import { cn } from '../../utils/cn'

interface ChoiceSelectorProps<T extends string> {
  label: string
  options: ReadonlyArray<TriageOption<T>>
  value: T | null
  onChange: (value: T) => void
  columns?: 'one' | 'two'
}

export function ChoiceSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 'two',
}: ChoiceSelectorProps<T>) {
  return (
    <fieldset>
      <legend className="text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
        {label}
      </legend>
      <div
        className={cn(
          'mt-2 grid gap-2',
          columns === 'two' ? 'sm:grid-cols-2' : undefined,
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.id

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.id)}
              className={cn(
                'flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
                isSelected
                  ? 'border-brand-blue bg-brand-blue-soft ring-1 ring-brand-blue/25'
                  : 'border-brand-line bg-white hover:border-brand-blue/30 hover:bg-brand-surface',
              )}
            >
              <span>
                <span
                  className={cn(
                    'block text-sm font-semibold',
                    isSelected ? 'text-brand-blue-dark' : 'text-brand-navy',
                  )}
                >
                  {option.label}
                </span>
                {option.description ? (
                  <span className="mt-0.5 block text-xs text-brand-navy-soft">
                    {option.description}
                  </span>
                ) : null}
              </span>
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
    </fieldset>
  )
}
