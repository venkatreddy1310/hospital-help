import {
  Building2,
  CalendarDays,
  Clock3,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Appointment, AppointmentStatus } from '../../types/appointment'
import { formatDemoFee } from '../../utils/appointments'
import { formatLongDate, formatTimeSlot } from '../../utils/dateTime'
import { consultationTypeMeta, getSpecialtyLabel } from '../../utils/specialists'
import { Badge } from '../ui/Badge'
import { DoctorAvatar } from '../specialists/DoctorAvatar'

const statusTone: Record<AppointmentStatus, 'teal' | 'neutral' | 'critical'> = {
  upcoming: 'teal',
  completed: 'neutral',
  cancelled: 'critical',
}

const statusLabel: Record<AppointmentStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface AppointmentCardProps {
  appointment: Appointment
  status: AppointmentStatus
  onCancel: (appointment: Appointment) => void
}

export function AppointmentCard({
  appointment,
  status,
  onCancel,
}: AppointmentCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-brand-line bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <DoctorAvatar
          name={appointment.doctorName}
          specialty={appointment.specialty}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-brand-navy">
              {appointment.doctorName}
            </h3>
            <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-brand-navy-soft">
            {getSpecialtyLabel(appointment.specialty)}
          </p>
          <p className="mt-1 font-mono text-[9px] text-brand-navy-soft/70">
            {appointment.id}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1 text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            <CalendarDays className="size-3" aria-hidden="true" />
            Date
          </dt>
          <dd className="mt-0.5 font-semibold text-brand-navy">
            {formatLongDate(appointment.date)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            <Clock3 className="size-3" aria-hidden="true" />
            Time
          </dt>
          <dd className="mt-0.5 font-semibold text-brand-navy">
            {formatTimeSlot(appointment.time)}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            Patient
          </dt>
          <dd className="mt-0.5 font-semibold text-brand-navy">
            {appointment.patientName}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="flex items-center gap-1 text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            <Building2 className="size-3" aria-hidden="true" />
            Hospital
          </dt>
          <dd className="mt-0.5 font-semibold text-brand-navy">
            {appointment.hospitalName}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            Consultation
          </dt>
          <dd className="mt-0.5 font-semibold text-brand-navy">
            {consultationTypeMeta[appointment.consultationType].shortLabel}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            Demo fee
          </dt>
          <dd className="mt-0.5 font-semibold text-brand-navy">
            {formatDemoFee(appointment.fee)}
            <span className="ml-1 text-[9px] font-medium text-brand-navy-soft/70">
              not charged
            </span>
          </dd>
        </div>
      </dl>

      {status === 'completed' ? (
        <p className="mt-3 rounded-lg bg-brand-surface px-3 py-2 text-[10px] text-brand-navy-soft">
          This simulated appointment time has passed.
        </p>
      ) : null}

      {status === 'cancelled' ? (
        <p className="mt-3 rounded-lg bg-brand-critical-soft px-3 py-2 text-[10px] text-brand-critical">
          This simulated booking was cancelled. The demo slot has been released.
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-brand-line/80 pt-3">
        <Link
          to={`/specialists/${appointment.doctorId}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
        >
          <UserRound className="size-3.5" aria-hidden="true" />
          View doctor
        </Link>
        <span className="text-brand-line" aria-hidden="true">
          |
        </span>
        <Link
          to={`/hospitals/${appointment.hospitalId}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
        >
          <Building2 className="size-3.5" aria-hidden="true" />
          View hospital
        </Link>
        {status === 'upcoming' ? (
          <button
            type="button"
            onClick={() => onCancel(appointment)}
            className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-lg border border-brand-critical/20 px-2.5 py-1.5 text-[11px] font-semibold text-brand-critical transition-colors hover:bg-brand-critical-soft"
          >
            <XCircle className="size-3.5" aria-hidden="true" />
            Cancel
          </button>
        ) : null}
      </div>
    </article>
  )
}
