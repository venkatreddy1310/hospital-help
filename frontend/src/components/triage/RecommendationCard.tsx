import { ArrowRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface RecommendationCardProps {
  to: string
  icon: LucideIcon
  title: string
  subtitle: string
  badge?: ReactNode
  details?: string[]
  linkLabel?: string
  className?: string
}

export function RecommendationCard({
  to,
  icon: Icon,
  title,
  subtitle,
  badge,
  details,
  linkLabel = 'View details',
  className,
}: RecommendationCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex gap-3 rounded-2xl border border-brand-line bg-white p-4 shadow-sm transition-colors hover:border-brand-blue/30 hover:bg-brand-surface/50',
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-start justify-between gap-2">
          <span className="text-sm font-semibold text-brand-navy group-hover:text-brand-blue">
            {title}
          </span>
          {badge}
        </span>
        <span className="mt-0.5 block text-xs text-brand-navy-soft">{subtitle}</span>
        {details && details.length > 0 ? (
          <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-brand-navy-soft/85">
            {details.map((detail) => (
              <span key={detail} className="inline-flex items-center gap-1.5">
                <span
                  className="size-1 rounded-full bg-brand-navy-soft/40"
                  aria-hidden="true"
                />
                {detail}
              </span>
            ))}
          </span>
        ) : null}
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue">
          {linkLabel}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </span>
    </Link>
  )
}
