import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface QuickActionCardProps {
  to: string
  title: string
  description: string
  icon: LucideIcon
  tone?: 'primary' | 'default'
}

export function QuickActionCard({
  to,
  title,
  description,
  icon: Icon,
  tone = 'default',
}: QuickActionCardProps) {
  const isPrimary = tone === 'primary'

  return (
    <Link
      to={to}
      className={cn(
        'group flex items-start gap-3.5 rounded-2xl border p-4 shadow-sm transition',
        isPrimary
          ? 'border-brand-blue bg-brand-blue text-white hover:bg-brand-blue-dark'
          : 'border-brand-line bg-white hover:border-brand-blue/30 hover:shadow-md',
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          isPrimary ? 'bg-white/15 text-white' : 'bg-brand-teal-soft text-brand-teal-dark',
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">{title}</span>
          <ArrowUpRight
            className={cn(
              'size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
              isPrimary ? 'text-white/70' : 'text-brand-blue',
            )}
            aria-hidden="true"
          />
        </span>
        <span
          className={cn(
            'mt-1 block text-xs leading-relaxed',
            isPrimary ? 'text-white/80' : 'text-brand-navy-soft',
          )}
        >
          {description}
        </span>
      </span>
    </Link>
  )
}
