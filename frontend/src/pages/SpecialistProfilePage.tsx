import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarDays,
  Languages,
  MapPin,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { DemoNotice } from '../components/common/DemoNotice'
import { DoctorAvatar } from '../components/specialists/DoctorAvatar'
import { SpecialistCard } from '../components/specialists/SpecialistCard'
import { Badge } from '../components/ui/Badge'
import { useAppointments } from '../context/appointmentStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useServiceLocation } from '../context/locationStore'
import { formatDemoFee } from '../utils/appointments'
import { cn } from '../utils/cn'
import {
  formatLongDate,
  formatRelativeDate,
  formatTimeSlot,
  getCalendarParts,
} from '../utils/dateTime'
import { getHospitalsForLocationFrom } from '../utils/demoData'
import {
  formatNextSlotLabel,
  getAvailableSlotCount,
  getDoctorSlotAvailability,
  getNextAvailableSlot,
  getSpecialistEntry,
  getSpecialistHospitals,
} from '../utils/specialistDirectory'
import {
  consultationTypeMeta,
  getSpecialtyLabel,
} from '../utils/specialists'

export function SpecialistProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { location } = useServiceLocation()
  const { hospitals: catalogHospitals, specialists } = useDemoCatalog()
  const { appointments } = useAppointments()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const hospitals = useMemo(
    () => getHospitalsForLocationFrom(catalogHospitals, location.id),
    [catalogHospitals, location.id],
  )
  const activeSpecialists = useMemo(
    () => specialists.filter((specialist) => specialist.active),
    [specialists],
  )
  const doctor = specialists.find((specialist) => specialist.id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const doctorHospitals = useMemo(
    () => (doctor ? getSpecialistHospitals(doctor, hospitals) : []),
    [doctor, hospitals],
  )

  const nextSlot = useMemo(
    () => (doctor ? getNextAvailableSlot(doctor, appointments) : null),
    [doctor, appointments],
  )

  const similarDoctors = useMemo(() => {
    if (!doctor) return []

    return activeSpecialists
      .filter(
        (specialist) =>
          specialist.id !== doctor.id &&
          (specialist.specialty === doctor.specialty ||
            specialist.hospitalIds.some((hospitalId) =>
              doctor.hospitalIds.includes(hospitalId),
            )),
      )
      .map((specialist) => getSpecialistEntry(specialist, hospitals, appointments))
      .sort(
        (a, b) =>
          Number(b.availableToday) - Number(a.availableToday) ||
          a.distanceKm - b.distanceKm,
      )
      .slice(0, 3)
  }, [activeSpecialists, doctor, hospitals, appointments])

  if (!doctor || !doctor.active) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          to="/specialists"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All specialists
        </Link>
        <Card className="bg-white">
          <h1 className="text-lg font-bold text-brand-navy">
            {doctor ? 'Doctor profile unavailable' : 'Doctor profile not found'}
          </h1>
          <p className="mt-2 text-sm text-brand-navy-soft">
            {doctor
              ? 'This fictional profile is currently inactive in the demo admin console, so it is hidden from the public directory.'
              : 'This profile is not part of the simulated demo directory.'}
          </p>
          <Link
            to="/specialists"
            className="mt-4 inline-flex rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Back to directory
          </Link>
        </Card>
      </div>
    )
  }

  const defaultDate =
    doctor.availability.find(
      (day) => getAvailableSlotCount(doctor, day.date, appointments) > 0,
    )?.date ??
    doctor.availability.find((day) => day.slots.length > 0)?.date ??
    doctor.availability[0]?.date ??
    ''
  const activeDate =
    selectedDate && doctor.availability.some((day) => day.date === selectedDate)
      ? selectedDate
      : defaultDate
  const daySlots = getDoctorSlotAvailability(doctor, activeDate, appointments)
  const availableCount = daySlots.filter(
    (slot) => !slot.booked && !slot.past,
  ).length
  const bookingHref = `/specialists/${doctor.id}/book`

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/specialists"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All specialists
        </Link>
        <Link
          to="/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy-soft transition-colors hover:text-brand-blue"
        >
          <CalendarDays className="size-3.5" aria-hidden="true" />
          My appointments
        </Link>
      </div>

      <section className="relative isolate overflow-hidden rounded-3xl bg-brand-navy p-5 text-white shadow-sm sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-12 size-64 rounded-full bg-brand-blue/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/4 size-64 rounded-full bg-brand-teal/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <DoctorAvatar
            name={doctor.name}
            specialty={doctor.specialty}
            size="lg"
            className="ring-4 ring-white/15"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-teal-soft px-2.5 py-1 text-[10px] font-semibold text-brand-teal-dark">
                Demo profile
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/85">
                {getSpecialtyLabel(doctor.specialty)}
              </span>
            </div>
            <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              {doctor.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              {doctor.experienceYears} years experience
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/70">
              {doctor.qualifications.join(' · ')}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              {nextSlot ? (
                <Link
                  to={bookingHref}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy shadow-sm transition-colors hover:bg-brand-surface"
                >
                  Book appointment
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/70">
                  No demo slots available
                </span>
              )}
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-white/75">
                <CalendarClock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {formatNextSlotLabel(nextSlot)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 sm:w-52">
            <p className="text-[9px] font-semibold tracking-[0.14em] text-white/60 uppercase">
              Demo consultation fee
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatDemoFee(doctor.consultationFee)}
            </p>
            <p className="text-[10px] text-white/65">Simulated · no payment</p>
            <p className="mt-3 text-[9px] font-semibold tracking-[0.14em] text-white/60 uppercase">
              Consultation mode
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {doctor.consultationTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/85"
                >
                  {consultationTypeMeta[type].shortLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Card className="mt-4 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
              <CalendarClock className="size-4 text-brand-teal-dark" aria-hidden="true" />
              Availability
            </h2>
            <p className="mt-1 text-[11px] text-brand-navy-soft">
              Preview the next five simulated clinic days.
            </p>
          </div>
          <Badge tone="neutral">Simulated slots</Badge>
        </div>

        <div
          role="group"
          aria-label="Preview availability by date"
          className="mt-3 grid grid-cols-5 gap-1.5"
        >
          {doctor.availability.map((day) => {
            const count = getAvailableSlotCount(doctor, day.date, appointments)
            const parts = getCalendarParts(day.date)
            const relativeLabel = formatRelativeDate(day.date)
            const baseSlots = day.slots.length
            const subtitle =
              baseSlots === 0
                ? 'No clinic'
                : count === 0
                  ? 'No open slots'
                  : `${count} open`

            return (
              <button
                key={day.date}
                type="button"
                aria-pressed={activeDate === day.date}
                aria-label={`${relativeLabel}, ${count} demo slots available`}
                disabled={baseSlots === 0}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  'flex min-h-20 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition-colors',
                  activeDate === day.date
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-brand-line bg-white text-brand-navy hover:border-brand-blue/30 hover:bg-brand-blue-soft/40',
                  baseSlots === 0 &&
                    'cursor-not-allowed opacity-45 hover:border-brand-line hover:bg-white',
                )}
              >
                <span className="text-[9px] font-semibold tracking-wide uppercase opacity-75">
                  {parts.weekday}
                </span>
                <span className="mt-0.5 text-lg leading-none font-bold">{parts.day}</span>
                <span className="mt-0.5 text-[9px] font-medium opacity-75">
                  {relativeLabel === 'Today' || relativeLabel === 'Tomorrow'
                    ? relativeLabel
                    : parts.month}
                </span>
                <span className="mt-1 text-[9px] leading-tight font-semibold">
                  {subtitle}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-brand-navy">
            {activeDate ? formatLongDate(activeDate) : 'No dates available'}
          </p>
          <p className="text-[10px] font-medium text-brand-navy-soft">
            {availableCount} of {daySlots.length} slots open
          </p>
        </div>

        {daySlots.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {daySlots.map((slot) => (
              <li key={slot.time}>
                <span
                  className={cn(
                    'flex min-h-11 flex-col items-center justify-center rounded-xl border px-2 py-2 text-xs font-semibold',
                    slot.booked || slot.past
                      ? 'border-brand-line bg-brand-surface text-brand-navy-soft/50'
                      : 'border-brand-teal/30 bg-brand-teal-soft/60 text-brand-teal-dark',
                  )}
                >
                  {formatTimeSlot(slot.time)}
                  {slot.booked ? (
                    <span className="mt-0.5 text-[9px] font-medium">Booked</span>
                  ) : slot.past ? (
                    <span className="mt-0.5 text-[9px] font-medium">Passed</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
            No clinic hours are listed for this demo day.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 border-t border-brand-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-brand-navy-soft/80">
            Booking a slot creates a simulated record only. No real appointment is made.
          </p>
          {nextSlot ? (
            <Link
              to={bookingHref}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              Book appointment
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="bg-white">
          <h2 className="text-sm font-semibold text-brand-navy">About this demo profile</h2>
          <p className="mt-2 text-xs leading-relaxed text-brand-navy-soft">{doctor.bio}</p>

          <h3 className="mt-4 text-[10px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
            Qualifications
          </h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {doctor.qualifications.map((qualification) => (
              <li
                key={qualification}
                className="rounded-lg bg-brand-surface px-2.5 py-1.5 text-[11px] font-medium text-brand-navy-soft"
              >
                {qualification}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
            <Languages className="size-3.5" aria-hidden="true" />
            Languages
          </h3>
          <p className="mt-1.5 text-xs text-brand-navy-soft">
            {doctor.languages.join(' · ')}
          </p>
        </Card>

        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <Building2 className="size-4 text-brand-blue" aria-hidden="true" />
            Associated demo hospitals
          </h2>
          <ul className="mt-3 space-y-2">
            {doctorHospitals.map((hospital) => (
              <li key={hospital.id}>
                <Link
                  to={`/hospitals/${hospital.id}`}
                  className="group flex items-start gap-2.5 rounded-xl border border-brand-line px-3 py-2.5 transition-colors hover:border-brand-blue/30 hover:bg-brand-surface/60"
                >
                  <Building2
                    className="mt-0.5 size-4 shrink-0 text-brand-blue"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-brand-navy group-hover:text-brand-blue">
                      {hospital.name}
                    </span>
                    <span className="mt-0.5 flex items-start gap-1 text-[10px] text-brand-navy-soft">
                      <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                      {hospital.area} · {hospital.distanceKm.toFixed(1)} km
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-0.5 size-3.5 shrink-0 text-brand-navy-soft/60 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] leading-relaxed text-brand-navy-soft/75">
            Hospital links use the existing simulated hospital directory.
          </p>
        </Card>
      </div>

      {similarDoctors.length > 0 ? (
        <section aria-labelledby="similar-doctors-heading" className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="similar-doctors-heading"
                className="text-base font-bold tracking-tight text-brand-navy"
              >
                Similar demo profiles
              </h2>
              <p className="mt-0.5 text-xs text-brand-navy-soft">
                Other fictional doctors sharing a specialty or demo hospital.
              </p>
            </div>
            <Link
              to="/specialists"
              className="text-xs font-semibold text-brand-blue hover:underline"
            >
              All specialists
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {similarDoctors.map((entry) =>
              entry.nearestHospital ? (
                <SpecialistCard
                  key={entry.specialist.id}
                  specialist={entry.specialist}
                  hospital={entry.nearestHospital}
                  distanceKm={entry.distanceKm}
                  nextSlot={entry.nextSlot}
                  extraHospitalCount={entry.hospitals.length - 1}
                />
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      <DemoNotice className="mt-4">
        This doctor, their qualifications, fee, languages, hospitals, and appointment slots
        are fictional demo data. No real clinician is listed or contactable, and no real
        appointment can be made through this preview.
      </DemoNotice>
    </div>
  )
}
