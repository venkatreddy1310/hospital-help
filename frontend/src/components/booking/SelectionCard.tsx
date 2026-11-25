import { Check, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface SelectionCardProps {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  meta?: string
  icon?: LucideIcon
  badge?: ReactNode
}

export function SelectionCard({
  selected,
  onSelect,
  title,
  description,
  meta,
  icon: Icon,
  badge,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
        selected
          ? 'border-brand-blue bg-brand-blue-soft/60'
          : 'border-brand-line bg-white hover:border-brand-blue/30 hover:bg-brand-surface/60',
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            selected
              ? 'bg-brand-blue text-white'
              : 'bg-brand-blue-soft text-brand-blue',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-brand-navy">{title}</span>
          {badge}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-brand-navy-soft">
            {description}
          </span>
        ) : null}
        {meta ? (
          <span className="mt-1 block text-[10px] font-medium text-brand-navy-soft/80">
            {meta}
          </span>
        ) : null}
      </span>

      <span
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-brand-blue bg-brand-blue text-white'
            : 'border-brand-line bg-white text-transparent',
        )}
        aria-hidden="true"
      >
        <Check className="size-3" />
      </span>
    </button>
  )
}
