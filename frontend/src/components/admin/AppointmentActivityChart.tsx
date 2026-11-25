import { CalendarDays } from 'lucide-react'
import type { Appointment } from '../../types/appointment'
import {
  getAppointmentActivityDays,
  getAppointmentStatusCounts,
} from '../../utils/adminInsights'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { cn } from '../../utils/cn'

export function AppointmentActivityChart({ appointments }: { appointments: Appointment[] }) {
  const days = getAppointmentActivityDays(appointments)
  const counts = getAppointmentStatusCounts(appointments)
  const max = Math.max(1, ...days.map((day) => day.count))
  const scheduled = days.reduce((sum, day) => sum + day.count, 0)

  return (
    <Card className="bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <CalendarDays className="size-4 text-brand-teal-dark" aria-hidden="true" />
            Appointment activity
          </h2>
          <p className="mt-1 text-[11px] text-brand-navy-soft">
            Non-cancelled demo appointments for the next five local days.
          </p>
        </div>
        <Badge tone="neutral">Local demo records</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="teal">Upcoming {counts.upcoming}</Badge>
        <Badge tone="neutral">Completed {counts.completed}</Badge>
        <Badge tone="critical">Cancelled {counts.cancelled}</Badge>
      </div>

      <div
        className="mt-4 flex items-end gap-1.5 sm:gap-2"
        role="img"
        aria-label={`Demo appointments by next appointment date: ${days
          .map((day) => `${day.label}: ${day.count}`)
          .join('. ')}.`}
      >
        {days.map((day) => {
          const height = day.count === 0 ? 4 : Math.max(8, Math.round((day.count / max) * 100))

          return (
            <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-brand-navy-soft">
                {day.count}
              </span>
              <div className="flex h-28 w-full items-end overflow-hidden rounded-lg bg-brand-surface">
                <div
                  className={cn(
                    'w-full rounded-lg transition-[height]',
                    day.count === 0 ? 'bg-brand-line' : 'bg-brand-blue',
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="w-full truncate text-center text-[9px] font-medium text-brand-navy-soft">
                {day.label}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-brand-navy-soft/80">
        {scheduled === 0
          ? 'No demo appointments are scheduled in the next five days. Create one from the patient booking flow.'
          : `${scheduled} scheduled demo appointment${scheduled === 1 ? '' : 's'} across the next five days.`}
      </p>
    </Card>
  )
}
