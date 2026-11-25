import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface FilterChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'border-brand-blue bg-brand-blue text-white'
          : 'border-brand-line bg-white text-brand-navy-soft hover:border-brand-blue/30 hover:text-brand-navy',
      )}
    >
      {children}
    </button>
  )
}
