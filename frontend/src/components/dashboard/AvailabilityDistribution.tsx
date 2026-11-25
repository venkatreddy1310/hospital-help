import type { AvailabilityStatus, Hospital } from '../../types/domain'
import { availabilityDotClasses, availabilityMeta } from '../../utils/availability'
import { cn } from '../../utils/cn'
import { getAvailabilityCounts } from '../../utils/dashboard'

const statuses: AvailabilityStatus[] = ['available', 'limited', 'full']

export function AvailabilityDistribution({ hospitals }: { hospitals: Hospital[] }) {
  const counts = getAvailabilityCounts(hospitals)
  const parts = statuses.map((status) => ({
    status,
    count: counts[status],
    percent: counts.total > 0 ? (counts[status] / counts.total) * 100 : 0,
  }))
  const summary = parts
    .map((part) => `${part.count} ${availabilityMeta[part.status].shortLabel.toLowerCase()}`)
    .join(', ')

  return (
    <section
      aria-labelledby="availability-heading"
      className="flex h-full flex-col rounded-2xl border border-brand-line bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2
            id="availability-heading"
            className="text-sm font-bold tracking-tight text-brand-navy"
          >
            Availability snapshot
          </h2>
          <p className="mt-0.5 text-[11px] text-brand-navy-soft">
            Across {counts.total} demo hospitals
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-teal-soft px-2 py-0.5 text-[10px] font-semibold text-brand-teal-dark">
          Simulated
        </span>
      </div>

      <div
        className="mt-3 flex h-3 overflow-hidden rounded-full bg-brand-surface"
        role="img"
        aria-label={`Simulated bed availability across ${counts.total} demo hospitals: ${summary}.`}
      >
        {parts
          .filter((part) => part.count > 0)
          .map((part) => (
            <span
              key={part.status}
              className={cn(
                'h-full first:rounded-l-full last:rounded-r-full',
                availabilityDotClasses[part.status],
              )}
              style={{ width: `${part.percent}%` }}
            />
          ))}
      </div>

      <ul className="mt-3 flex-1 space-y-1.5">
        {parts.map((part) => (
          <li
            key={part.status}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex items-center gap-2 font-medium text-brand-navy-soft">
              <span
                className={cn('size-2 rounded-full', availabilityDotClasses[part.status])}
                aria-hidden="true"
              />
              {availabilityMeta[part.status].label}
            </span>
            <span className="font-semibold text-brand-navy">
              {part.count}
              <span className="ml-1 font-medium text-brand-navy-soft">
                · {Math.round(part.percent)}%
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-brand-line pt-2.5 text-[10px] leading-relaxed text-brand-navy-soft/80">
        Based on the simulated availability status of each demo hospital.
      </p>
    </section>
  )
}
