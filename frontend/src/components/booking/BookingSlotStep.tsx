import { CalendarDays } from 'lucide-react'
import type { Appointment } from '../../types/appointment'
import type { Specialist } from '../../types/domain'
import { cn } from '../../utils/cn'
import { formatLongDate, formatTimeSlot } from '../../utils/dateTime'
import { getDoctorSlotAvailability } from '../../utils/specialistDirectory'

interface BookingSlotStepProps {
  specialist: Specialist
  date: string
  appointments: Appointment[]
  selectedTime: string | null
  onSelect: (time: string) => void
}

export function BookingSlotStep({
  specialist,
  date,
  appointments,
  selectedTime,
  onSelect,
}: BookingSlotStepProps) {
  const slots = getDoctorSlotAvailability(specialist, date, appointments)
  const hasAvailableSlot = slots.some((slot) => !slot.booked && !slot.past)

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 rounded-xl bg-brand-surface/70 px-3 py-2 text-xs font-medium text-brand-navy">
        <CalendarDays className="size-4 text-brand-blue" aria-hidden="true" />
        {formatLongDate(date)}
      </p>

      {hasAvailableSlot ? (
        <div
          role="group"
          aria-label="Choose an appointment time"
          className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              aria-pressed={selectedTime === slot.time}
              disabled={slot.booked || slot.past}
              onClick={() => onSelect(slot.time)}
              className={cn(
                'flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-2 text-xs font-semibold transition-colors',
                selectedTime === slot.time
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : 'border-brand-line bg-white text-brand-navy hover:border-brand-blue/30 hover:bg-brand-blue-soft/40',
                (slot.booked || slot.past) &&
                  'cursor-not-allowed border-brand-line bg-brand-surface text-brand-navy-soft/50 hover:border-brand-line hover:bg-brand-surface',
              )}
            >
              <span>{formatTimeSlot(slot.time)}</span>
              {slot.booked ? (
                <span className="mt-0.5 text-[9px] font-medium">Booked</span>
              ) : slot.past ? (
                <span className="mt-0.5 text-[9px] font-medium">Passed</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
          No demo slots remain on this date. Go back and choose another date.
        </p>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-brand-navy-soft/80">
        Slot availability is simulated and refreshes when you create or cancel a demo
        appointment in this browser.
      </p>
    </div>
  )
}
