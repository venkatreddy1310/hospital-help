import { CalendarDays, CheckCircle2, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Appointment } from '../../types/appointment'
import { DemoNotice } from '../common/DemoNotice'
import { Badge } from '../ui/Badge'
import { BookingSummary } from './BookingSummary'

interface BookingConfirmationProps {
  appointment: Appointment
}

export function BookingConfirmation({ appointment }: BookingConfirmationProps) {
  return (
    <section className="rounded-3xl border border-brand-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-teal-soft text-brand-teal-dark">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Badge tone="teal">Demo booking confirmed</Badge>
          <h1
            id="booking-confirmation-heading"
            tabIndex={-1}
            className="mt-2 text-xl font-bold tracking-tight text-brand-navy focus:outline-none sm:text-2xl"
          >
            Your demo appointment is saved
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-brand-navy-soft/85">
            The appointment appears in My Appointments and is stored only in this browser.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-brand-teal/40 bg-brand-teal-soft/60 px-4 py-3">
        <p className="text-[9px] font-semibold tracking-[0.14em] text-brand-teal-dark uppercase">
          Demo appointment ID
        </p>
        <p className="mt-1 font-mono text-sm font-semibold text-brand-navy">
          {appointment.id}
        </p>
      </div>

      <BookingSummary
        className="mt-4"
        doctorName={appointment.doctorName}
        specialty={appointment.specialty}
        patientName={appointment.patientName}
        hospitalName={appointment.hospitalName}
        date={appointment.date}
        time={appointment.time}
        consultationType={appointment.consultationType}
        fee={appointment.fee}
        appointmentId={appointment.id}
      />

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/appointments"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark"
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          View My Appointments
        </Link>
        <Link
          to={`/specialists/${appointment.doctorId}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-surface"
        >
          <Stethoscope className="size-4" aria-hidden="true" />
          Back to doctor profile
        </Link>
      </div>

      <DemoNotice className="mt-4">
        This is a simulated booking. No real hospital appointment has been created, no
        clinician has been contacted, and no payment was taken. Availability and fees are
        fictional demo data.
      </DemoNotice>
    </section>
  )
}
