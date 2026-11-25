import { availabilityDotClasses, availabilityToneClasses } from '../../utils/availability'
import type { AvailabilityStatus } from '../../types/domain'
import { availabilityMeta } from '../../utils/availability'
import { cn } from '../../utils/cn'

interface AvailabilityBadgeProps {
  status: AvailabilityStatus
  className?: string
}

export function AvailabilityBadge({ status, className }: AvailabilityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        availabilityToneClasses[status],
        className,
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', availabilityDotClasses[status])}
        aria-hidden="true"
      />
      {availabilityMeta[status].shortLabel}
    </span>
  )
}
