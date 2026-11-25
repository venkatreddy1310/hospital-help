import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type BadgeTone = 'teal' | 'navy' | 'neutral' | 'critical'

const toneClasses: Record<BadgeTone, string> = {
  teal: 'bg-brand-teal-soft text-brand-teal-dark',
  navy: 'bg-brand-navy text-white',
  neutral: 'bg-brand-surface text-brand-navy-soft',
  critical: 'bg-brand-critical-soft text-brand-critical',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export function Badge({ children, tone = 'teal', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
