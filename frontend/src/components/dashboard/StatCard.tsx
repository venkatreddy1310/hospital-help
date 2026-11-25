import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

type StatTone = 'blue' | 'teal'

const toneClasses: Record<StatTone, string> = {
  blue: 'bg-brand-blue-soft text-brand-blue',
  teal: 'bg-brand-teal-soft text-brand-teal-dark',
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  hint: string
  tone?: StatTone
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'blue' }: StatCardProps) {
  return (
    <div className="h-full rounded-2xl border border-brand-line bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-snug font-medium text-brand-navy-soft">{label}</p>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            toneClasses[tone],
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl leading-none font-bold tracking-tight text-brand-navy">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium text-brand-navy-soft/80">{hint}</p>
    </div>
  )
}
