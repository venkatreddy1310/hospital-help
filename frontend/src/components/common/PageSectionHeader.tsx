import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface PageSectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageSectionHeader({
  title,
  description,
  action,
  className,
}: PageSectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div>
        <h2 className="text-base font-bold tracking-tight text-brand-navy sm:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-brand-navy-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
