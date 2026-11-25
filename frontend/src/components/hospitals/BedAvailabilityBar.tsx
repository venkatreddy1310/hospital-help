import type { AvailabilityStatus } from '../../types/domain'
import { cn } from '../../utils/cn'

interface BedAvailabilityBarProps {
  available: number
  total: number
  status: AvailabilityStatus
  className?: string
}

export function BedAvailabilityBar({
  available,
  total,
  status,
  className,
}: BedAvailabilityBarProps) {
  const percent = total > 0 ? Math.round((available / total) * 100) : 0
  const fillClass =
    status === 'full'
      ? 'bg-brand-critical'
      : status === 'limited'
        ? 'bg-brand-warning'
        : 'bg-brand-teal'

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-[11px] font-medium text-brand-navy-soft">
        <span>Simulated availability</span>
        <span>{percent}% free</span>
      </div>
      <div
        className={cn(
          'mt-1.5 h-2.5 overflow-hidden rounded-full',
          status === 'full' ? 'bg-brand-critical-soft' : 'bg-brand-surface',
        )}
        role="img"
        aria-label={`${percent} percent of beds available: ${available} of ${total} beds free.`}
      >
        <div
          className={cn('h-full rounded-full transition-[width]', fillClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
