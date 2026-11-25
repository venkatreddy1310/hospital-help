import {
  Building2,
  CalendarDays,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { AdminActivityArea, AdminActivityEntry } from '../../types/admin'
import { formatRelativeTimestamp } from '../../utils/dateTime'

const areaIcons: Record<AdminActivityArea, LucideIcon> = {
  hospital: Building2,
  doctor: Stethoscope,
  appointment: CalendarDays,
  insurance: ShieldCheck,
  patient: UsersRound,
  system: ScrollText,
}

interface AdminActivityListProps {
  activity: AdminActivityEntry[]
  limit?: number
  emptyMessage?: string
}

export function AdminActivityList({
  activity,
  limit,
  emptyMessage = 'No admin activity has been recorded in this demo yet.',
}: AdminActivityListProps) {
  const entries = [...activity]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit ?? activity.length)

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => {
        const Icon = areaIcons[entry.area]

        return (
          <li
            key={entry.id}
            className="flex items-start gap-2.5 rounded-xl border border-brand-line/80 px-3 py-2.5"
          >
            <span
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue"
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-xs font-semibold text-brand-navy">{entry.title}</p>
                <time
                  dateTime={entry.timestamp}
                  className="text-[10px] font-medium text-brand-navy-soft/70"
                >
                  {formatRelativeTimestamp(entry.timestamp)}
                </time>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-brand-navy-soft">
                {entry.detail}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
