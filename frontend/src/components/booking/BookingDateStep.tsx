import type { Appointment } from '../../types/appointment'
import type { Specialist } from '../../types/domain'
import { cn } from '../../utils/cn'
import {
  formatRelativeDate,
  getCalendarParts,
  getTodayISO,
} from '../../utils/dateTime'
import { getAvailableSlotCount } from '../../utils/specialistDirectory'

interface BookingDateStepProps {
  specialist: Specialist
  appointments: Appointment[]
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function BookingDateStep({
  specialist,
  appointments,
  selectedDate,
  onSelect,
}: BookingDateStepProps) {
  const today = getTodayISO()

  return (
    <div>
      <div
        role="group"
        aria-label="Choose an appointment date"
        className="grid grid-cols-5 gap-1.5"
      >
        {specialist.availability.map((day) => {
          const availableCount = getAvailableSlotCount(
            specialist,
            day.date,
            appointments,
          )
          const isDisabled = availableCount === 0
          const dateParts = getCalendarParts(day.date)
          const relativeLabel = formatRelativeDate(day.date, today)
          const subtitle =
            day.slots.length === 0
              ? 'No clinic'
              : availableCount === 0
                ? 'No open slots'
                : `${availableCount} slot${availableCount === 1 ? '' : 's'}`

          return (
            <button
              key={day.date}
              type="button"
              aria-pressed={selectedDate === day.date}
              aria-label={`${relativeLabel}, ${availableCount} demo slots available`}
              disabled={isDisabled}
              onClick={() => onSelect(day.date)}
              className={cn(
                'flex min-h-[92px] flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition-colors',
                selectedDate === day.date
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : 'border-brand-line bg-white text-brand-navy hover:border-brand-blue/30 hover:bg-brand-blue-soft/40',
                isDisabled && 'cursor-not-allowed opacity-45 hover:border-brand-line',
              )}
            >
              <span className="text-[9px] font-semibold tracking-wide uppercase opacity-75">
                {dateParts.weekday}
              </span>
              <span className="mt-0.5 text-lg leading-none font-bold">{dateParts.day}</span>
              <span className="mt-0.5 text-[9px] font-medium opacity-75">
                {relativeLabel === 'Today' || relativeLabel === 'Tomorrow'
                  ? relativeLabel
                  : dateParts.month}
              </span>
              <span className="mt-1.5 text-[9px] leading-tight font-semibold">
                {subtitle}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-brand-navy-soft/80">
        These are simulated clinic slots for the next five local calendar days. Fully
        booked and already-passed slots are not available to select.
      </p>
    </div>
  )
}
