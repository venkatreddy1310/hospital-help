import type { ConsultationType, Specialty } from '../../types/domain'
import { formatDemoFee } from '../../utils/appointments'
import { cn } from '../../utils/cn'
import { formatLongDate, formatTimeSlot } from '../../utils/dateTime'
import { consultationTypeMeta, getSpecialtyLabel } from '../../utils/specialists'

interface BookingSummaryProps {
  doctorName: string
  specialty: Specialty
  patientName: string
  hospitalName: string
  date: string
  time: string
  consultationType: ConsultationType
  fee: number
  appointmentId?: string
  className?: string
}

export function BookingSummary({
  doctorName,
  specialty,
  patientName,
  hospitalName,
  date,
  time,
  consultationType,
  fee,
  appointmentId,
  className,
}: BookingSummaryProps) {
  const entries = [
    { label: 'Doctor', value: doctorName },
    { label: 'Specialty', value: getSpecialtyLabel(specialty) },
    { label: 'Patient', value: patientName },
    { label: 'Hospital', value: hospitalName },
    { label: 'Date', value: formatLongDate(date) },
    { label: 'Time', value: formatTimeSlot(time) },
    { label: 'Consultation', value: consultationTypeMeta[consultationType].label },
    { label: 'Demo fee', value: `${formatDemoFee(fee)} · not charged` },
    ...(appointmentId
      ? [{ label: 'Appointment ID', value: appointmentId }]
      : []),
  ]

  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl border border-brand-line bg-brand-surface/60 p-4 sm:grid-cols-3',
        className,
      )}
    >
      {entries.map((entry) => (
        <div key={entry.label} className="min-w-0">
          <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
            {entry.label}
          </dt>
          <dd className="mt-0.5 text-xs leading-relaxed font-semibold text-brand-navy">
            {entry.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
